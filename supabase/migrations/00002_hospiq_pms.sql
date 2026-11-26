-- ================================================================
-- HOSPIQ PMS + DAMVIEW CUSTOMIZATION (fresh install, merged)
-- Resort management: rooms, guests, billing, orders, reservations,
-- restaurant tables, analytics, audit logging.
-- ================================================================

-- ── ENUMS ────────────────────────────────────────────────────────
CREATE TYPE public.user_role AS ENUM ('superadmin', 'admin', 'manager', 'disabled', 'kitchen', 'cashier');
CREATE TYPE public.room_type AS ENUM ('standard', 'premium', 'deluxe', 'suite', 'lodge', 'chalet', 'cottage', 'camping');
CREATE TYPE public.room_status AS ENUM ('available', 'occupied', 'cleaning', 'reserved', 'maintenance');
CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'preparing', 'served', 'cancelled', 'prepared', 'billed');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'partial');
CREATE TYPE public.billing_mode AS ENUM ('nightly', 'hourly');
CREATE TYPE public.reservation_status AS ENUM ('confirmed', 'checked_in', 'cancelled', 'no_show', 'completed');
CREATE TYPE public.order_entry_mode AS ENUM ('manual', 'automatic');
CREATE TYPE public.table_status AS ENUM ('available', 'occupied');

-- ── USERS (extends Supabase Auth) ────────────────────────────────
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role public.user_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ROOMS ────────────────────────────────────────────────────────
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number INTEGER NOT NULL UNIQUE,
  type public.room_type NOT NULL DEFAULT 'standard',
  base_price NUMERIC(10, 2) NOT NULL,
  status public.room_status NOT NULL DEFAULT 'available',
  label TEXT,
  description TEXT,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT rooms_base_price_check CHECK (base_price >= 0)
);

-- ── GUESTS ───────────────────────────────────────────────────────
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms ON DELETE RESTRICT NOT NULL,
  original_room_id UUID REFERENCES public.rooms ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  id_proof_name TEXT,
  id_proof_number TEXT,
  gst_number TEXT,
  other_guest_names TEXT[],
  check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out TIMESTAMPTZ,
  people_count INTEGER NOT NULL DEFAULT 1,
  rate NUMERIC(10, 2) NOT NULL,
  gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  guest_code TEXT NOT NULL DEFAULT '' UNIQUE,
  billing_mode public.billing_mode NOT NULL DEFAULT 'nightly',
  hourly_rate NUMERIC(10, 2),
  reservation_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT guests_rate_check CHECK (rate >= 0),
  CONSTRAINT guests_gst_percent_check CHECK (gst_percent >= 0 AND gst_percent <= 100),
  CONSTRAINT guests_people_count_check CHECK (people_count > 0),
  CONSTRAINT guests_hourly_rate_check CHECK (billing_mode = 'nightly' OR (billing_mode = 'hourly' AND hourly_rate IS NOT NULL AND hourly_rate >= 0))
);

-- ── FOOD MENU ────────────────────────────────────────────────────
CREATE TABLE public.food_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  available_quantity INTEGER NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  image_url TEXT,
  item_code TEXT UNIQUE,
  category TEXT DEFAULT 'General',
  gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  is_breakfast BOOLEAN NOT NULL DEFAULT FALSE,
  breakfast_start_time TIME DEFAULT '07:00',
  breakfast_end_time TIME DEFAULT '10:30',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT food_menu_price_check CHECK (price >= 0)
);

-- ── RESTAURANT TABLES ────────────────────────────────────────────
CREATE TABLE public.restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 4 CHECK (capacity > 0 AND capacity <= 50),
  status public.table_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ORDERS ───────────────────────────────────────────────────────
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms ON DELETE CASCADE,
  table_id UUID REFERENCES public.restaurant_tables ON DELETE CASCADE,
  guest_id UUID,
  status public.order_status NOT NULL DEFAULT 'pending',
  entry_mode public.order_entry_mode NOT NULL DEFAULT 'automatic',
  created_by UUID REFERENCES public.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT orders_room_or_table_check CHECK (
    (room_id IS NOT NULL AND table_id IS NULL) OR
    (room_id IS NULL AND table_id IS NOT NULL)
  )
);

-- guest_id FK added after guests table exists
ALTER TABLE public.orders
  ADD CONSTRAINT orders_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests ON DELETE CASCADE;

