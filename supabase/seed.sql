-- Seed 20 Rooms
INSERT INTO public.rooms (room_number, type, base_price, status) VALUES
  (101, 'standard', 1000.00, 'available'),
  (102, 'standard', 1000.00, 'available'),
  (103, 'standard', 1000.00, 'available'),
  (104, 'standard', 1000.00, 'available'),
  (105, 'standard', 1000.00, 'available'),
  (106, 'standard', 1000.00, 'available'),
  (107, 'standard', 1000.00, 'available'),
  (108, 'standard', 1000.00, 'available'),
  (109, 'standard', 1000.00, 'available'),
  (110, 'standard', 1000.00, 'available'),
  (201, 'premium', 2000.00, 'available'),
  (202, 'premium', 2000.00, 'available'),
  (203, 'premium', 2000.00, 'available'),
  (204, 'premium', 2000.00, 'available'),
  (205, 'premium', 2000.00, 'available'),
  (206, 'premium', 2000.00, 'available'),
  (207, 'premium', 2000.00, 'available'),
  (208, 'premium', 2000.00, 'available'),
  (209, 'premium', 2000.00, 'available'),
  (210, 'premium', 2000.00, 'available');

-- Seed Food Menu
INSERT INTO public.food_menu (name, price, available_quantity, is_active) VALUES
  ('Veg Biryani', 250.00, 50, true),
  ('Chicken Biryani', 350.00, 30, true),
  ('Paneer Butter Masala', 220.00, 40, true),
  ('Butter Naan', 40.00, 100, true),
  ('Tandoori Roti', 20.00, 150, true),
  ('Dal Makhani', 180.00, 40, true),
  ('Jeera Rice', 120.00, 60, true),
  ('Gulab Jamun', 60.00, 50, true),
  ('Masala Dosa', 150.00, 30, true),
  ('Filter Coffee', 40.00, 100, true);
