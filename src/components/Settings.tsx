import { useState } from "react";
import { Icon, type IconName } from "./Icon";
import { TopBar } from "./Shell";
import { ProfilePanel, NotifPanel, PreferencesPanel, IntegrationsPanel } from "./SettingsPanels";
import type { Tweaks } from "../types";

type SectionId = "profile" | "notifications" | "preferences" | "integrations";

type Props = { tweaks: Tweaks; setTweak: (k: keyof Tweaks, v: string) => void };

export const Settings = ({ tweaks, setTweak }: Props) => {
  const [section, setSection] = useState<SectionId>("profile");
  const sections: { id: SectionId; label: string; icon: IconName }[] = [
    { id: "profile",       label: "Profile",       icon: "Users" },
    { id: "notifications", label: "Notifications", icon: "Bell" },
    { id: "preferences",   label: "Preferences",   icon: "Sparkle" },
    { id: "integrations",  label: "Integrations",  icon: "Building" },
  ];
  return (
    <>
      <TopBar title="Settings" subtitle="Personal preferences and workspace integrations." />
      <div className="settings-grid">
        <div className="settings-nav">
          {sections.map(s => {
            const Ic = Icon[s.icon];
            return (
              <button key={s.id} className={"nav-item " + (section === s.id ? "active" : "")} onClick={() => setSection(s.id)}>
                <Ic /> <span>{s.label}</span>
              </button>
            );
          })}
        </div>
        <div className="card">
          {section === "profile"       && <ProfilePanel />}
          {section === "notifications" && <NotifPanel />}
          {section === "preferences"   && <PreferencesPanel tweaks={tweaks} setTweak={setTweak} />}
          {section === "integrations"  && <IntegrationsPanel />}
        </div>
      </div>
    </>
  );
};
