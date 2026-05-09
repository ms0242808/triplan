import { useEffect, useState } from "react";
import { Icon } from "./components/Icon";
import { Sidebar, TabBar } from "./components/Shell";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { BookRoom } from "./components/BookRoom";
import { ManageRooms } from "./components/ManageRooms";
import { EventView } from "./components/EventView";
import { Settings } from "./components/Settings";
import type { Screen, Tweaks } from "./types";

const TWEAK_DEFAULTS: Tweaks = {
  theme: "light",
  accentHue: "252",
  density: "regular",
};

function App() {
  const [tweaks, setTweaks] = useState<Tweaks>(TWEAK_DEFAULTS);
  const setTweak = (k: keyof Tweaks, v: string) =>
    setTweaks(prev => ({ ...prev, [k]: v }));

  const [screen, setScreen] = useState<Screen>("login");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", tweaks.theme);
    root.setAttribute("data-density", tweaks.density);
    root.style.setProperty("--accent-h", tweaks.accentHue);
    root.style.setProperty("--accent",      `oklch(0.62 0.14 ${tweaks.accentHue})`);
    root.style.setProperty("--accent-soft", `oklch(0.94 0.04 ${tweaks.accentHue})`);
    root.style.setProperty("--accent-ink",  `oklch(0.34 0.10 ${tweaks.accentHue})`);
  }, [tweaks]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  if (screen === "login") {
    return <Login onSignIn={() => setScreen("dashboard")} />;
  }

  return (
    <div className="app">
      <Sidebar screen={screen} setScreen={setScreen} />
      <main className="canvas">
        <div className="canvas-inner">
          {screen === "dashboard" && <Dashboard go={setScreen} />}
          {screen === "book" && (
            <BookRoom
              go={setScreen}
              onBooked={() => {
                setScreen("event");
                showToast("Booked Aurora · Today, 10:00 – 11:00 AM");
              }}
            />
          )}
          {screen === "manage"   && <ManageRooms go={setScreen} />}
          {screen === "event"    && <EventView   go={setScreen} />}
          {screen === "settings" && <Settings    tweaks={tweaks} setTweak={setTweak} />}
        </div>
      </main>
      <TabBar screen={screen} setScreen={setScreen} />
      {toast && (
        <div className="toast">
          <Icon.Check />
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
