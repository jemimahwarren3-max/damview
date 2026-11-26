-- ================================================================
-- DAMVIEW RESORT SEED DATA
-- Real pricing from the confirmed business brief (2026-11-09).
-- ================================================================

-- ── PMS Rooms (Hospiq) ───────────────────────────────────────────
-- A Block (Garden Rooms): A1-A6, $25/12hr stay
-- B Block (Poolside Rooms): B1-B6, $30/12hr stay
-- F Block (Premier Rooms): F1-F10, $35/12hr stay
-- R Block (Riverside Rooms): R1-R10, $25/12hr stay

INSERT INTO public.rooms (room_number, type, base_price, status, label, max_occupancy) VALUES
  (1, 'lodge', 25.00, 'available', 'Garden Room A1', 2),
  (2, 'lodge', 25.00, 'available', 'Garden Room A2', 2),
  (3, 'lodge', 25.00, 'available', 'Garden Room A3', 2),
  (4, 'lodge', 25.00, 'available', 'Garden Room A4', 2),
  (5, 'lodge', 25.00, 'available', 'Garden Room A5', 2),
  (6, 'lodge', 25.00, 'available', 'Garden Room A6', 2),
  (7, 'lodge', 30.00, 'available', 'Poolside Room B1', 2),
  (8, 'lodge', 30.00, 'available', 'Poolside Room B2', 2),
  (9, 'lodge', 30.00, 'available', 'Poolside Room B3', 2),
  (10, 'lodge', 30.00, 'available', 'Poolside Room B4', 2),
  (11, 'lodge', 30.00, 'available', 'Poolside Room B5', 2),
  (12, 'lodge', 30.00, 'available', 'Poolside Room B6', 2),
  (13, 'lodge', 35.00, 'available', 'Premier Room F1', 2),
  (14, 'lodge', 35.00, 'available', 'Premier Room F2', 2),
  (15, 'lodge', 35.00, 'available', 'Premier Room F3', 2),
  (16, 'lodge', 35.00, 'available', 'Premier Room F4', 2),
  (17, 'lodge', 35.00, 'available', 'Premier Room F5', 2),
  (18, 'lodge', 35.00, 'available', 'Premier Room F6', 2),
  (19, 'lodge', 35.00, 'available', 'Premier Room F7', 2),
  (20, 'lodge', 35.00, 'available', 'Premier Room F8', 2),
  (21, 'lodge', 35.00, 'available', 'Premier Room F9', 2),
  (22, 'lodge', 35.00, 'available', 'Premier Room F10', 2),
  (23, 'lodge', 25.00, 'available', 'Riverside Room R1', 2),
  (24, 'lodge', 25.00, 'available', 'Riverside Room R2', 2),
  (25, 'lodge', 25.00, 'available', 'Riverside Room R3', 2),
  (26, 'lodge', 25.00, 'available', 'Riverside Room R4', 2),
  (27, 'lodge', 25.00, 'available', 'Riverside Room R5', 2),
  (28, 'lodge', 25.00, 'available', 'Riverside Room R6', 2),
  (29, 'lodge', 25.00, 'available', 'Riverside Room R7', 2),
  (30, 'lodge', 25.00, 'available', 'Riverside Room R8', 2),
  (31, 'lodge', 25.00, 'available', 'Riverside Room R9', 2),
  (32, 'lodge', 25.00, 'available', 'Riverside Room R10', 2);

-- ── Food Menu (from real flyer) ──────────────────────────────────
INSERT INTO public.food_menu (name, price, available_quantity, is_active, category, gst_percent) VALUES
  ('Rib Burger', 3.50, 50, true, 'Burgers', 15.00),
  ('1/4 Chicken & Chips', 3.50, 30, true, 'Mains', 15.00),
  ('Sadza & Chicken', 1.50, 40, true, 'Mains', 15.00),
  ('Eggs Beans & Bread', 3.00, 30, true, 'Breakfast', 15.00),
  ('Braai Stand + Charcoal', 10.00, 20, true, 'Braai', 15.00),
  ('Soft Drink', 1.00, 100, true, 'Beverages', 15.00),
  ('Water', 0.50, 100, true, 'Beverages', 15.00),
  ('Tea/Coffee', 1.00, 100, true, 'Beverages', 15.00);

-- ── Restaurant Tables ────────────────────────────────────────────
INSERT INTO public.restaurant_tables (table_number, capacity) VALUES
  (1, 4), (2, 4), (3, 4), (4, 4), (5, 6),
  (6, 6), (7, 2), (8, 2), (9, 8), (10, 8);

