import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { useAuth } from "../auth";
import type { Screen } from "../types";

type NavItem = { id: Screen; label: string; icon: IconName; badge?: string | number };

type ShellProps = { screen: Screen; setScreen: (s: Screen) => void };

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("") || "·";

export const Sidebar = ({ screen, setScreen }: ShellProps) => {
  const { user, logout } = useAuth();
  const items: NavItem[] = [
    { id: "dashboard", label: "Dashboard",    icon: "Home" },
    { id: "book",      label: "Book a Room",  icon: "Plus", badge: "New" },
    { id: "manage",    label: "Manage Rooms", icon: "Rooms" },
    { id: "event",     label: "My Events",    icon: "Calendar" },
  ];
  const more: NavItem[] = [
    { id: "settings",  label: "Settings", icon: "Gear" },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">A</div>
        <div>
          <div className="brand-name">Atrium</div>
          <div className="brand-sub">Workplace booking</div>
        </div>
      </div>
      <div className="nav-group">
        <div className="nav-label">Workspace</div>
        {items.map(it => {
          const Ic = Icon[it.icon];
          return (
            <button key={it.id} className={"nav-item " + (screen === it.id ? "active" : "")} onClick={() => setScreen(it.id)}>
              <Ic />
              <span>{it.label}</span>
              {it.badge !== undefined && <span className="badge">{it.badge}</span>}
            </button>
          );
        })}
      </div>
      <div className="nav-group">
        <div className="nav-label">Account</div>
        {more.map(it => {
          const Ic = Icon[it.icon];
          return (
            <button key={it.id} className={"nav-item " + (screen === it.id ? "active" : "")} onClick={() => setScreen(it.id)}>
              <Ic />
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>
      <div className="sidebar-foot">
        <div className="avatar">{user ? initialsOf(user.name) : "·"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="who-name">{user?.name ?? "—"}</div>
          <div className="who-role" style={{ textTransform: "capitalize" }}>{user?.role ?? ""}</div>
        </div>
        <button className="nav-item" style={{ width: 32, padding: 6 }} title="Sign out" onClick={() => { void logout(); }}>
          <Icon.Logout />
        </button>
      </div>
    </aside>
  );
};

export const TabBar = ({ screen, setScreen }: ShellProps) => {
  const items: NavItem[] = [
    { id: "dashboard", label: "Home",     icon: "Home" },
    { id: "book",      label: "Book",     icon: "Plus" },
    { id: "manage",    label: "Rooms",    icon: "Rooms" },
    { id: "event",     label: "Events",   icon: "Calendar" },
    { id: "settings",  label: "Settings", icon: "Gear" },
  ];
  return (
    <nav className="tabbar">
      {items.map(it => {
        const Ic = Icon[it.icon];
        return (
          <button key={it.id} className={"nav-item " + (screen === it.id ? "active" : "")} onClick={() => setScreen(it.id)} style={{ flex: 1 }}>
            <Ic /> <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

type TopBarProps = { title: string; subtitle?: string; actions?: ReactNode };

export const TopBar = ({ title, subtitle, actions }: TopBarProps) => (
  <header className="topbar">
    <div>
      <h1>{title}</h1>
      {subtitle && <div className="sub">{subtitle}</div>}
    </div>
    <div className="spacer" />
    <div className="search">
      <Icon.Search />
      <input placeholder="Search rooms, people, events" />
      <span className="kbd">⌘K</span>
    </div>
    <button className="btn ghost" title="Notifications" style={{ width: 36, padding: 0, justifyContent: "center" }}>
      <Icon.Bell />
    </button>
    {actions}
  </header>
);
