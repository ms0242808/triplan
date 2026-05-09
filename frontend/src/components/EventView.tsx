import { useEffect, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { TopBar } from "./Shell";
import { ICON_FOR_AMENITY } from "../data";
import { api, type Booking, type Room } from "../api";

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

const minutesUntil = (iso: string) =>
  Math.round((new Date(iso).getTime() - Date.now()) / 60000);

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("") || "·";

type Props = { bookingId: string | null };

export const EventView = ({ bookingId }: Props) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [list, setList] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(bookingId);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const mine = await api.bookings.list({ from: new Date(), mine: true });
        if (cancelled) return;
        setList(mine.bookings);
        const targetId = selectedId ?? mine.bookings[0]?.id ?? null;
        setSelectedId(targetId);
        if (!targetId) {
          setBooking(null);
          setRoom(null);
          return;
        }
        const b = await api.bookings.get(targetId);
        if (cancelled) return;
        setBooking(b.booking);
        const r = await api.rooms.get(b.booking.room_id);
        if (cancelled) return;
        setRoom(r.room);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId]);

  const cancelBooking = async () => {
    if (!booking) return;
    if (!confirm("Cancel this meeting?")) return;
    try {
      await api.bookings.remove(booking.id);
      setSelectedId(null);
      setBooking(null);
      const mine = await api.bookings.list({ from: new Date(), mine: true });
      setList(mine.bookings);
      if (mine.bookings[0]) setSelectedId(mine.bookings[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="My events" subtitle="Loading…" />
      </>
    );
  }

  if (!booking || !room) {
    return (
      <>
        <TopBar title="My events" subtitle="Upcoming bookings will show up here." />
        {error && <div className="card" style={{ color: "var(--busy)" }}>{error}</div>}
        <div className="card muted">No upcoming events. Book a room to get started.</div>
      </>
    );
  }

  const mins = minutesUntil(booking.starts_at);
  const startBadge =
    mins <= 0 && Date.now() < new Date(booking.ends_at).getTime() ? "In progress"
      : mins <= 0 ? "Past"
      : mins < 60 ? `Starts in ${mins} minutes`
      : `Starts in ${Math.round(mins / 60)} h`;

  return (
    <>
      <TopBar
        title={booking.title}
        subtitle={`${room.name} · ${fmtDate(booking.starts_at)} · ${fmtTime(booking.starts_at)} – ${fmtTime(booking.ends_at)}`}
        actions={<>
          <button className="btn"><Icon.Edit /> Edit</button>
          <button className="btn primary"><Icon.Pin /> Get directions</button>
        </>}
      />

      {error && <div className="card" style={{ marginBottom: 14, color: "var(--busy)" }}>{error}</div>}

      <div className="event-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className={`room-photo ${room.photo}`} style={{ height: 220 }}>
              <div className="stripe" />
              <span className="pill soon tag" style={{ top: 18, left: 18 }}><span className="dot" /> {startBadge}</span>
              <div style={{ position: "absolute", bottom: 18, left: 18, right: 18, color: "white", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{room.name}</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>{room.floor} · {room.capacity} seats</div>
              </div>
            </div>
            <div style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {room.amenities.map(a => {
                const Ic = Icon[(ICON_FOR_AMENITY[a] || "Tv") as IconName];
                return (
                  <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "var(--bg-2)", boxShadow: "inset 0 0 0 1px var(--hairline)" }}>
                    <Ic /> <span style={{ fontSize: 12.5, fontWeight: 600 }}>{a}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {booking.agenda && (
            <div className="card">
              <div className="card-head"><h3>Agenda</h3></div>
              <div style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{booking.agenda}</div>
            </div>
          )}

          {list.length > 1 && (
            <div className="card" style={{ padding: 0 }}>
              <div className="card-head" style={{ padding: "var(--pad)", marginBottom: 0 }}>
                <h3>Other upcoming events</h3>
              </div>
              <div className="list">
                {list.filter(b => b.id !== booking.id).map(b => (
                  <button key={b.id} className="list-row" onClick={() => setSelectedId(b.id)} style={{ textAlign: "left", width: "100%", background: "transparent" }}>
                    <div style={{ width: 48, textAlign: "center" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{new Date(b.starts_at).toLocaleString("en-US", { month: "short" }).toUpperCase()}</div>
                      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1 }}>{new Date(b.starts_at).getDate()}</div>
                    </div>
                    <div className="grow">
                      <div className="title">{b.title}</div>
                      <div className="sub">{b.room_name} · {fmtTime(b.starts_at)} – {fmtTime(b.ends_at)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <div className="card-head"><h3>Organizer</h3></div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>{booking.organizer_name ? initialsOf(booking.organizer_name) : "·"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{booking.organizer_name ?? "Organizer"}</div>
                <div className="muted" style={{ fontSize: 12 }}>{booking.is_recurring ? "Recurring weekly" : "Single event"}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="card-head" style={{ padding: "var(--pad)", marginBottom: 0 }}>
              <h3>Attendees</h3>
              <span className="meta">{booking.attendees.length + 1} invited</span>
            </div>
            {booking.attendees.length === 0 ? (
              <div className="muted" style={{ padding: "0 var(--pad) var(--pad)" }}>Just you so far.</div>
            ) : (
              <div className="list">
                {booking.attendees.map((a, i) => (
                  <div key={i} className="list-row">
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{a.initials}</div>
                    <div className="grow">
                      <div className="title">{a.name}</div>
                    </div>
                    <span className={"pill " + (a.status === "going" ? "free" : a.status === "tentative" ? "soon" : "")}>
                      <span className="dot" /> {a.status ? a.status[0]!.toUpperCase() + a.status.slice(1) : "Invited"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-head"><h3>Actions</h3></div>
            <div style={{ display: "grid", gap: 8 }}>
              <button className="btn" style={{ justifyContent: "flex-start", height: 42 }}><Icon.Mail /> Email all attendees</button>
              <button className="btn" style={{ justifyContent: "flex-start", height: 42 }}><Icon.Calendar /> Add to calendar</button>
              <button className="btn danger" style={{ justifyContent: "flex-start", height: 42 }} onClick={() => void cancelBooking()}><Icon.X /> Cancel meeting</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
