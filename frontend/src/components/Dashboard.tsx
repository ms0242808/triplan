import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { TopBar } from "./Shell";
import { api, type Booking, type Room } from "../api";
import { useAuth } from "../auth";
import type { Screen } from "../types";

const HOUR_PX = 56;

const fmtTime = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const ampm = hh >= 12 ? "PM" : "AM";
  const dh = ((hh + 11) % 12) + 1;
  return `${dh}:${String(mm).padStart(2, "0")} ${ampm}`;
};

const hoursOf = (iso: string) => {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
};

const startOfDay = (d = new Date()) => { const s = new Date(d); s.setHours(0, 0, 0, 0); return s; };
const endOfDay   = (d = new Date()) => { const e = new Date(d); e.setHours(23, 59, 59, 999); return e; };

type ScheduleProps = { bookings: Booking[]; nowHour: number };

const ScheduleTrack = ({ bookings, nowHour }: ScheduleProps) => {
  const startHour = 8, endHour = 19;
  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h++) hours.push(h);
  const colors = ["", "alt", "alt2"];
  return (
    <div className="schedule" style={{ minHeight: HOUR_PX * (endHour - startHour + 1) }}>
      <div className="sched-times">
        {hours.map(h => <div key={h} className="t">{fmtTime(h).replace(":00", "")}</div>)}
      </div>
      <div className="sched-track" style={{ height: HOUR_PX * (endHour - startHour + 1) }}>
        {hours.map(h => <div key={h} className="hour" />)}
        {bookings.map((b, i) => {
          const s = hoursOf(b.starts_at);
          const e = hoursOf(b.ends_at);
          if (e <= startHour || s >= endHour + 1) return null;
          const top = (Math.max(s, startHour) - startHour) * HOUR_PX;
          const height = (Math.min(e, endHour + 1) - Math.max(s, startHour)) * HOUR_PX - 4;
          return (
            <div key={b.id} className={"event " + colors[i % colors.length]} style={{ top, height }}>
              <div>{b.title}</div>
              <small>{fmtTime(s)} – {fmtTime(e)} · {b.room_name}</small>
            </div>
          );
        })}
        {nowHour >= startHour && nowHour <= endHour + 1 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: (nowHour - startHour) * HOUR_PX, height: 0, borderTop: "1.5px solid oklch(0.62 0.16 25)", zIndex: 5 }}>
            <div style={{ position: "absolute", left: -4, top: -5, width: 10, height: 10, borderRadius: 50, background: "oklch(0.62 0.16 25)", boxShadow: "0 0 0 4px oklch(0.62 0.16 25 / 0.2)" }} />
            <div style={{ position: "absolute", right: 8, top: -10, fontSize: 10.5, fontWeight: 700, color: "white", background: "oklch(0.62 0.16 25)", padding: "1px 6px", borderRadius: 4 }}>
              NOW · {fmtTime(nowHour).replace(/ (AM|PM)/, "")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatTile = ({ num, label }: { num: string; label: string }) => (
  <div className="card stat">
    <div className="num">{num}</div>
    <div className="lbl">{label}</div>
  </div>
);

type Props = { go: (s: Screen) => void; openBooking: (id: string) => void };

export const Dashboard = ({ go, openBooking }: Props) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [myUpcoming, setMyUpcoming] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const nowHour = today.getHours() + today.getMinutes() / 60;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r, day, mine] = await Promise.all([
          api.rooms.list(),
          api.bookings.list({ from: startOfDay(), to: endOfDay() }),
          api.bookings.list({ from: new Date(), mine: true }),
        ]);
        if (cancelled) return;
        setRooms(r.rooms);
        setTodayBookings(day.bookings);
        setMyUpcoming(mine.bookings);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const next = myUpcoming[0];
  const minutesUntil = next ? Math.max(0, Math.round((new Date(next.starts_at).getTime() - Date.now()) / 60000)) : null;

  const isRoomFreeNow = (roomId: string) => {
    const now = Date.now();
    return !todayBookings.some(b =>
      b.room_id === roomId &&
      new Date(b.starts_at).getTime() <= now &&
      new Date(b.ends_at).getTime() > now
    );
  };
  const nextFreeAt = (roomId: string) => {
    const ongoing = todayBookings
      .filter(b => b.room_id === roomId && new Date(b.ends_at).getTime() > Date.now())
      .sort((a, b) => +new Date(a.ends_at) - +new Date(b.ends_at))[0];
    return ongoing ? new Date(ongoing.ends_at) : null;
  };

  const greeting = nowHour < 12 ? "morning" : nowHour < 18 ? "afternoon" : "evening";

  return (
    <>
      <TopBar
        title={`Good ${greeting}, ${user?.name?.split(" ")[0] ?? ""}`}
        subtitle={dateStr}
        actions={
          <button className="btn primary" onClick={() => go("book")}>
            <Icon.Plus /> Book a room
          </button>
        }
      />

      {error && <div className="card" style={{ marginBottom: 18, color: "var(--busy)" }}>{error}</div>}

      {next && (
        <div className="hero" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 360px" }}>
              <span className="pill soon" style={{ marginBottom: 14 }}>
                <span className="dot" /> {minutesUntil === 0 ? "Starting now" : `Starts in ${minutesUntil} minutes`}
              </span>
              <h2 style={{ margin: "10px 0 4px", fontSize: 28, letterSpacing: "-0.025em", fontWeight: 600 }}>{next.title}</h2>
              <div className="muted" style={{ fontSize: 14 }}>
                {next.room_name} · {fmtTime(hoursOf(next.starts_at))} – {fmtTime(hoursOf(next.ends_at))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <button className="btn primary" onClick={() => openBooking(next.id)}><Icon.Arrow /> Open event</button>
                <button className="btn"><Icon.Pin /> Get directions</button>
              </div>
            </div>
            {next.attendees.length > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex" }}>
                  {next.attendees.slice(0, 5).map((a, i) => (
                    <div key={a.initials + i} className="avatar" style={{ marginLeft: i ? -8 : 0, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 0 0 2px var(--surface-2)" }}>{a.initials}</div>
                  ))}
                </div>
                {next.attendees.length > 5 && <span className="muted" style={{ marginLeft: 12, fontSize: 13 }}>+{next.attendees.length - 5} more</span>}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 18 }}>
        <StatTile num={String(todayBookings.length)} label="Events today" />
        <StatTile num={String(myUpcoming.length)}    label="My upcoming" />
        <StatTile num={String(rooms.length)}         label="Active rooms" />
        <StatTile num={String(rooms.reduce((s, r) => s + r.capacity, 0))} label="Total capacity" />
      </div>

      <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
        <div className="card">
          <div className="card-head">
            <h3>Today's schedule</h3>
            <span className="meta">{rooms.map(r => r.name).slice(0, 4).join(" · ")}</span>
            <div className="grow" />
            <div className="seg">
              <button className="on">Day</button>
              <button>Week</button>
              <button>Month</button>
            </div>
          </div>
          {loading ? <div className="muted">Loading…</div> : <ScheduleTrack bookings={todayBookings} nowHour={nowHour} />}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card" style={{ padding: 0 }}>
            <div className="card-head" style={{ padding: "var(--pad)", marginBottom: 0 }}>
              <h3>Available now</h3>
              <div className="grow" />
              <button className="btn sm ghost" onClick={() => go("book")}>See all</button>
            </div>
            <div className="list">
              {rooms.slice(0, 4).map((r, i) => {
                const free = isRoomFreeNow(r.id);
                const freeAt = !free ? nextFreeAt(r.id) : null;
                return (
                  <div key={r.id} className="list-row">
                    <div className={"thumb " + ["", "b", "c", "d"][i % 4]} />
                    <div className="grow">
                      <div className="title">{r.name}</div>
                      <div className="sub">{r.floor} · {r.capacity} seats</div>
                    </div>
                    <span className={"pill " + (free ? "free" : "soon")}>
                      <span className="dot" /> {free ? "Free now" : freeAt ? `Free at ${fmtTime(freeAt.getHours() + freeAt.getMinutes() / 60)}` : "Busy"}
                    </span>
                    <button className="btn sm primary" onClick={() => go("book")}>Book</button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Quick actions</h3></div>
            <div className="grid-2">
              <button className="btn lg" style={{ flexDirection: "column", height: 88, gap: 6, alignItems: "flex-start", padding: 14 }} onClick={() => go("book")}>
                <Icon.Sparkle />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600 }}>Book a room</div>
                  <div className="muted" style={{ fontWeight: 400, fontSize: 11.5 }}>Find space for your team</div>
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
