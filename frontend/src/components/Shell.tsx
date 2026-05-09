import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import type { Screen } from "../types";

type NavItem = { id: Screen; label: string; icon: IconName; badge?: string | number };

type SidebarProps = { screen: Screen; setScreen: (s: Screen) => void };

export const Sidebar = ({ screen, setScreen }: SidebarProps) => {
  const items: NavItem[] = [
    { id: "dashboard", label: "Dashboard",    icon: "Home" },
    { id: "book",      label: "Book a Room",  icon: "Plus", badge: "New" },
    { id: "manage",    label: "Manage Rooms", icon: "Rooms" },
    { id: "event",     label: "My Events",    icon: "Calendar", badge: 3 },
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
          <div className="brand-sub">Frieswings HQ</div>
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
        <div className="avatar">EV</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="who-name">Eve Holt</div>
          <div className="who-role">Workplace Admin</div>
        </div>
        <button className="nav-item" style={{ width: 32, padding: 6 }} title="Sign out" onClick={() => setScreen("login")}>
          <Icon.Logout />
        </button>
      </div>
    </aside>
  );
};

export const TabBar = ({ screen, setScreen }: SidebarProps) => {
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
