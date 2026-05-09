import { Icon } from "./Icon";
import { TopBar } from "./Shell";
import { EVENTS, ROOMS, type EventItem } from "../data";
import type { Screen } from "../types";

type StatTileProps = { num: string; label: string; delta?: string; dir?: "up" | "down" };

const StatTile = ({ num, label, delta, dir }: StatTileProps) => (
  <div className="card stat">
    <div className="num">{num}</div>
    <div className="lbl">{label}</div>
    {delta && <div className={"delta " + (dir === "up" ? "up" : "down")}>{dir === "up" ? "▲" : "▼"} {delta}</div>}
  </div>
);

const fmt = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const ampm = hh >= 12 ? "PM" : "AM";
  const dh = ((hh + 11) % 12) + 1;
  return `${dh}:${String(mm).padStart(2, "0")} ${ampm}`;
};

type ScheduleTrackProps = { events: EventItem[]; startHour?: number; endHour?: number };

const ScheduleTrack = ({ events, startHour = 8, endHour = 19 }: ScheduleTrackProps) => {
  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h++) hours.push(h);
  const HOUR_PX = 56;
  return (
    <div className="schedule" style={{ minHeight: HOUR_PX * (endHour - startHour + 1) }}>
      <div className="sched-times">
        {hours.map(h => <div key={h} className="t">{fmt(h).replace(":00", "")}</div>)}
      </div>
      <div className="sched-track" style={{ height: HOUR_PX * (endHour - startHour + 1) }}>
        {hours.map(h => <div key={h} className="hour" />)}
        {events.map(ev => {
          const top = (ev.start - startHour) * HOUR_PX;
          const height = (ev.end - ev.start) * HOUR_PX - 4;
          return (
            <div key={ev.id} className={"event " + (ev.color || "")} style={{ top, height }}>
              <div>{ev.title}</div>
              <small>{fmt(ev.start)} – {fmt(ev.end)} · {ev.room}</small>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: (12.5 - startHour) * HOUR_PX, height: 0, borderTop: "1.5px solid oklch(0.62 0.16 25)", zIndex: 5 }}>
          <div style={{ position: "absolute", left: -4, top: -5, width: 10, height: 10, borderRadius: 50, background: "oklch(0.62 0.16 25)", boxShadow: "0 0 0 4px oklch(0.62 0.16 25 / 0.2)" }} />
          <div style={{ position: "absolute", right: 8, top: -10, fontSize: 10.5, fontWeight: 700, color: "white", background: "oklch(0.62 0.16 25)", padding: "1px 6px", borderRadius: 4 }}>NOW · 12:30</div>
        </div>
      </div>
    </div>
  );
};

type Props = { go: (s: Screen) => void };

export const Dashboard = ({ go }: Props) => {
  const today = new Date(2026, 4, 9);
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <TopBar
        title="Good afternoon, Eve"
        subtitle={dateStr + " · Frieswings HQ"}
        actions={
          <button className="btn primary" onClick={() => go("book")}>
            <Icon.Plus /> Book a room
          </button>
        }
      />

      <div className="hero" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 360px" }}>
            <span className="pill soon" style={{ marginBottom: 14 }}><span className="dot" /> Starts in 14 minutes</span>
            <h2 style={{ margin: "10px 0 4px", fontSize: 28, letterSpacing: "-0.025em", fontWeight: 600 }}>Design Critique</h2>
            <div className="muted" style={{ fontSize: 14 }}>Solstice · Floor 3 South · 11:30 – 12:30 PM</div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <button className="btn primary" onClick={() => go("event")}><Icon.Arrow /> Open event</button>
              <button className="btn"><Icon.Pin /> Get directions</button>
              <button className="btn ghost"><Icon.X /> Cancel</button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex" }}>
              {["MC","EV","JR","PD","TS"].map((n, i) => (
                <div key={n} className="avatar" style={{ marginLeft: i ? -8 : 0, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 0 0 2px var(--surface-2)" }}>{n}</div>
              ))}
            </div>
            <span className="muted" style={{ marginLeft: 12, fontSize: 13 }}>+3 more</span>
          </div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 18 }}>
        <StatTile num="3"   label="Events today"        delta="+1 vs avg" dir="up" />
        <StatTile num="68%" label="Room utilization"    delta="3% w/w"    dir="up" />
        <StatTile num="14m" label="Avg. saved booking"  delta="2m"        dir="up" />
        <StatTile num="2"   label="No-shows this week"  delta="1"         dir="down" />
      </div>

      <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
        <div className="card">
          <div className="card-head">
            <h3>Today's schedule</h3>
            <span className="meta">Solstice · Aurora · Compass · Lighthouse</span>
            <div className="grow" />
            <div className="seg">
              <button className="on">Day</button>
              <button>Week</button>
              <button>Month</button>
            </div>
          </div>
          <ScheduleTrack events={EVENTS} />
          <div className="legend" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="sw" style={{ background: "linear-gradient(160deg, oklch(0.66 0.14 252), oklch(0.55 0.14 270))" }} /> Hosted by you</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="sw" style={{ background: "linear-gradient(160deg, oklch(0.74 0.13 75), oklch(0.62 0.14 50))" }} /> Invited</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="sw" style={{ background: "linear-gradient(160deg, oklch(0.66 0.13 152), oklch(0.55 0.13 165))" }} /> Personal</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card" style={{ padding: 0 }}>
            <div className="card-head" style={{ padding: "var(--pad)", marginBottom: 0 }}>
              <h3>Available now</h3>
              <div className="grow" />
              <button className="btn sm ghost" onClick={() => go("book")}>See all</button>
            </div>
            <div className="list">
              {ROOMS.slice(0, 4).map((r, i) => (
                <div key={r.id} className="list-row">
                  <div className={"thumb " + ["", "b", "c", "d"][i % 4]} />
                  <div className="grow">
                    <div className="title">{r.name}</div>
                    <div className="sub">{r.floor} · {r.cap} seats</div>
                  </div>
                  <span className={"pill " + (i === 1 ? "soon" : "free")}>
                    <span className="dot" /> {i === 1 ? "Free at 1:00" : "Free now"}
                  </span>
                  <button className="btn sm primary" onClick={() => go("book")}>Book</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Quick actions</h3></div>
            <div className="grid-2">
              <button className="btn lg" style={{ flexDirection: "column", height: 88, gap: 6, alignItems: "flex-start", padding: 14 }} onClick={() => go("book")}>
                <Icon.Sparkle />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600 }}>Find a room with AI</div>
                  <div className="muted" style={{ fontWeight: 400, fontSize: 11.5 }}>“6 people, with whiteboard, near me”</div>
                </div>
              </button>
              <button className="btn lg" style={{ flexDirection: "column", height: 88, gap: 6, alignItems: "flex-start", padding: 14 }} onClick={() => go("manage")}>
                <Icon.Rooms />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600 }}>Manage rooms</div>
                  <div className="muted" style={{ fontWeight: 400, fontSize: 11.5 }}>Hours, amenities, access</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
