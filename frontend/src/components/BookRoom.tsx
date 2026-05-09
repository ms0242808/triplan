import { useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { TopBar } from "./Shell";
import { ICON_FOR_AMENITY } from "../data";
import { api, type Attendee, type Booking, type Room } from "../api";
import { useAuth } from "../auth";
import type { Screen } from "../types";

// 30-minute slots starting 8:00 → "8:00", "8:30", ..., "4:30" (16:30)
const SLOT_COUNT = 18;
const SLOT_START_HOUR = 8;
const slotToHours = (i: number) => SLOT_START_HOUR + i * 0.5;
const slotLabel = (i: number) => {
  const h = slotToHours(i);
  const hh = Math.floor(h);
  const mm = (h - hh) * 60;
  const dh = ((hh + 11) % 12) + 1;
  return `${dh}:${String(mm).padStart(2, "0")}`;
};

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("") || "·";

type StepIndicatorProps = { step: number };
const StepIndicator = ({ step }: StepIndicatorProps) => (
  <div className="steps">
    {["Find a room", "Pick a time", "Invite & details", "Confirm"].map((s, i) => (
      <span key={s} style={{ display: "contents" }}>
        <div className={"step " + (i < step ? "done" : i === step ? "active" : "")}>
          <div className="num">{i < step ? "✓" : i + 1}</div>
          <span>{s}</span>
        </div>
        {i < 3 && <div className="bar" />}
      </span>
    ))}
  </div>
);

const RoomTile = ({ room, selected, onClick }: { room: Room; selected: boolean; onClick: () => void }) => (
  <div className="card room-card" style={{ outline: selected ? "2px solid var(--accent)" : "none", cursor: "pointer", padding: 0 }} onClick={onClick}>
    <div className={`room-photo ${room.photo}`}>
      <div className="stripe" />
      <span className="pill free tag"><span className="dot" /> Active</span>
      {selected && (
        <div style={{ position: "absolute", top: 12, right: 12, width: 26, height: 26, borderRadius: 50, background: "var(--accent)", color: "white", display: "grid", placeItems: "center", boxShadow: "0 4px 12px -4px oklch(0.55 0.14 252 / 0.6)" }}>
          <Icon.Check size={14} sw={2.4} />
        </div>
      )}
    </div>
    <div className="room-body">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <h4>{room.name}</h4>
        <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{room.capacity} seats</span>
      </div>
      <div className="meta">{room.floor}</div>
      <div className="room-amenities">
        {room.amenities.slice(0, 4).map(a => {
          const Ic = Icon[(ICON_FOR_AMENITY[a] || "Tv") as IconName];
          return <span key={a} className="pill"><Ic size={12} /> {a}</span>;
        })}
      </div>
    </div>
  </div>
);

const Row = ({ icon, k, v }: { icon: IconName; k: string; v: string }) => {
  const Ic = Icon[icon];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid var(--hairline)" }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--bg-2)", color: "var(--text-2)" }}><Ic size={14} /></div>
      <div style={{ flex: 1 }}>
        <div className="muted" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{v}</div>
      </div>
    </div>
  );
};

type Props = { go: (s: Screen) => void; onBooked: (bookingId: string, summary: string) => void };

