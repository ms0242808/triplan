-- Seed default rooms (matches the prototype dataset).
INSERT INTO rooms (name, floor, capacity, photo, rate, color, amenities) VALUES
  ('Aurora',     'Floor 4 · North',  12, 'a', 'Premier',  '252', ARRAY['Display','Whiteboard','Video','Mic']),
  ('Solstice',   'Floor 3 · South',   8, 'b', 'Standard',  '75', ARRAY['Display','Video','Whiteboard']),
  ('Meridian',   'Floor 2 · East',    6, 'c', 'Standard', '152', ARRAY['Display','Mic']),
  ('Compass',    'Floor 4 · West',    4, 'd', 'Focus',    '320', ARRAY['Display']),
  ('Lighthouse', 'Floor 1 · Lobby',  20, 'e', 'Premier',   '25', ARRAY['Display','Mic','Video','Whiteboard','Coffee']),
  ('Atlas',      'Floor 3 · North',  10, 'a', 'Standard', '270', ARRAY['Display','Whiteboard'])
ON CONFLICT DO NOTHING;
