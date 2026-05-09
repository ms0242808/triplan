import type { ReactNode } from "react";

type IProps = {
  size?: number;
  fill?: string;
  stroke?: string;
  sw?: number;
  className?: string;
  children?: ReactNode;
  d?: string;
};

const I = ({ d, size = 18, fill = "none", stroke = "currentColor", sw = 1.6, className = "ico", children }: IProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

export type IconProps = Omit<IProps, "d" | "children">;

export const Icon = {
  Home:    (p: IconProps = {}) => <I {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></I>,
  Calendar:(p: IconProps = {}) => <I {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></I>,
  Plus:    (p: IconProps = {}) => <I {...p}><path d="M12 5v14M5 12h14"/></I>,
  Rooms:   (p: IconProps = {}) => <I {...p}><path d="M4 20V8l8-4 8 4v12"/><path d="M4 20h16M10 20v-6h4v6"/></I>,
  Bell:    (p: IconProps = {}) => <I {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></I>,
  Search:  (p: IconProps = {}) => <I {...p}><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/></I>,
  Gear:    (p: IconProps = {}) => <I {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1A1.7 1.7 0 0 0 10 4.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></I>,
  Users:   (p: IconProps = {}) => <I {...p}><circle cx="9" cy="8" r="3.2"/><path d="M2.5 19a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.6"/><path d="M21.5 18a4.5 4.5 0 0 0-6-4.2"/></I>,
  Clock:   (p: IconProps = {}) => <I {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2.2"/></I>,
  Pin:     (p: IconProps = {}) => <I {...p}><path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></I>,
  Wifi:    (p: IconProps = {}) => <I {...p}><path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M5.5 12.5a10 10 0 0 1 13 0"/><path d="M8.5 16a6 6 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/></I>,
  Tv:      (p: IconProps = {}) => <I {...p}><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></I>,
  Coffee:  (p: IconProps = {}) => <I {...p}><path d="M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 4c0 1 1 1 1 2M12 4c0 1 1 1 1 2"/></I>,
  Mic:     (p: IconProps = {}) => <I {...p}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 12a7 7 0 0 0 14 0M12 19v3"/></I>,
  Whiteboard: (p: IconProps = {}) => <I {...p}><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></I>,
  Arrow:   (p: IconProps = {}) => <I {...p}><path d="M5 12h14M13 6l6 6-6 6"/></I>,
  Chevron: (p: IconProps = {}) => <I {...p}><path d="m9 6 6 6-6 6"/></I>,
  Check:   (p: IconProps = {}) => <I {...p}><path d="m5 12 5 5 9-11"/></I>,
  X:       (p: IconProps = {}) => <I {...p}><path d="m6 6 12 12M18 6 6 18"/></I>,
  Logout:  (p: IconProps = {}) => <I {...p}><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 17l-5-5 5-5M5 12h11"/></I>,
  Sparkle: (p: IconProps = {}) => <I {...p}><path d="M12 3l1.8 4.7L18 9l-4.2 1.3L12 15l-1.8-4.7L6 9l4.2-1.3z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></I>,
  Filter:  (p: IconProps = {}) => <I {...p}><path d="M4 5h16l-6 8v6l-4-2v-4z"/></I>,
  Edit:    (p: IconProps = {}) => <I {...p}><path d="M4 20h4l11-11-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></I>,
  Trash:   (p: IconProps = {}) => <I {...p}><path d="M5 7h14M10 7V5h4v2M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7"/><path d="M10 11v6M14 11v6"/></I>,
  Mail:    (p: IconProps = {}) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></I>,
  Lock:    (p: IconProps = {}) => <I {...p}><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></I>,
  Eye:     (p: IconProps = {}) => <I {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></I>,
  Apple:   (p: IconProps = {}) => <I {...p} fill="currentColor" stroke="none"><path d="M16.5 12.6c0-2.3 1.9-3.4 2-3.4-1.1-1.6-2.8-1.8-3.4-1.9-1.4-.1-2.8.8-3.6.8s-1.9-.8-3.1-.8c-1.6 0-3 .9-3.9 2.4-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 3 2.4 1.2-.1 1.7-.8 3.1-.8s1.9.8 3.1.8c1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7 0-.1-2.6-1-2.6-3.8M14.3 5.6c.7-.8 1.1-1.9 1-3-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.9-1.4"/></I>,
  Building:(p: IconProps = {}) => <I {...p}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></I>,
  ChartUp: (p: IconProps = {}) => <I {...p}><path d="M4 18h16M7 14l3-3 3 3 5-5"/><path d="M16 9h3v3"/></I>,
} as const;

export type IconName = keyof typeof Icon;
