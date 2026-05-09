import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import type { Tweaks } from "../types";

type SettingRowProps = { icon?: IconName; title: string; desc?: string; control?: ReactNode };

const SettingRow = ({ icon, title, desc, control }: SettingRowProps) => {
  const Ic = icon ? Icon[icon] : null;
  return (
    <div className="list-row">
      {Ic && <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-2)", display: "grid", placeItems: "center", boxShadow: "inset 0 0 0 1px var(--hairline)" }}><Ic size={16} /></div>}
      <div className="grow">
        <div className="title">{title}</div>
        {desc && <div className="sub">{desc}</div>}
      </div>
      {control}
    </div>
  );
};

export const ProfilePanel = () => (
  <>
    <div className="card-head"><h3>Profile</h3><span className="meta">How others see you</span></div>
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
      <div className="avatar" style={{ width: 64, height: 64, fontSize: 22, borderRadius: 18 }}>EV</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 16 }}>Eve Holt</div>
        <div className="muted" style={{ fontSize: 13 }}>Workplace Admin · Frieswings HQ</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn sm">Change photo</button>
          <button className="btn sm ghost">Remove</button>
        </div>
      </div>
    </div>
    <div className="grid-2">
      <div className="field"><label>Display name</label><input className="input" defaultValue="Eve Holt" /></div>
      <div className="field"><label>Pronouns</label><input className="input" defaultValue="she/her" /></div>
      <div className="field"><label>Work email</label><input className="input" defaultValue="eve@frieswings.com" /></div>
      <div className="field"><label>Phone</label><input className="input" defaultValue="+1 (415) 555-0142" /></div>
    </div>
  </>
);

export const NotifPanel = () => {
  const [s, set] = useState({ email: true, push: true, sms: false, digest: true });
  return (
    <>
      <div className="card-head"><h3>Notifications</h3><span className="meta">When and how Atrium alerts you</span></div>
      <div className="list" style={{ marginLeft: -20, marginRight: -20 }}>
        <SettingRow icon="Mail"     title="Email"             desc="Confirmations and invitations"      control={<div className={"switch " + (s.email  ? "on" : "")} onClick={() => set(p => ({ ...p, email:  !p.email }))} />} />
        <SettingRow icon="Bell"     title="Push notifications" desc="Browser and Mac menu bar"          control={<div className={"switch " + (s.push   ? "on" : "")} onClick={() => set(p => ({ ...p, push:   !p.push }))} />} />
        <SettingRow icon="Mic"      title="SMS reminders"     desc="15 minutes before each meeting"     control={<div className={"switch " + (s.sms    ? "on" : "")} onClick={() => set(p => ({ ...p, sms:    !p.sms }))} />} />
        <SettingRow icon="Calendar" title="Daily digest"      desc="Sent at 8:00 AM your time"          control={<div className={"switch " + (s.digest ? "on" : "")} onClick={() => set(p => ({ ...p, digest: !p.digest }))} />} />
      </div>
    </>
  );
};

type PreferencesProps = { tweaks: Tweaks; setTweak: (k: keyof Tweaks, v: string) => void };

export const PreferencesPanel = ({ tweaks, setTweak }: PreferencesProps) => {
  const HUES = [
    { hue: "252", name: "Blue" },
    { hue: "152", name: "Green" },
    { hue: "75",  name: "Amber" },
    { hue: "320", name: "Plum" },
    { hue: "25",  name: "Coral" },
  ];
  return (
    <>
      <div className="card-head"><h3>Preferences</h3><span className="meta">Make Atrium feel like yours</span></div>
      <div className="grid-2">
        <div className="field">
          <label>Time zone</label>
          <select className="select" defaultValue="PT"><option value="PT">America / Los Angeles (PT)</option><option>America / New York (ET)</option><option>Europe / London (GMT)</option></select>
        </div>
        <div className="field">
          <label>Time format</label>
          <select className="select"><option>12-hour (1:30 PM)</option><option>24-hour (13:30)</option></select>
        </div>
        <div className="field">
          <label>Default booking duration</label>
          <select className="select" defaultValue="1h"><option value="30m">30 minutes</option><option value="1h">1 hour</option><option value="1.5h">1.5 hours</option></select>
        </div>
        <div className="field">
          <label>Home location</label>
          <select className="select"><option>Frieswings HQ — Floor 4</option><option>Remote</option></select>
        </div>
      </div>

      <div className="h-divider" />

      <div className="grid-2">
        <div className="field">
          <label>Theme</label>
          <div className="seg" style={{ alignSelf: "flex-start" }}>
            <button className={tweaks.theme === "light" ? "on" : ""} onClick={() => setTweak("theme", "light")}>Light</button>
            <button className={tweaks.theme === "dark"  ? "on" : ""} onClick={() => setTweak("theme", "dark")}>Dark</button>
          </div>
        </div>
        <div className="field">
          <label>Density</label>
          <div className="seg" style={{ alignSelf: "flex-start" }}>
            <button className={tweaks.density === "regular" ? "on" : ""} onClick={() => setTweak("density", "regular")}>Regular</button>
            <button className={tweaks.density === "compact" ? "on" : ""} onClick={() => setTweak("density", "compact")}>Compact</button>
          </div>
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Accent color</label>
          <div style={{ display: "flex", gap: 8 }}>
            {HUES.map(({ hue, name }) => (
              <button key={hue} title={name} onClick={() => setTweak("accentHue", hue)}
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: `oklch(0.62 0.14 ${hue})`,
                  boxShadow: tweaks.accentHue === hue
                    ? "0 0 0 2px var(--surface-2), 0 0 0 4px var(--accent)"
                    : "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="h-divider" />

      <div className="list" style={{ marginLeft: -20, marginRight: -20 }}>
        <SettingRow icon="Sparkle" title="Smart suggestions"         desc="Recommend rooms based on your patterns" control={<div className="switch on" />} />
        <SettingRow icon="Pin"     title="Auto-release no-shows"     desc="Free up the room after 10 minutes"      control={<div className="switch on" />} />
        <SettingRow icon="Eye"     title="Make my events private by default" desc="Titles hidden from room displays" control={<div className="switch" />} />
      </div>
    </>
  );
};

export const IntegrationsPanel = () => {
  const items = [
    { name: "Apple Calendar",  desc: "Two-way sync · last synced 2m ago", on: true,  color: "252" },
    { name: "Google Calendar", desc: "Two-way sync · last synced 5m ago", on: true,  color: "75"  },
    { name: "Microsoft 365",   desc: "Two-way sync",                       on: false, color: "152" },
    { name: "Slack",           desc: "Send invites and reminders",         on: true,  color: "320" },
  ];
  return (
    <>
      <div className="card-head"><h3>Integrations</h3><span className="meta">Connect your calendar and chat</span></div>
      <div className="grid-2">
        {items.map(i => (
          <div key={i.name} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(160deg, oklch(0.85 0.06 ${i.color}), oklch(0.74 0.08 ${i.color}))`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }} />
              <div className="grow">
                <div style={{ fontWeight: 600, fontSize: 14 }}>{i.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{i.desc}</div>
              </div>
              <div className={"switch " + (i.on ? "on" : "")} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
