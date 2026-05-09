export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type Room = {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  photo: string;
  rate: string;
  color: string;
  amenities: string[];
  active: boolean;
};

export type Attendee = {
  initials: string;
  name: string;
  status?: "going" | "tentative" | "pending";
};

export type Booking = {
  id: string;
  room_id: string;
  organizer_id: string;
  title: string;
  agenda: string | null;
  starts_at: string;
  ends_at: string;
  is_private: boolean;
  is_recurring: boolean;
  attendees: Attendee[];
  room_name?: string;
  organizer_name?: string;
};

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "same-origin",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new ApiError(res.status, body.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    session: () => request<{ user: User | null }>("/api/auth/session"),
    login:   (email: string, password: string) =>
      request<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  },
  rooms: {
    list:   () => request<{ rooms: Room[] }>("/api/rooms"),
    get:    (id: string) => request<{ room: Room }>(`/api/rooms/${id}`),
    update: (id: string, body: Partial<Room>) =>
      request<{ room: Room }>(`/api/rooms/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ ok: true }>(`/api/rooms/${id}`, { method: "DELETE" }),
  },
  bookings: {
    list: (params: { from?: Date; to?: Date; room_id?: string; mine?: boolean } = {}) => {
      const q = new URLSearchParams();
      if (params.from)    q.set("from", params.from.toISOString());
      if (params.to)      q.set("to",   params.to.toISOString());
      if (params.room_id) q.set("room_id", params.room_id);
      if (params.mine)    q.set("mine", "true");
      const qs = q.toString();
      return request<{ bookings: Booking[] }>(`/api/bookings${qs ? `?${qs}` : ""}`);
    },
    get:    (id: string) => request<{ booking: Booking }>(`/api/bookings/${id}`),
    create: (body: {
      room_id: string;
      title: string;
      agenda?: string | null;
      starts_at: string;
      ends_at: string;
      is_private?: boolean;
      is_recurring?: boolean;
      attendees?: Attendee[];
    }) =>
      request<{ booking: Booking }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ ok: true }>(`/api/bookings/${id}`, { method: "DELETE" }),
  },
};

export { ApiError };
