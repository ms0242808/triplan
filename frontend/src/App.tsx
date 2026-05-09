import { useEffect, useState } from "react";
import { Icon } from "./components/Icon";
import { Sidebar, TabBar } from "./components/Shell";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { BookRoom } from "./components/BookRoom";
import { ManageRooms } from "./components/ManageRooms";
import { EventView } from "./components/EventView";
import { Settings } from "./components/Settings";
import { useAuth } from "./auth";
import type { Screen, Tweaks } from "./types";

const TWEAK_DEFAULTS: Tweaks = {
  theme: "light",
  accentHue: "252",
  density: "regular",
};

function App() {
  const { user, loading } = useAuth();
  const [tweaks, setTweaks] = useState<Tweaks>(TWEAK_DEFAULTS);
  const setTweak = (k: keyof Tweaks, v: string) =>
    setTweaks(prev => ({ ...prev, [k]: v }));

  const [screen, setScreen] = useState<Screen>("dashboard");
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
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

  const openBooking = (bookingId: string | null, message?: string) => {
    setCurrentBookingId(bookingId);
    setScreen("event");
    if (message) showToast(message);
  };

  if (loading) {
    return (
      <div className="app" style={{ gridTemplateColumns: "1fr", placeItems: "center" }}>
        <div className="muted">Loading…</div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="app">
      <Sidebar screen={screen} setScreen={setScreen} />
      <main className="canvas">
        <div className="canvas-inner">
          {screen === "dashboard" && (
            <Dashboard go={setScreen} openBooking={id => openBooking(id)} />
          )}
          {screen === "book" && (
            <BookRoom
              go={setScreen}
              onBooked={(bookingId, summary) => openBooking(bookingId, summary)}
            />
          )}
          {screen === "manage"   && <ManageRooms />}
          {screen === "event"    && <EventView bookingId={currentBookingId} />}
          {screen === "settings" && <Settings tweaks={tweaks} setTweak={setTweak} />}
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
