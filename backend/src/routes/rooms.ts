import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { query, queryOne } from "../db.js";
import { requireAuth, type Vars } from "../auth.js";

type Room = {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  photo: string;
  rate: string;
  color: string;
  amenities: string[];
  active: boolean;
};

type RoomBody = Partial<Omit<Room, "id">>;

export const roomRoutes = new Hono<{ Variables: Vars }>();

roomRoutes.get("/", async c => {
  const rows = await query<Room>(
    `SELECT id, name, floor, capacity, photo, rate, color, amenities, active
       FROM rooms
      WHERE active = TRUE
      ORDER BY name`
  );
  return c.json({ rooms: rows });
});

roomRoutes.get("/:id", async c => {
  const room = await queryOne<Room>(
    `SELECT id, name, floor, capacity, photo, rate, color, amenities, active
       FROM rooms WHERE id = $1`,
    [c.req.param("id")]
  );
  if (!room) throw new HTTPException(404, { message: "Room not found" });
  return c.json({ room });
});

roomRoutes.post("/", requireAuth, async c => {
  const body = await c.req.json() as RoomBody;
  if (!body.name || !body.floor || !body.capacity) {
    throw new HTTPException(400, { message: "name, floor, capacity required" });
  }
  const room = await queryOne<Room>(
    `INSERT INTO rooms (name, floor, capacity, photo, rate, color, amenities)
       VALUES ($1, $2, $3, COALESCE($4,'a'), COALESCE($5,'Standard'), COALESCE($6,'252'), COALESCE($7,'{}'))
     RETURNING id, name, floor, capacity, photo, rate, color, amenities, active`,
    [body.name, body.floor, body.capacity, body.photo ?? null, body.rate ?? null, body.color ?? null, body.amenities ?? null]
  );
  return c.json({ room }, 201);
});

roomRoutes.patch("/:id", requireAuth, async c => {
  const body = await c.req.json() as RoomBody;
  const room = await queryOne<Room>(
    `UPDATE rooms
        SET name      = COALESCE($2, name),
            floor     = COALESCE($3, floor),
            capacity  = COALESCE($4, capacity),
            photo     = COALESCE($5, photo),
            rate      = COALESCE($6, rate),
            color     = COALESCE($7, color),
            amenities = COALESCE($8, amenities),
            active    = COALESCE($9, active)
      WHERE id = $1
      RETURNING id, name, floor, capacity, photo, rate, color, amenities, active`,
    [
      c.req.param("id"),
      body.name ?? null,
      body.floor ?? null,
      body.capacity ?? null,
      body.photo ?? null,
      body.rate ?? null,
      body.color ?? null,
      body.amenities ?? null,
      body.active ?? null,
    ]
  );
  if (!room) throw new HTTPException(404, { message: "Room not found" });
  return c.json({ room });
});

roomRoutes.delete("/:id", requireAuth, async c => {
  const room = await queryOne<Room>(
    "UPDATE rooms SET active = FALSE WHERE id = $1 RETURNING id",
    [c.req.param("id")]
  );
  if (!room) throw new HTTPException(404, { message: "Room not found" });
  return c.json({ ok: true });
});
