import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  clearSessionCookie,
  getSessionCookie,
  login,
  logout,
  requireAuth,
  setSessionCookie,
  userFromSession,
  type Vars,
} from "../auth.js";

export const authRoutes = new Hono<{ Variables: Vars }>();

authRoutes.post("/login", async c => {
  const body = await c.req.json().catch(() => null) as { email?: string; password?: string } | null;
  if (!body?.email || !body?.password) {
    throw new HTTPException(400, { message: "email and password are required" });
  }
  const { user, sessionId } = await login(body.email, body.password);
  setSessionCookie(c, sessionId);
  return c.json({ user });
});

authRoutes.post("/logout", async c => {
  const sid = getSessionCookie(c);
  if (sid) await logout(sid);
  clearSessionCookie(c);
  return c.json({ ok: true });
});

authRoutes.get("/me", requireAuth, c => {
  return c.json({ user: c.get("user") });
});

authRoutes.get("/session", async c => {
  const sid = getSessionCookie(c);
  const user = sid ? await userFromSession(sid) : null;
  return c.json({ user });
});