export const BookRoom = ({ go, onBooked }: Props) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [filter, setFilter] = useState({ size: "any", floor: "any", amen: "any" });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [date] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [slotRange, setSlotRange] = useState<[number, number]>([4, 5]);
  const [title, setTitle] = useState("Q3 Roadmap Sync");
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [agenda, setAgenda] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [privateMtg, setPrivate] = useState(false);
  const [roomBookings, setRoomBookings] = useState<Booking[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.rooms.list()
      .then(r => setRooms(r.rooms))
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load rooms"));
  }, []);

  // Fetch existing bookings for the chosen room + date so we can grey out taken slots.
  useEffect(() => {
    if (!room) { setRoomBookings([]); return; }
    const from = new Date(date);
    const to = new Date(date); to.setHours(23, 59, 59, 999);
    api.bookings.list({ room_id: room.id, from, to })
      .then(r => setRoomBookings(r.bookings))
      .catch(() => setRoomBookings([]));
  }, [room, date]);

  const takenSlots = useMemo(() => {
    const taken = new Set<number>();
    for (const b of roomBookings) {
      const s = new Date(b.starts_at);
      const e = new Date(b.ends_at);
      const sHr = s.getHours() + s.getMinutes() / 60;
      const eHr = e.getHours() + e.getMinutes() / 60;
      for (let i = 0; i < SLOT_COUNT; i++) {
        const sh = slotToHours(i);
        const eh = slotToHours(i + 1);
        if (sh < eHr && eh > sHr) taken.add(i);
      }
    }
    return taken;
  }, [roomBookings]);

  const dateLabel = useMemo(() => date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }), [date]);

  const filteredRooms = rooms.filter(r => {
    if (filter.size !== "any") {
      if (filter.size === "12+") { if (r.capacity < 12) return false; }
      else if (r.capacity > parseInt(filter.size)) return false;
    }
    return true;
  });

  const addAttendee = () => {
    const name = attendeeInput.trim();
    if (!name) return;
    setAttendees(prev => [...prev, { name, initials: initialsOf(name) }]);
    setAttendeeInput("");
  };

  const submit = async () => {
    if (!room) return;
    setSubmitting(true);
    setError(null);
    const startsAt = new Date(date); startsAt.setHours(0, 0, 0, 0);
    startsAt.setMinutes(slotToHours(slotRange[0]) * 60);
    const endsAt = new Date(date); endsAt.setHours(0, 0, 0, 0);
    endsAt.setMinutes(slotToHours(slotRange[1] + 1) * 60);
    try {
      const r = await api.bookings.create({
        room_id: room.id,
        title,
        agenda: agenda || null,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        is_private: privateMtg,
        is_recurring: recurring,
        attendees,
      });
      const summary = `Booked ${room.name} · ${slotLabel(slotRange[0])} – ${slotLabel(slotRange[1] + 1)}`;
      onBooked(r.booking.id, summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const Step0 = (
    <>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 38, borderRadius: 10, background: "var(--bg-2)", boxShadow: "inset 0 0 0 1px var(--hairline)" }}>
            <Icon.Sparkle />
            <input style={{ border: 0, background: "transparent", outline: "none", width: 320, fontSize: 13 }} placeholder="Search by capacity, floor, or amenities" />
          </div>
          <div style={{ flex: 1 }} />
          <select className="select" value={filter.size} onChange={e => setFilter(f => ({ ...f, size: e.target.value }))} style={{ width: 160, height: 38 }}>
            <option value="any">Any size</option>
            <option value="4">Up to 4</option>
            <option value="6">Up to 6</option>
            <option value="10">Up to 10</option>
            <option value="12+">12 or more</option>
          </select>
          <select className="select" value={filter.floor} onChange={e => setFilter(f => ({ ...f, floor: e.target.value }))} style={{ width: 160, height: 38 }}>
            <option value="any">All floors</option>
            <option>Floor 1</option><option>Floor 2</option><option>Floor 3</option><option>Floor 4</option>
          </select>
          <select className="select" value={filter.amen} onChange={e => setFilter(f => ({ ...f, amen: e.target.value }))} style={{ width: 180, height: 38 }}>
            <option value="any">Any amenities</option>
            <option>Whiteboard</option><option>Video</option><option>Coffee</option>
          </select>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="card muted">No rooms match your filters.</div>
      ) : (
        <div className="grid-3">
          {filteredRooms.map(r => (
            <RoomTile key={r.id} room={r} selected={room?.id === r.id} onClick={() => setRoom(r)} />
          ))}
        </div>
      )}
    </>
  );

  const renderSlot = (i: number) => {
    const taken = takenSlots.has(i);
    const sel = i === slotRange[0];
    const inRange = i > slotRange[0] && i <= slotRange[1];
    return (
      <button
        key={i}
        className={"slot " + (taken ? "taken" : sel ? "selected" : inRange ? "range" : "")}
        disabled={taken}
        onClick={() => setSlotRange([i, Math.min(i + 1, SLOT_COUNT - 1)])}
      >
        {slotLabel(i)}
      </button>
    );
  };

  const Step1 = (
    <div className="book-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18 }}>
      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <h3>Pick a time</h3>
            <div className="grow" />
            <div className="seg">
              <button className="on">Today</button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <Icon.Calendar />
            <div style={{ fontWeight: 600 }}>{dateLabel}</div>
            <span className="muted">·</span>
            <span className="muted">Local time</span>
          </div>

          <div style={{ marginBottom: 8, fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Morning</div>
          <div className="slots" style={{ marginBottom: 14 }}>
            {Array.from({ length: 9 }, (_, i) => renderSlot(i))}
          </div>
          <div style={{ marginBottom: 8, fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Afternoon</div>
          <div className="slots">
            {Array.from({ length: SLOT_COUNT - 9 }, (_, i) => renderSlot(i + 9))}
          </div>

          <div className="h-divider" />

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Duration (slots)</label>
              <select
                className="select"
                value={slotRange[1] - slotRange[0] + 1}
                onChange={e => setSlotRange([slotRange[0], Math.min(slotRange[0] + Number(e.target.value) - 1, SLOT_COUNT - 1)])}
              >
                <option value={1}>30 minutes</option>
                <option value={2}>1 hour</option>
                <option value={3}>1.5 hours</option>
                <option value={4}>2 hours</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, alignSelf: "flex-end", padding: "0 4px 8px" }}>
              <div className={"switch " + (recurring ? "on" : "")} onClick={() => setRecurring(r => !r)} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Recurring weekly</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ position: "sticky", top: 8, alignSelf: "start" }}>
        <div className="card-head"><h3>Selection</h3></div>
        <div className={`room-photo ${room?.photo || "a"}`} style={{ height: 110, borderRadius: 12, position: "relative", marginBottom: 14 }}>
          <div className="stripe" />
        </div>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{room?.name || "—"}</div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>{room?.floor} · {room?.capacity} seats</div>
        <div style={{ display: "grid", gap: 8 }}>
          <Row icon="Calendar" k="Date" v={dateLabel} />
          <Row icon="Clock"    k="Time" v={`${slotLabel(slotRange[0])} – ${slotLabel(slotRange[1] + 1)}`} />
          <Row icon="Users"    k="Capacity" v={`${room?.capacity ?? 0} seats`} />
        </div>
      </div>
    </div>
  );

  const Step2 = (
    <div className="card">
      <div className="card-head"><h3>Event details</h3></div>
      <div style={{ display: "grid", gap: 14 }}>
        <div className="field">
          <label>Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Attendees</label>
          <div className="input" style={{ display: "flex", alignItems: "center", gap: 6, height: "auto", minHeight: 44, padding: 6, flexWrap: "wrap" }}>
            {attendees.map((a, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, height: 28, padding: "0 4px", borderRadius: 999, background: "var(--bg-2)", boxShadow: "inset 0 0 0 1px var(--hairline)", fontSize: 12, fontWeight: 600 }}>
                <span className="avatar" style={{ width: 20, height: 20, fontSize: 9 }}>{a.initials}</span>
                {a.name}
                <button onClick={() => setAttendees(att => att.filter((_, j) => j !== i))} style={{ width: 18, height: 18, padding: 0, borderRadius: 50, color: "var(--text-3)" }}><Icon.X size={12} sw={2.4} /></button>
              </span>
            ))}
            <input
              style={{ flex: 1, border: 0, outline: 0, background: "transparent", minWidth: 140, fontSize: 13, height: 28 }}
              placeholder="Add a name and press Enter…"
              value={attendeeInput}
              onChange={e => setAttendeeInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addAttendee(); } }}
              onBlur={addAttendee}
            />
          </div>
        </div>
        <div className="field">
          <label>Agenda (optional)</label>
          <textarea className="textarea" value={agenda} onChange={e => setAgenda(e.target.value)} placeholder="Notes, links, things to cover" />
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Visibility</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 12px", height: 40, background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--hairline)", borderRadius: 10 }}>
              <Icon.Lock />
              <span style={{ fontSize: 13, flex: 1 }}>{privateMtg ? "Private — title hidden from others" : "Public — title visible on display"}</span>
              <div className={"switch " + (privateMtg ? "on" : "")} onClick={() => setPrivate(p => !p)} />
            </div>
          </div>
          <div className="field">
            <label>Organizer</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 12px", height: 40, background: "var(--bg-2)", boxShadow: "inset 0 0 0 1px var(--hairline)", borderRadius: 10, fontSize: 13 }}>
              <Icon.Users /> {user?.name ?? "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Step3 = (
    <div className="card">
      <div className="card-head">
        <h3>You're all set</h3>
        <div className="grow" />
        <span className="pill free"><span className="dot" /> Available</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 22, alignItems: "start" }}>
        <div className={`room-photo ${room?.photo || "a"}`} style={{ height: 180, borderRadius: 16, position: "relative" }}>
          <div className="stripe" />
        </div>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, letterSpacing: "-0.02em" }}>{title}</h2>
          <div className="muted" style={{ marginBottom: 14 }}>{room?.name} · {room?.floor}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Row icon="Calendar" k="Date"      v={dateLabel} />
            <Row icon="Clock"    k="Time"      v={`${slotLabel(slotRange[0])} – ${slotLabel(slotRange[1] + 1)}`} />
            <Row icon="Users"    k="Attendees" v={`${attendees.length + 1} people`} />
            <Row icon="Pin"      k="Capacity"  v={`${room?.capacity ?? 0} seats`} />
          </div>
        </div>
      </div>
    </div>
  );

  const next = () => {
    if (step === 0 && !room) return;
    if (step === 3) { void submit(); return; }
    setStep(s => s + 1);
  };
  const back = () => step === 0 ? go("dashboard") : setStep(s => s - 1);

  return (
    <>
      <TopBar title="Book a room" subtitle="Find space for your team in seconds." />

      <StepIndicator step={step} />

      {error && (
        <div className="card" style={{ marginBottom: 14, color: "var(--busy)" }}>{error}</div>
      )}

      {step === 0 && Step0}
      {step === 1 && Step1}
      {step === 2 && Step2}
      {step === 3 && Step3}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <button className="btn" onClick={back} disabled={submitting}><Icon.Chevron size={14} /> Back</button>
        <div style={{ display: "flex", gap: 8 }}>
          {step < 3 && <button className="btn ghost" onClick={() => go("dashboard")}>Cancel</button>}
          <button className="btn primary" onClick={next} disabled={(step === 0 && !room) || submitting}>
            {step === 3 ? (submitting ? "Booking…" : "Confirm booking") : "Continue"} <Icon.Arrow size={14} />
          </button>
        </div>
      </div>
    </>
  );
};
