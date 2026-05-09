import { randomBytes } from "node:crypto";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import bcrypt from "bcryptjs";
import { query, queryOne } from "./db.js";

const COOKIE_NAME = "atrium_session";
const SESSION_DAYS = 30;

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type Vars = { user: User };

export async function login(email: string, password: string): Promise<{ user: User; sessionId: string }> {
  type Row = User & { password_hash: string };
  const row = await queryOne<Row>(
    "SELECT id, email, name, role, password_hash FROM users WHERE email = $1",
    [email]
  );
  if (!row) throw new HTTPException(401, { message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) throw new HTTPException(401, { message: "Invalid credentials" });

  const sessionId = randomBytes(24).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await query(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
    [sessionId, row.id, expires]
  );
  const { password_hash: _ph, ...user } = row;
  return { user, sessionId };
}

export async function logout(sessionId: string) {
  await query("DELETE FROM sessions WHERE id = $1", [sessionId]);
}

export async function userFromSession(sessionId: string): Promise<User | null> {
  return queryOne<User>(
    `SELECT u.id, u.email, u.name, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.expires_at > NOW()`,
    [sessionId]
  );
}

export const requireAuth = createMiddleware<{ Variables: Vars }>(async (c, next) => {
  const sid = getCookie(c, COOKIE_NAME);
  const user = sid ? await userFromSession(sid) : null;
  if (!user) throw new HTTPException(401, { message: "Not authenticated" });
  c.set("user", user);
  await next();
});

export function setSessionCookie(c: Parameters<typeof setCookie>[0], sessionId: string) {
  setCookie(c, COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearSessionCookie(c: Parameters<typeof deleteCookie>[0]) {
  deleteCookie(c, COOKIE_NAME, { path: "/" });
}

export function getSessionCookie(c: Parameters<typeof getCookie>[0]): string | undefined {
  return getCookie(c, COOKIE_NAME);
}
