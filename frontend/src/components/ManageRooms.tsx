import { useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { TopBar } from "./Shell";
import { ICON_FOR_AMENITY } from "../data";
import { api, type Booking, type Room } from "../api";

const AMENITY_OPTIONS = ["Display", "Whiteboard", "Video", "Mic", "Coffee", "Wi-Fi"];

const startOfDay = (d = new Date()) => { const s = new Date(d); s.setHours(0, 0, 0, 0); return s; };
const endOfDay   = (d = new Date()) => { const e = new Date(d); e.setHours(23, 59, 59, 999); return e; };

type EditingState = {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  amenities: string[];
};

export const ManageRooms = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    try {
      const [r, b] = await Promise.all([
        api.rooms.list(),
        api.bookings.list({ from: startOfDay(), to: endOfDay() }),
      ]);
      setRooms(r.rooms);
      setTodayBookings(b.bookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  };

  useEffect(() => { void reload(); }, []);

  const bookingsPerRoom = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of todayBookings) m.set(b.room_id, (m.get(b.room_id) ?? 0) + 1);
    return m;
  }, [todayBookings]);

  const startEdit = (r: Room) => setEditing({ id: r.id, name: r.name, capacity: r.capacity, floor: r.floor, amenities: [...r.amenities] });

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      await api.rooms.update(editing.id, {
        name: editing.name,
        capacity: editing.capacity,
        floor: editing.floor,
        amenities: editing.amenities,
      });
      setEditing(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save room");
    } finally {
      setSaving(false);
    }
  };

  const deleteRoom = async (id: string) => {
    if (!confirm("Deactivate this room?")) return;
    try {
      await api.rooms.remove(id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const toggleAmenity = (a: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      amenities: editing.amenities.includes(a)
        ? editing.amenities.filter(x => x !== a)
        : [...editing.amenities, a],
    });
  };

  return (
    <>
      <TopBar
        title="Manage rooms"
        subtitle={`${rooms.length} rooms`}
        actions={<button className="btn primary"><Icon.Plus /> Add room</button>}
      />

      {error && <div className="card" style={{ marginBottom: 14, color: "var(--busy)" }}>{error}</div>}

      <div className="card" style={{ padding: 12, marginBottom: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div className="seg">
          <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")}>Grid</button>
          <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>List</button>
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn"><Icon.Filter /> More filters</button>
      </div>

      {view === "grid" ? (
        <div className="grid-3">
          {rooms.map((r, i) => (
            <div key={r.id} className="card room-card" style={{ padding: 0 }}>
              <div className={`room-photo ${r.photo}`}>
                <div className="stripe" />
                <span className="pill free tag"><span className="dot" /> Active</span>
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
                  <button className="btn sm" style={{ background: "rgba(255,255,255,0.85)", height: 26, padding: "0 8px" }} onClick={() => startEdit(r)}>
                    <Icon.Edit size={12} /> Edit
                  </button>
                </div>
              </div>
              <div className="room-body">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <h4>{r.name}</h4>
                  <span className="pill">{r.rate}</span>
                </div>
                <div className="meta">{r.floor} · {r.capacity} seats</div>
                <div className="room-amenities">
                  {r.amenities.map(a => {
                    const Ic = Icon[(ICON_FOR_AMENITY[a] || "Tv") as IconName];
                    return <span key={a} className="pill"><Ic size={12} /> {a}</span>;
                  })}
                </div>
                <div className="h-divider" />
                <div className="muted" style={{ fontSize: 12 }}>
                  Today: <strong style={{ color: "var(--text)" }}>{bookingsPerRoom.get(r.id) ?? 0} {(bookingsPerRoom.get(r.id) ?? 0) === 1 ? "booking" : "bookings"}</strong>
                </div>
                {/* unused index ref to satisfy thumb variant pattern */}
                <span style={{ display: "none" }}>{i}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="list">
            <div className="list-row" style={{ background: "var(--bg-2)", color: "var(--text-3)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <div style={{ width: 40 }} />
              <div className="grow">Room</div>
              <div style={{ width: 100 }}>Capacity</div>
              <div style={{ width: 200 }}>Amenities</div>
              <div style={{ width: 90 }}>Today</div>
              <div style={{ width: 80 }} />
            </div>
            {rooms.map((r, i) => (
              <div key={r.id} className="list-row">
                <div className={`thumb ${["", "b", "c", "d"][i % 4]}`} />
                <div className="grow">
                  <div className="title">{r.name}</div>
                  <div className="sub">{r.floor}</div>
                </div>
                <div style={{ width: 100, fontSize: 13, fontWeight: 500 }}>{r.capacity} seats</div>
                <div style={{ width: 200, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {r.amenities.slice(0, 3).map(a => <span key={a} className="pill" style={{ fontSize: 10.5, height: 19 }}>{a}</span>)}
                  {r.amenities.length > 3 && <span className="pill" style={{ fontSize: 10.5, height: 19 }}>+{r.amenities.length - 3}</span>}
                </div>
                <div style={{ width: 90, fontSize: 13 }}>{bookingsPerRoom.get(r.id) ?? 0} bookings</div>
                <div style={{ width: 80, display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  <button className="btn sm ghost" onClick={() => startEdit(r)}><Icon.Edit size={12} /></button>
                  <button className="btn sm ghost" style={{ color: "var(--busy)" }} onClick={() => void deleteRoom(r.id)}><Icon.Trash size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-back" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit {editing.name}</h2>
            <div className="sub">Update capacity, amenities, and access policies.</div>
            <div style={{ display: "grid", gap: 12 }}>
              <div className="grid-2">
                <div className="field"><label>Name</label>
                  <input className="input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div className="field"><label>Capacity</label>
                  <input className="input" type="number" value={editing.capacity} onChange={e => setEditing({ ...editing, capacity: Number(e.target.value) })} />
                </div>
              </div>
              <div className="field"><label>Floor / location</label>
                <input className="input" value={editing.floor} onChange={e => setEditing({ ...editing, floor: e.target.value })} />
              </div>
              <div className="field">
                <label>Amenities</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {AMENITY_OPTIONS.map(a => {
                    const on = editing.amenities.includes(a);
                    const Ic = Icon[(ICON_FOR_AMENITY[a] || "Tv") as IconName];
                    return (
                      <button
                        key={a}
                        className="btn sm"
                        onClick={() => toggleAmenity(a)}
                        style={{ background: on ? "var(--accent-soft)" : "var(--surface-2)", color: on ? "var(--accent-ink)" : "var(--text-2)" }}
                      >
                        <Ic size={12} /> {a}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
              <button className="btn ghost" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
              <button className="btn primary" onClick={() => void saveEdit()} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
