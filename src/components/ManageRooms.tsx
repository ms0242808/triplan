import { useState } from "react";
import { Icon, type IconName } from "./Icon";
import { TopBar } from "./Shell";
import { ROOMS, ICON_FOR_AMENITY, type Room } from "../data";
import type { Screen } from "../types";

type Props = { go: (s: Screen) => void };

const TODAY_BOOKINGS = [5, 3, 2, 4, 7, 1];
const HEAT_BARS = [0.6, 0.8, 0.4, 0.9, 0.5, 0.3, 0.7];

export const ManageRooms = ({ go: _go }: Props) => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editing, setEditing] = useState<Room | null>(null);
  const rooms = ROOMS;

  return (
    <>
      <TopBar
        title="Manage rooms"
        subtitle={`${rooms.length} rooms across 4 floors · Frieswings HQ`}
        actions={<button className="btn primary"><Icon.Plus /> Add room</button>}
      />

      <div className="card" style={{ padding: 12, marginBottom: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div className="seg">
          <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")}>Grid</button>
          <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>List</button>
        </div>
        <select className="select" style={{ width: 140, height: 36 }}>
          <option>All floors</option><option>Floor 1</option><option>Floor 2</option><option>Floor 3</option><option>Floor 4</option>
        </select>
        <select className="select" style={{ width: 160, height: 36 }}>
          <option>All amenities</option><option>Whiteboard</option><option>Video</option>
        </select>
        <select className="select" style={{ width: 140, height: 36 }}>
          <option>All status</option><option>Active</option><option>Maintenance</option>
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn"><Icon.Filter /> More filters</button>
        <button className="btn"><Icon.ChartUp /> Export</button>
      </div>

      {view === "grid" ? (
        <div className="grid-3">
          {rooms.map((r, i) => (
            <div key={r.id} className="card room-card" style={{ padding: 0 }}>
              <div className={`room-photo ${r.photo}`}>
                <div className="stripe" />
                <span className="pill free tag"><span className="dot" /> Active</span>
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
                  <button className="btn sm" style={{ background: "rgba(255,255,255,0.85)", height: 26, padding: "0 8px" }} onClick={() => setEditing(r)}>
                    <Icon.Edit size={12} /> Edit
                  </button>
                </div>
              </div>
              <div className="room-body">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <h4>{r.name}</h4>
                  <span className="pill">{r.rate}</span>
                </div>
                <div className="meta">{r.floor} · {r.cap} seats</div>
                <div className="room-amenities">
                  {r.amenities.map(a => {
                    const Ic = Icon[(ICON_FOR_AMENITY[a] || "Tv") as IconName];
                    return <span key={a} className="pill"><Ic size={12} /> {a}</span>;
                  })}
                </div>
                <div className="h-divider" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="muted" style={{ fontSize: 12 }}>Today: <strong style={{ color: "var(--text)" }}>{TODAY_BOOKINGS[i]} bookings</strong></div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {HEAT_BARS.map((h, j) => (
                      <div key={j} style={{ width: 4, height: 22 * h + 6, background: "var(--accent)", opacity: 0.4 + h * 0.6, borderRadius: 2 }} />
                    ))}
                  </div>
                </div>
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
              <div style={{ width: 90 }}>Status</div>
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
                <div style={{ width: 100, fontSize: 13, fontWeight: 500 }}>{r.cap} seats</div>
                <div style={{ width: 200, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {r.amenities.slice(0, 3).map(a => <span key={a} className="pill" style={{ fontSize: 10.5, height: 19 }}>{a}</span>)}
                  {r.amenities.length > 3 && <span className="pill" style={{ fontSize: 10.5, height: 19 }}>+{r.amenities.length - 3}</span>}
                </div>
                <div style={{ width: 90 }}><span className="pill free"><span className="dot" /> Active</span></div>
                <div style={{ width: 90, fontSize: 13 }}>{TODAY_BOOKINGS[i]} bookings</div>
                <div style={{ width: 80, display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  <button className="btn sm ghost" onClick={() => setEditing(r)}><Icon.Edit size={12} /></button>
                  <button className="btn sm ghost" style={{ color: "var(--busy)" }}><Icon.Trash size={12} /></button>
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
                <div className="field"><label>Name</label><input className="input" defaultValue={editing.name} /></div>
                <div className="field"><label>Capacity</label><input className="input" type="number" defaultValue={editing.cap} /></div>
              </div>
              <div className="field"><label>Floor / location</label><input className="input" defaultValue={editing.floor} /></div>
              <div className="field">
                <label>Amenities</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["Display", "Whiteboard", "Video", "Mic", "Coffee", "Wi-Fi"].map(a => {
                    const on = editing.amenities.includes(a);
                    const Ic = Icon[(ICON_FOR_AMENITY[a] || "Tv") as IconName];
                    return <button key={a} className="btn sm" style={{ background: on ? "var(--accent-soft)" : "var(--surface-2)", color: on ? "var(--accent-ink)" : "var(--text-2)" }}><Ic size={12} /> {a}</button>;
                  })}
                </div>
              </div>
              <div className="field">
                <label>Access</label>
                <select className="select"><option>Open to all employees</option><option>Approval required</option><option>Restricted to teams</option></select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
              <button className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn primary" onClick={() => setEditing(null)}>Save changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
