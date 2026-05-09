import { useState } from "react";
import { Icon, type IconName } from "./Icon";
import { TopBar } from "./Shell";
import { ROOMS, ICON_FOR_AMENITY, type Room } from "../data";
import type { Screen } from "../types";

const TIME_SLOTS = [
  "8:00", "8:30", "9:00", "9:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "1:00", "1:30",
  "2:00", "2:30", "3:00", "3:30", "4:00", "4:30",
];
const TAKEN_INDEX = new Set([0, 1, 8, 9, 14]);

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

type RoomTileProps = { room: Room; selected: boolean; onClick: () => void };

const RoomTile = ({ room, selected, onClick }: RoomTileProps) => (
  <div className="card room-card" style={{ outline: selected ? "2px solid var(--accent)" : "none", cursor: "pointer", padding: 0 }} onClick={onClick}>
    <div className={`room-photo ${room.photo}`}>
      <div className="stripe" />
      <span className="pill free tag"><span className="dot" /> Free now</span>
      {selected && (
        <div style={{ position: "absolute", top: 12, right: 12, width: 26, height: 26, borderRadius: 50, background: "var(--accent)", color: "white", display: "grid", placeItems: "center", boxShadow: "0 4px 12px -4px oklch(0.55 0.14 252 / 0.6)" }}>
          <Icon.Check size={14} sw={2.4} />
        </div>
      )}
    </div>
    <div className="room-body">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <h4>{room.name}</h4>
        <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{room.cap} seats</span>
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

type RowProps = { icon: IconName; k: string; v: string };

const Row = ({ icon, k, v }: RowProps) => {
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

type Props = { go: (s: Screen) => void; onBooked: () => void; defaultStep?: number };

const ATTENDEE_NAMES: Record<string, string> = { MC: "Maya Chen", JR: "Jordan Rao", PD: "Priya Devi" };

export const BookRoom = ({ go, onBooked, defaultStep = 0 }: Props) => {
  const [step, setStep] = useState(defaultStep);
  const [filter, setFilter] = useState({ size: "any", floor: "any", amen: "any" });
  const [room, setRoom] = useState<Room | null>(null);
  const [date] = useState("Today, May 9");
  const [slotRange, setSlotRange] = useState<[number, number]>([4, 5]);
  const [title, setTitle] = useState("Q3 Roadmap Sync");
  const [attendees, setAttendees] = useState(["MC", "JR", "PD"]);
  const [agenda, setAgenda] = useState("• Review Q2 outcomes\n• Align on Q3 priorities\n• Owners and dates");
  const [recurring, setRecurring] = useState(false);
  const [privateMtg, setPrivate] = useState(false);

  const filteredRooms = ROOMS.filter(r => {
    if (filter.size !== "any") {
      if (filter.size === "12+") { if (r.cap < 12) return false; }
      else if (r.cap > parseInt(filter.size)) return false;
    }
    return true;
  });

  const Step0 = (
    <>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 38, borderRadius: 10, background: "var(--bg-2)", boxShadow: "inset 0 0 0 1px var(--hairline)" }}>
            <Icon.Sparkle />
            <input style={{ border: 0, background: "transparent", outline: "none", width: 320, fontSize: 13 }} placeholder="Try: 8 people with whiteboard, near my desk, 2pm–3pm" />
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
            <option>Whiteboard</option><option>Video conferencing</option><option>Coffee station</option>
          </select>
        </div>
      </div>

      <div className="grid-3">
        {filteredRooms.map(r => (
          <RoomTile key={r.id} room={r} selected={room?.id === r.id} onClick={() => setRoom(r)} />
        ))}
      </div>
    </>
  );

  const Step1 = (
    <div className="book-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18 }}>
      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <h3>Pick date and time</h3>
            <div className="grow" />
            <div className="seg">
              <button className="on">Today</button>
              <button>Tomorrow</button>
              <button>Pick date</button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <Icon.Calendar />
            <div style={{ fontWeight: 600 }}>{date}</div>
            <span className="muted">·</span>
            <span className="muted">All times in PT</span>
          </div>

          <div style={{ marginBottom: 8, fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Morning</div>
          <div className="slots" style={{ marginBottom: 14 }}>
            {TIME_SLOTS.slice(0, 9).map((t, i) => {
              const taken = TAKEN_INDEX.has(i);
              const sel = i === slotRange[0];
              const inRange = i > slotRange[0] && i <= slotRange[1];
              return (
                <button key={t} className={"slot " + (taken ? "taken" : sel ? "selected" : inRange ? "range" : "")} disabled={taken}
                  onClick={() => setSlotRange([i, Math.min(i + 1, TIME_SLOTS.length - 1)])}>
                  {t}
                </button>
              );
            })}
          </div>
          <div style={{ marginBottom: 8, fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Afternoon</div>
          <div className="slots">
            {TIME_SLOTS.slice(9).map((t, i) => {
              const idx = i + 9;
              const taken = TAKEN_INDEX.has(idx);
              const sel = idx === slotRange[0];
              const inRange = idx > slotRange[0] && idx <= slotRange[1];
              return (
                <button key={t} className={"slot " + (taken ? "taken" : sel ? "selected" : inRange ? "range" : "")} disabled={taken}
                  onClick={() => setSlotRange([idx, Math.min(idx + 1, TIME_SLOTS.length - 1)])}>
                  {t}
                </button>
              );
            })}
          </div>

          <div className="h-divider" />

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Duration</label>
              <select className="select" defaultValue="1h">
                <option value="30m">30 minutes</option>
                <option value="1h">1 hour</option>
                <option value="1.5h">1.5 hours</option>
                <option value="2h">2 hours</option>
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
        <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>{room?.floor} · {room?.cap} seats</div>
        <div style={{ display: "grid", gap: 8 }}>
          <Row icon="Calendar" k="Date" v={date} />
          <Row icon="Clock" k="Time" v={`${TIME_SLOTS[slotRange[0]]} – ${TIME_SLOTS[slotRange[1]]} PM`} />
          <Row icon="Users" k="Capacity" v={`${room?.cap || 0} seats`} />
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
            {attendees.map(a => (
              <span key={a} style={{ display: "flex", alignItems: "center", gap: 6, height: 28, padding: "0 4px 0 4px", borderRadius: 999, background: "var(--bg-2)", boxShadow: "inset 0 0 0 1px var(--hairline)", fontSize: 12, fontWeight: 600 }}>
                <span className="avatar" style={{ width: 20, height: 20, fontSize: 9 }}>{a}</span>
                {ATTENDEE_NAMES[a]}
                <button onClick={() => setAttendees(att => att.filter(x => x !== a))} style={{ width: 18, height: 18, padding: 0, borderRadius: 50, color: "var(--text-3)" }}><Icon.X size={12} sw={2.4} /></button>
              </span>
            ))}
            <input style={{ flex: 1, border: 0, outline: 0, background: "transparent", minWidth: 140, fontSize: 13, height: 28 }} placeholder="Add people by name or email…" />
          </div>
        </div>
        <div className="field">
          <label>Agenda (optional)</label>
          <textarea className="textarea" value={agenda} onChange={e => setAgenda(e.target.value)} />
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
            <label>Catering</label>
            <select className="select"><option>None</option><option>Coffee & tea</option><option>Light lunch</option><option>Custom request</option></select>
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
            <Row icon="Calendar" k="Date" v={date} />
            <Row icon="Clock" k="Time" v={`${TIME_SLOTS[slotRange[0]]} – ${TIME_SLOTS[slotRange[1]]} PM`} />
            <Row icon="Users" k="Attendees" v={`${attendees.length + 1} people`} />
            <Row icon="Pin" k="Capacity" v={`${room?.cap} seats`} />
          </div>
        </div>
      </div>
    </div>
  );

  const next = () => {
    if (step === 0 && !room) return;
    if (step === 3) { onBooked(); return; }
    setStep(s => s + 1);
  };
  const back = () => step === 0 ? go("dashboard") : setStep(s => s - 1);

  return (
    <>
      <TopBar title="Book a room" subtitle="Find space for your team in seconds." />

      <StepIndicator step={step} />

      {step === 0 && Step0}
      {step === 1 && Step1}
      {step === 2 && Step2}
      {step === 3 && Step3}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <button className="btn" onClick={back}><Icon.Chevron size={14} /> Back</button>
        <div style={{ display: "flex", gap: 8 }}>
          {step < 3 && <button className="btn ghost" onClick={() => go("dashboard")}>Cancel</button>}
          <button className="btn primary" onClick={next} disabled={step === 0 && !room}>
            {step === 3 ? "Confirm booking" : "Continue"} <Icon.Arrow size={14} />
          </button>
        </div>
      </div>
    </>
  );
};