-- ── ORDER ITEMS ──────────────────────────────────────────────────
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES public.food_menu ON DELETE RESTRICT,
  custom_name TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_snapshot NUMERIC(10, 2) NOT NULL,
  CONSTRAINT order_items_price_snapshot_check CHECK (price_snapshot >= 0)
);

-- ── BILLS ────────────────────────────────────────────────────────
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES public.guests ON DELETE RESTRICT UNIQUE NOT NULL,
  room_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  food_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  extra_charges NUMERIC NOT NULL DEFAULT 0,
  extra_charges_details JSONB NOT NULL DEFAULT '[]'::jsonb,
  gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_mode TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_mode IN ('Cash', 'EcoCash', 'Bank Transfer', 'Pending', '')),
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  amount_paid NUMERIC(10, 2),
  outstanding_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bills_room_charges_check CHECK (room_charges >= 0),
  CONSTRAINT bills_food_charges_check CHECK (food_charges >= 0),
  CONSTRAINT bills_gst_amount_check CHECK (gst_amount >= 0),
  CONSTRAINT bills_total_amount_check CHECK (total_amount >= 0)
);

-- ── RESTAURANT BILLS ─────────────────────────────────────────────
CREATE TABLE public.restaurant_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES public.restaurant_tables ON DELETE RESTRICT NOT NULL,
  food_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_mode TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_mode IN ('Cash', 'EcoCash', 'Bank Transfer')),
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ROOM SHIFTS ──────────────────────────────────────────────────
CREATE TABLE public.room_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES public.guests ON DELETE CASCADE NOT NULL,
  from_room_id UUID REFERENCES public.rooms ON DELETE SET NULL,
  to_room_id UUID REFERENCES public.rooms ON DELETE SET NULL,
  from_room_number INTEGER NOT NULL,
  to_room_number INTEGER NOT NULL,
  shifted_by UUID REFERENCES public.users ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SYSTEM SETTINGS ──────────────────────────────────────────────
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES public.users ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.system_settings (key, value)
VALUES ('breakfast_control', '{"enabled": true, "start_time": "07:00", "end_time": "10:30"}')
ON CONFLICT (key) DO NOTHING;

-- ── RESERVATIONS ─────────────────────────────────────────────────
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms ON DELETE RESTRICT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  guest_id_type TEXT,
  guest_id_number TEXT,
  people_count INTEGER NOT NULL DEFAULT 1 CHECK (people_count > 0),
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  billing_mode public.billing_mode NOT NULL DEFAULT 'nightly',
  rate NUMERIC(10, 2) NOT NULL CHECK (rate >= 0),
  hourly_rate NUMERIC(10, 2),
  deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_payment_mode TEXT CHECK (deposit_payment_mode IS NULL OR deposit_payment_mode IN ('Cash', 'EcoCash', 'Bank Transfer')),
  notes TEXT,
  status public.reservation_status NOT NULL DEFAULT 'confirmed',
  booked_by UUID REFERENCES public.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add reservation FK to guests
ALTER TABLE public.guests
  ADD CONSTRAINT guests_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations ON DELETE SET NULL;

