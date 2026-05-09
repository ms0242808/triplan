import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { query, queryOne } from "../db.js";
import { requireAuth, type Vars } from "../auth.js";

type Booking = {
  id: string;
  room_id: string;
  organizer_id: string;
  title: string;
  agenda: string | null;
  starts_at: Date;
  ends_at: Date;
  is_private: boolean;
  is_recurring: boolean;
  attendees: unknown;
  room_name?: string;
  organizer_name?: string;
};

type BookingBody = {
  room_id?: string;
  title?: string;
  agenda?: string | null;
  starts_at?: string;
  ends_at?: string;
  is_private?: boolean;
  is_recurring?: boolean;
  attendees?: unknown;
};

export const bookingRoutes = new Hono<{ Variables: Vars }>();

bookingRoutes.use("*", requireAuth);

bookingRoutes.get("/", async c => {
  const from = c.req.query("from");
  const to = c.req.query("to");
  const roomId = c.req.query("room_id");
  const mine = c.req.query("mine") === "true";

  const conditions: string[] = [];
  const params: (string | Date)[] = [];
  if (from) { conditions.push(`b.ends_at >= $${params.length + 1}`); params.push(new Date(from)); }
  if (to)   { conditions.push(`b.starts_at <= $${params.length + 1}`); params.push(new Date(to)); }
  if (roomId) { conditions.push(`b.room_id = $${params.length + 1}`); params.push(roomId); }
  if (mine) { conditions.push(`b.organizer_id = $${params.length + 1}`); params.push(c.get("user").id); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await query<Booking>(
    `SELECT b.id, b.room_id, b.organizer_id, b.title, b.agenda,
            b.starts_at, b.ends_at, b.is_private, b.is_recurring, b.attendees,
            r.name AS room_name, u.name AS organizer_name
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       JOIN users u ON u.id = b.organizer_id
       ${where}
   ORDER BY b.starts_at`,
    params
  );
  return c.json({ bookings: rows });
});

bookingRoutes.post("/", async c => {
  const body = await c.req.json() as BookingBody;
  if (!body.room_id || !body.title || !body.starts_at || !body.ends_at) {
    throw new HTTPException(400, { message: "room_id, title, starts_at, ends_at required" });
  }
  const startsAt = new Date(body.starts_at);
  const endsAt = new Date(body.ends_at);
  if (!(endsAt > startsAt)) {
    throw new HTTPException(400, { message: "ends_at must be after starts_at" });
  }

  const conflict = await queryOne<{ id: string }>(
    `SELECT id FROM bookings
      WHERE room_id = $1 AND starts_at < $3 AND ends_at > $2
      LIMIT 1`,
    [body.room_id, startsAt, endsAt]
  );
  if (conflict) throw new HTTPException(409, { message: "Time slot already booked" });

  const booking = await queryOne<Booking>(
    `INSERT INTO bookings
       (room_id, organizer_id, title, agenda, starts_at, ends_at, is_private, is_recurring, attendees)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, FALSE), COALESCE($8, FALSE), COALESCE($9, '[]'::jsonb))
     RETURNING id, room_id, organizer_id, title, agenda, starts_at, ends_at, is_private, is_recurring, attendees`,
    [
      body.room_id,
      c.get("user").id,
      body.title,
      body.agenda ?? null,
      startsAt,
      endsAt,
      body.is_private ?? null,
      body.is_recurring ?? null,
      body.attendees ? JSON.stringify(body.attendees) : null,
    ]
  );
  return c.json({ booking }, 201);
});

bookingRoutes.get("/:id", async c => {
  const booking = await queryOne<Booking>(
    `SELECT b.id, b.room_id, b.organizer_id, b.title, b.agenda,
            b.starts_at, b.ends_at, b.is_private, b.is_recurring, b.attendees,
            r.name AS room_name, u.name AS organizer_name
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       JOIN users u ON u.id = b.organizer_id
      WHERE b.id = $1`,
    [c.req.param("id")]
  );
  if (!booking) throw new HTTPException(404, { message: "Booking not found" });
  return c.json({ booking });
});

bookingRoutes.delete("/:id", async c => {
  const userId = c.get("user").id;
  const result = await queryOne<{ id: string }>(
    "DELETE FROM bookings WHERE id = $1 AND organizer_id = $2 RETURNING id",
    [c.req.param("id"), userId]
  );
  if (!result) throw new HTTPException(404, { message: "Booking not found" });
  return c.json({ ok: true });
});
