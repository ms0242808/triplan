import { Icon, type IconName } from "./Icon";
import { TopBar } from "./Shell";
import { ROOMS, ICON_FOR_AMENITY } from "../data";
import type { Screen } from "../types";

type Props = { go: (s: Screen) => void };

const ATTENDEES = [
  { name: "Maya Chen",    role: "Director, Operations", avatar: "MC", status: "accepted"  },
  { name: "Jordan Rao",   role: "Engineering Lead",     avatar: "JR", status: "accepted"  },
  { name: "Priya Devi",   role: "PM, Platform",         avatar: "PD", status: "tentative" },
  { name: "Tomás Silva",  role: "Design Director",      avatar: "TS", status: "accepted"  },
  { name: "Naomi Park",   role: "Finance Partner",      avatar: "NP", status: "pending"   },
];

const AGENDA = [
  "Review Q2 outcomes — Maya (15m)",
  "Align on Q3 priorities — Jordan (20m)",
  "Owners and dates — Priya (15m)",
  "Open questions — All (10m)",
];

export const EventView = ({ go: _go }: Props) => {
  const event = {
    title: "Q3 Roadmap Sync",
    room: ROOMS[0],
    date: "Today, May 9 2026",
    time: "10:00 AM – 11:00 AM PT",
    organizer: { name: "Eve Holt", role: "Workplace Admin", avatar: "EV" },
  };

  return (
    <>
      <TopBar
        title={event.title}
        subtitle={`${event.room.name} · ${event.date} · ${event.time}`}
        actions={<>
          <button className="btn"><Icon.Edit /> Edit</button>
          <button className="btn primary"><Icon.Pin /> Get directions</button>
        </>}
      />

      <div className="event-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className={`room-photo ${event.room.photo}`} style={{ height: 220 }}>
              <div className="stripe" />
              <span className="pill soon tag" style={{ top: 18, left: 18 }}><span className="dot" /> Starts in 14 minutes</span>
              <div style={{ position: "absolute", bottom: 18, left: 18, right: 18, color: "white", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{event.room.name}</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>{event.room.floor} · {event.room.cap} seats</div>
              </div>
            </div>
            <div style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {event.room.amenities.map(a => {
                const Ic = Icon[(ICON_FOR_AMENITY[a] || "Tv") as IconName];
                return (
                  <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "var(--bg-2)", boxShadow: "inset 0 0 0 1px var(--hairline)" }}>
                    <Ic /> <span style={{ fontSize: 12.5, fontWeight: 600 }}>{a}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Agenda</h3>
              <div className="grow" />
              <button className="btn sm ghost"><Icon.Edit size={12} /> Edit</button>
            </div>
            <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 10 }}>
              {AGENDA.map((a, i) => (
                <li key={i} style={{ fontSize: 13.5 }}>{a}</li>
              ))}
            </ol>
          </div>

          <div className="card">
            <div className="card-head"><h3>Notes</h3></div>
            <div style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.6 }}>
              Bring last quarter's metrics deck. We'll need the room's main display for the screen-share, and the side whiteboard for the open-questions parking lot. Coffee at 9:55.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <div className="card-head"><h3>Organizer</h3></div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>{event.organizer.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{event.organizer.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{event.organizer.role}</div>
              </div>
              <button className="btn sm">Message</button>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="card-head" style={{ padding: "var(--pad)", marginBottom: 0 }}>
              <h3>Attendees</h3>
              <span className="meta">{ATTENDEES.length + 1} invited · 4 accepted</span>
            </div>
            <div className="list">
              {ATTENDEES.map(a => (
                <div key={a.name} className="list-row">
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{a.avatar}</div>
                  <div className="grow">
                    <div className="title">{a.name}</div>
                    <div className="sub">{a.role}</div>
                  </div>
                  <span className={"pill " + (a.status === "accepted" ? "free" : a.status === "tentative" ? "soon" : "")}>
                    <span className="dot" /> {a.status[0].toUpperCase() + a.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Actions</h3></div>
            <div style={{ display: "grid", gap: 8 }}>
              <button className="btn" style={{ justifyContent: "flex-start", height: 42 }}><Icon.Mail /> Email all attendees</button>
              <button className="btn" style={{ justifyContent: "flex-start", height: 42 }}><Icon.Calendar /> Add to calendar</button>
              <button className="btn" style={{ justifyContent: "flex-start", height: 42 }}><Icon.Clock /> Reschedule</button>
              <button className="btn danger" style={{ justifyContent: "flex-start", height: 42 }}><Icon.X /> Cancel meeting</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