-- ── ACTIVITIES (PMS — damside activities, event booking) ─────────
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_per_person NUMERIC(10, 2) NOT NULL CHECK (price_per_person >= 0),
  price_per_hour NUMERIC(10, 2),
  max_capacity INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.activity_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities ON DELETE RESTRICT NOT NULL,
  guest_id UUID REFERENCES public.guests ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  people_count INTEGER NOT NULL DEFAULT 1 CHECK (people_count > 0),
  hours NUMERIC(4, 1),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_mode TEXT CHECK (payment_mode IN ('Cash', 'EcoCash', 'Bank Transfer', 'Room Charge')),
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  booked_by UUID REFERENCES public.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── AUDIT LOG ────────────────────────────────────────────────────
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_guests_room_id ON public.guests(room_id);
CREATE INDEX idx_guests_is_active ON public.guests(is_active);
CREATE INDEX idx_guests_active_checkout ON public.guests(is_active, check_out DESC NULLS LAST);
CREATE INDEX idx_guests_check_in ON public.guests(check_in DESC);
CREATE INDEX idx_guests_name_lower ON public.guests(lower(name));
CREATE INDEX idx_guests_guest_code ON public.guests(guest_code);
CREATE INDEX idx_guests_room_active ON public.guests(room_id, is_active);
CREATE INDEX idx_orders_room_id ON public.orders(room_id);
CREATE INDEX idx_orders_table_id ON public.orders(table_id);
CREATE INDEX idx_orders_guest_id ON public.orders(guest_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_food_id ON public.order_items(food_id);
CREATE INDEX idx_bills_created_at ON public.bills(created_at DESC);
CREATE INDEX idx_bills_payment_status_created ON public.bills(payment_status, created_at DESC);
CREATE INDEX idx_bills_guest_id ON public.bills(guest_id);
CREATE INDEX idx_restaurant_tables_status ON public.restaurant_tables(status);
CREATE INDEX idx_restaurant_bills_table_id ON public.restaurant_bills(table_id);
CREATE INDEX idx_restaurant_bills_created_at ON public.restaurant_bills(created_at);
CREATE INDEX idx_room_shifts_guest_id ON public.room_shifts(guest_id);
CREATE INDEX idx_room_shifts_created_at ON public.room_shifts(created_at);
CREATE INDEX idx_room_shifts_created ON public.room_shifts(created_at DESC);
CREATE INDEX idx_reservations_room_id ON public.reservations(room_id);
CREATE INDEX idx_reservations_check_in ON public.reservations(check_in_date);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_guest_phone ON public.reservations(guest_phone);
CREATE INDEX idx_activity_bookings_guest ON public.activity_bookings(guest_id);
CREATE INDEX idx_activity_bookings_activity ON public.activity_bookings(activity_id);
CREATE INDEX idx_activity_bookings_created ON public.activity_bookings(created_at DESC);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin', 'manager', 'kitchen', 'cashier')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_kitchen()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'kitchen'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_cashier_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('cashier', 'admin', 'superadmin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════

-- Users
CREATE POLICY "Superadmins can manage users" ON public.users FOR ALL TO authenticated USING (public.is_superadmin());
CREATE POLICY "Users can read own record" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);

-- Rooms
CREATE POLICY "Staff can manage rooms" ON public.rooms FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "Anyone can read rooms" ON public.rooms FOR SELECT TO anon, authenticated USING (true);

-- Guests
CREATE POLICY "Staff can manage guests" ON public.guests FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "Anyone can read active guests" ON public.guests FOR SELECT TO anon USING (is_active = true);

-- Food Menu
CREATE POLICY "Staff can manage food menu" ON public.food_menu FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "Anyone can read available food" ON public.food_menu FOR SELECT TO anon, authenticated USING (is_active = true AND available_quantity > 0);

-- Orders (kitchen-enforced updates)
CREATE POLICY "Staff can read orders" ON public.orders FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff can insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY "Kitchen can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_kitchen()) WITH CHECK (public.is_kitchen());
CREATE POLICY "Staff can delete orders" ON public.orders FOR DELETE TO authenticated USING (public.is_staff());
CREATE POLICY "Anonymous can insert orders" ON public.orders FOR INSERT TO anon WITH CHECK (status = 'pending');
CREATE POLICY "Anonymous can read their orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);

-- Order Items
CREATE POLICY "Staff can manage order items" ON public.order_items FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "Anonymous can insert order items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anonymous can read order items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);

-- Bills
CREATE POLICY "Staff can manage bills" ON public.bills FOR ALL TO authenticated USING (public.is_staff());

-- Restaurant Tables
CREATE POLICY "Staff can manage restaurant tables" ON public.restaurant_tables FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "Anyone can read restaurant tables" ON public.restaurant_tables FOR SELECT TO anon, authenticated USING (true);

-- Restaurant Bills
CREATE POLICY "Staff can manage restaurant bills" ON public.restaurant_bills FOR ALL TO authenticated USING (public.is_staff());

-- Room Shifts
CREATE POLICY "Staff can manage room shifts" ON public.room_shifts FOR ALL TO authenticated USING (public.is_staff());

-- System Settings
CREATE POLICY "Staff can read settings" ON public.system_settings FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Superadmin can manage settings" ON public.system_settings FOR ALL TO authenticated USING (public.is_superadmin());
CREATE POLICY "Anyone can read settings" ON public.system_settings FOR SELECT TO anon USING (true);