-- ── Website Room Blocks ──────────────────────────────────────────
INSERT INTO room_blocks (id, name, display_name, rate_per_stay, stay_duration_hours) VALUES
  ('a-block', 'A Block', 'Garden Rooms', 25.00, 12),
  ('b-block', 'B Block', 'Poolside Rooms', 30.00, 12),
  ('f-block', 'F Block', 'Premier Rooms', 35.00, 12),
  ('r-block', 'R Block', 'Riverside Rooms', 25.00, 12);

INSERT INTO website_rooms (id, block_id, number, status) VALUES
  ('a1', 'a-block', 'A1', 'available'),
  ('a2', 'a-block', 'A2', 'available'),
  ('a3', 'a-block', 'A3', 'available'),
  ('a4', 'a-block', 'A4', 'available'),
  ('a5', 'a-block', 'A5', 'available'),
  ('a6', 'a-block', 'A6', 'available'),
  ('b1', 'b-block', 'B1', 'available'),
  ('b2', 'b-block', 'B2', 'available'),
  ('b3', 'b-block', 'B3', 'available'),
  ('b4', 'b-block', 'B4', 'available'),
  ('b5', 'b-block', 'B5', 'available'),
  ('b6', 'b-block', 'B6', 'available'),
  ('f1', 'f-block', 'F1', 'available'),
  ('f2', 'f-block', 'F2', 'available'),
  ('f3', 'f-block', 'F3', 'available'),
  ('f4', 'f-block', 'F4', 'available'),
  ('f5', 'f-block', 'F5', 'available'),
  ('f6', 'f-block', 'F6', 'available'),
  ('f7', 'f-block', 'F7', 'available'),
  ('f8', 'f-block', 'F8', 'available'),
  ('f9', 'f-block', 'F9', 'available'),
  ('f10', 'f-block', 'F10', 'available'),
  ('r1', 'r-block', 'R1', 'available'),
  ('r2', 'r-block', 'R2', 'available'),
  ('r3', 'r-block', 'R3', 'available'),
  ('r4', 'r-block', 'R4', 'available'),
  ('r5', 'r-block', 'R5', 'available'),
  ('r6', 'r-block', 'R6', 'available'),
  ('r7', 'r-block', 'R7', 'available'),
  ('r8', 'r-block', 'R8', 'available'),
  ('r9', 'r-block', 'R9', 'available'),
  ('r10', 'r-block', 'R10', 'available');

-- ── Website Activities ───────────────────────────────────────────
INSERT INTO website_activities (id, category, name, description, price_amount, price_unit) VALUES
  ('boat-cruise', 'damside', 'Boat Cruise', 'Scenic cruise on the dam', 5.00, 'per_person'),
  ('pedal-boats', 'damside', 'Pedal Boats', 'Self-guided pedal boat rides', 3.00, 'per_person'),
  ('quad-biking', 'recreational', 'Quad Biking', 'Off-road quad bike trails', 3.00, 'per_person'),
  ('horse-riding', 'recreational', 'Horse Riding', 'Guided horse riding', 3.00, 'per_person'),
  ('zip-line', 'recreational', 'Zip Line', 'Zip line adventure', 3.00, 'per_person'),
  ('trampolines', 'recreational', 'Trampolines', 'Trampoline park', 3.00, 'per_person'),
  ('pool-tables', 'recreational', 'Pool Tables', 'Indoor pool tables', 3.00, 'per_session'),
  ('soccer-field', 'recreational', 'Soccer Field', 'Full-size soccer pitch', 3.00, 'per_session');

-- ── Website Menu ─────────────────────────────────────────────────
INSERT INTO menu_categories (id, name) VALUES
  ('mains', 'Mains'),
  ('burgers', 'Burgers'),
  ('breakfast', 'Breakfast'),
  ('beverages', 'Beverages'),
  ('braai', 'Braai');

INSERT INTO menu_items (id, category_id, name, price, available) VALUES
  ('rib-burger', 'burgers', 'Rib Burger', 3.50, true),
  ('quarter-chicken', 'mains', '1/4 Chicken & Chips', 3.50, true),
  ('sadza-chicken', 'mains', 'Sadza & Chicken', 1.50, true),
  ('eggs-beans', 'breakfast', 'Eggs Beans & Bread', 3.00, true),
  ('braai-stand', 'braai', 'Braai Stand + Charcoal', 10.00, true),
  ('soft-drink', 'beverages', 'Soft Drink', 1.00, true),
  ('water', 'beverages', 'Water', 0.50, true),
  ('tea-coffee', 'beverages', 'Tea/Coffee', 1.00, true);

-- ── Gym Packages ─────────────────────────────────────────────────
INSERT INTO gym_packages (id, name, price, billing_period, features) VALUES
  ('session', 'Single Session', 10.00, 'session', '{"Full gym access", "Locker room"}');
