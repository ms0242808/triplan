import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { authRoutes } from "./routes/auth.js";
import { roomRoutes } from "./routes/rooms.js";
import { bookingRoutes } from "./routes/bookings.js";
import { runMigrations } from "./migrate.js";
import type { Vars } from "./auth.js";

const app = new Hono<{ Variables: Vars }>();

app.use("*", logger());

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

app.get("/api/health", c => c.json({ ok: true }));
app.route("/api/auth", authRoutes);
app.route("/api/rooms", roomRoutes);
app.route("/api/bookings", bookingRoutes);

// Serve the built frontend bundled into the image at ./public.
const here = dirname(fileURLToPath(import.meta.url));
const staticRoot = join(here, "..", "public");
const indexHtmlPath = join(staticRoot, "index.html");
if (existsSync(indexHtmlPath)) {
  const indexHtml = readFileSync(indexHtmlPath, "utf8");
  app.use("/*", serveStatic({ root: "./public" }));
  app.notFound(c => c.html(indexHtml));
}

const port = Number(process.env.PORT ?? 8080);

await runMigrations();

serve({ fetch: app.fetch, port }, info => {
  console.log(`Atrium API listening on http://localhost:${info.port}`);
});
