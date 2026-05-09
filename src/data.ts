export type Room = {
  id: string;
  name: string;
  floor: string;
  cap: number;
  photo: string;
  amenities: string[];
  rate: string;
  color: string;
};

export type EventItem = {
  id: string;
  title: string;
  room: string;
  start: number;
  end: number;
  organizer: string;
  attendees: number;
  color: string;
};

export const ROOMS: Room[] = [
  { id: "r1", name: "Aurora",     floor: "Floor 4 · North", cap: 12, photo: "a", amenities: ["Display", "Whiteboard", "Video", "Mic"], rate: "Premier",  color: "252" },
  { id: "r2", name: "Solstice",   floor: "Floor 3 · South", cap: 8,  photo: "b", amenities: ["Display", "Video", "Whiteboard"],          rate: "Standard", color: "75"  },
  { id: "r3", name: "Meridian",   floor: "Floor 2 · East",  cap: 6,  photo: "c", amenities: ["Display", "Mic"],                          rate: "Standard", color: "152" },
  { id: "r4", name: "Compass",    floor: "Floor 4 · West",  cap: 4,  photo: "d", amenities: ["Display"],                                 rate: "Focus",    color: "320" },
  { id: "r5", name: "Lighthouse", floor: "Floor 1 · Lobby", cap: 20, photo: "e", amenities: ["Display", "Mic", "Video", "Whiteboard", "Coffee"], rate: "Premier", color: "25" },
  { id: "r6", name: "Atlas",      floor: "Floor 3 · North", cap: 10, photo: "a", amenities: ["Display", "Whiteboard"],                   rate: "Standard", color: "270" },
];

export const EVENTS: EventItem[] = [
  { id: "e1", title: "Quarterly Planning", room: "Aurora",     start: 9,    end: 11,   organizer: "Maya Chen",  attendees: 8,  color: ""     },
  { id: "e2", title: "Design Critique",    room: "Solstice",   start: 11.5, end: 12.5, organizer: "Eve Holt",   attendees: 5,  color: "alt"  },
  { id: "e3", title: "1:1 Priya × Eve",    room: "Compass",    start: 14,   end: 14.5, organizer: "Eve Holt",   attendees: 2,  color: "alt2" },
  { id: "e4", title: "All Hands",          room: "Lighthouse", start: 16,   end: 17,   organizer: "CEO Office", attendees: 64, color: ""     },
];

export const ICON_FOR_AMENITY: Record<string, string> = {
  Display: "Tv",
  Whiteboard: "Whiteboard",
  Video: "Mic",
  Mic: "Mic",
  Coffee: "Coffee",
  "Wi-Fi": "Wifi",
};