-- Reservations
CREATE POLICY "Staff can manage reservations" ON public.reservations FOR ALL TO authenticated USING (public.is_staff());

-- Activities (PMS)
CREATE POLICY "Staff can manage activities" ON public.activities FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "Anyone can read active activities" ON public.activities FOR SELECT TO anon, authenticated USING (is_active = true);

-- Activity Bookings
CREATE POLICY "Staff can manage activity bookings" ON public.activity_bookings FOR ALL TO authenticated USING (public.is_staff());

-- Audit Log
CREATE POLICY "Staff can read audit log" ON public.audit_log FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff can insert audit log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.is_staff());

-- ═══════════════════════════════════════════════════════════════════
-- TRIGGERS & RPCS
-- ═══════════════════════════════════════════════════════════════════

-- Auto-create user record when auth.users entry is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'admin'::public.user_role));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Accept order RPC (kitchen only, reduces inventory)
CREATE OR REPLACE FUNCTION public.accept_order_safe(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
BEGIN
  IF NOT public.is_kitchen() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.orders SET status = 'accepted'
  WHERE id = p_order_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or not in pending state';
  END IF;

  FOR v_item IN (SELECT food_id, quantity FROM public.order_items WHERE order_id = p_order_id) LOOP
    IF v_item.food_id IS NOT NULL THEN
      UPDATE public.food_menu
      SET available_quantity = available_quantity - v_item.quantity
      WHERE id = v_item.food_id AND available_quantity >= v_item.quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient quantity for food_id: %', v_item.food_id;
      END IF;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════
-- REALTIME
-- ═══════════════════════════════════════════════════════════════════

BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_bookings;

-- ═══════════════════════════════════════════════════════════════════
-- STORAGE
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) VALUES ('food_images', 'food_images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'food_images');
CREATE POLICY "Staff Upload Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'food_images' AND public.is_staff());
CREATE POLICY "Staff Update Access" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'food_images' AND public.is_staff());
CREATE POLICY "Staff Delete Access" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'food_images' AND public.is_staff());

-- ═══════════════════════════════════════════════════════════════════
-- CLEANUP FUNCTIONS (free-tier compatible — no pg_cron dependency)
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.cleanup_old_orders()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted_count INT;
BEGIN
  DELETE FROM public.orders WHERE created_at < (NOW() - INTERVAL '7 days');
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % orders older than 7 days', v_deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_records()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_deleted_count INT;
  v_batch_size INT := 1000;
  v_cutoff_date TIMESTAMPTZ := NOW() - INTERVAL '1 year';
BEGIN
  LOOP
    WITH to_delete AS (SELECT id FROM public.bills WHERE created_at < v_cutoff_date LIMIT v_batch_size)
    DELETE FROM public.bills WHERE id IN (SELECT id FROM to_delete);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;
  LOOP
    WITH to_delete AS (SELECT id FROM public.restaurant_bills WHERE created_at < v_cutoff_date LIMIT v_batch_size)
    DELETE FROM public.restaurant_bills WHERE id IN (SELECT id FROM to_delete);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;
  LOOP
    WITH to_delete AS (SELECT id FROM public.orders WHERE created_at < v_cutoff_date LIMIT v_batch_size)
    DELETE FROM public.orders WHERE id IN (SELECT id FROM to_delete);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;
  LOOP
    WITH to_delete AS (SELECT id FROM public.guests WHERE created_at < v_cutoff_date LIMIT v_batch_size)
    DELETE FROM public.guests WHERE id IN (SELECT id FROM to_delete);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_orders() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_orders() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_orders() TO postgres, service_role;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_records() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_records() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_records() TO postgres, service_role;

-- Try to schedule pg_cron jobs (skips gracefully on free tier)
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  PERFORM cron.schedule('weekly_order_cleanup_job', '1 0 * * *', $cron$ SELECT public.cleanup_old_orders(); $cron$);
  PERFORM cron.schedule('yearly_data_retention_job', '0 2 * * *', $cron$ SELECT public.cleanup_old_records(); $cron$);
  RAISE NOTICE 'pg_cron jobs scheduled';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron not available — use Vercel Cron at /api/cron/cleanup';
END;
$$;

-- Analyze for query planner
ANALYZE public.guests;
ANALYZE public.bills;
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.reservations;
ANALYZE public.activities;
ANALYZE public.activity_bookings;
ANALYZE public.audit_log;
