-- ================================================================
-- CONSOLIDATED SCHEMA — all migrations squashed into one file.
-- Generated from the 26 sequential migrations (identical result).
-- Enum values are folded into their CREATE TYPE so the file is safe
-- to apply as a single transaction. Apply on a fresh DB via
-- `supabase db reset` or `psql -f`.
-- ================================================================


-- ============================================================
-- SOURCE: 20260227135007_initial_schema.sql
-- ============================================================
-- Create ENUMS
CREATE TYPE public.user_role AS ENUM ('superadmin', 'admin', 'manager', 'disabled', 'kitchen');
CREATE TYPE public.room_type AS ENUM ('standard', 'premium', 'deluxe', 'suite');
CREATE TYPE public.room_status AS ENUM ('available', 'occupied', 'cleaning');
CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'preparing', 'served', 'cancelled', 'prepared', 'billed');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid');

-- Users Table (Extends Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role public.user_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number INTEGER NOT NULL UNIQUE,
  type public.room_type NOT NULL DEFAULT 'standard',
  base_price NUMERIC(10, 2) NOT NULL,
  status public.room_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guests Table
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms ON DELETE RESTRICT NOT NULL,
  name TEXT NOT NULL,
  check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out TIMESTAMPTZ,
  people_count INTEGER NOT NULL DEFAULT 1,
  rate NUMERIC(10, 2) NOT NULL,
  gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Food Menu Table
CREATE TABLE public.food_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  available_quantity INTEGER NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders Table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms ON DELETE CASCADE NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES public.food_menu ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_snapshot NUMERIC(10, 2) NOT NULL
);

-- Bills Table
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES public.guests ON DELETE RESTRICT UNIQUE NOT NULL,
  room_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  food_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_guests_room_id ON public.guests(room_id);
CREATE INDEX idx_guests_is_active ON public.guests(is_active);
CREATE INDEX idx_orders_room_id ON public.orders(room_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if user is admin or superadmin
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. Users policies
CREATE POLICY "Superadmins can manage users" 
  ON public.users FOR ALL 
  TO authenticated USING (public.is_superadmin());

CREATE POLICY "Users can read own record" 
  ON public.users FOR SELECT 
  TO authenticated USING (auth.uid() = id);

-- 2. Rooms policies
CREATE POLICY "Staff can manage rooms" 
  ON public.rooms FOR ALL 
  TO authenticated USING (public.is_staff());

CREATE POLICY "Anyone can read rooms" 
  ON public.rooms FOR SELECT 
  TO anon, authenticated USING (true);

-- 3. Guests policies
CREATE POLICY "Staff can manage guests" 
  ON public.guests FOR ALL 
  TO authenticated USING (public.is_staff());

-- 4. Food Menu policies
CREATE POLICY "Staff can manage food menu" 
  ON public.food_menu FOR ALL 
  TO authenticated USING (public.is_staff());

CREATE POLICY "Anyone can read available food" 
  ON public.food_menu FOR SELECT 
  TO anon, authenticated USING (is_active = true AND available_quantity > 0);

-- 5. Orders policies
CREATE POLICY "Staff can manage orders" 
  ON public.orders FOR ALL 
  TO authenticated USING (public.is_staff());

-- Allow anonymous users to place orders and read their own orders (we will secure this via RPC mostly, but this allows direct insert if needed)
CREATE POLICY "Anonymous can insert orders" 
  ON public.orders FOR INSERT 
  TO anon, authenticated WITH CHECK (status = 'pending');

CREATE POLICY "Anonymous can read their orders" 
  ON public.orders FOR SELECT 
  TO anon, authenticated USING (true);

-- 6. Order Items policies
CREATE POLICY "Staff can manage order items" 
  ON public.order_items FOR ALL 
  TO authenticated USING (public.is_staff());

CREATE POLICY "Anonymous can insert order items" 
  ON public.order_items FOR INSERT 
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anonymous can read order items" 
  ON public.order_items FOR SELECT 
  TO anon, authenticated USING (true);

-- 7. Bills policies
CREATE POLICY "Staff can manage bills" 
  ON public.bills FOR ALL 
  TO authenticated USING (public.is_staff());

-- Triggers and Functions

-- Function to handle user creation in public.users when auth.users is created
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

-- RPC for accepting orders and reducing inventory safely
CREATE OR REPLACE FUNCTION public.accept_order_safe(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Re-check auth (optional but good practice)
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Update order status
  UPDATE public.orders 
  SET status = 'accepted' 
  WHERE id = p_order_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or not in pending state';
  END IF;

  -- Reduce quantities
  FOR v_item IN (SELECT food_id, quantity FROM public.order_items WHERE order_id = p_order_id) LOOP
    UPDATE public.food_menu
    SET available_quantity = available_quantity - v_item.quantity
    WHERE id = v_item.food_id AND available_quantity >= v_item.quantity;
    
    IF NOT FOUND THEN
       -- Rollback will happen automatically if exception is raised
       RAISE EXCEPTION 'Insufficient quantity for food_id: %', v_item.food_id;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Realtime Configuration
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

-- ============================================================
-- SOURCE: 20260227153215_add_discount_to_bills.sql
-- ============================================================
ALTER TABLE public.bills
ADD COLUMN discount_amount numeric NOT NULL DEFAULT 0;

-- ============================================================
-- SOURCE: 20260227153727_add_payment_mode_and_extras.sql
-- ============================================================
ALTER TABLE public.bills
ADD COLUMN payment_mode text NOT NULL DEFAULT 'Cash' CHECK (payment_mode IN ('Cash', 'UPI', 'Card')),
ADD COLUMN extra_charges numeric NOT NULL DEFAULT 0;

-- ============================================================
-- SOURCE: 20260227154510_add_extra_charges_details.sql
-- ============================================================
ALTER TABLE public.bills
ADD COLUMN extra_charges_details jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ============================================================
-- SOURCE: 20260227222500_add_guest_code.sql
-- ============================================================
-- Add guest_code column to guests table
ALTER TABLE guests ADD COLUMN guest_code TEXT UNIQUE;

-- Create a function to generate the next guest code
CREATE OR REPLACE FUNCTION generate_guest_code()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    code TEXT;
BEGIN
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(guest_code FROM 'G-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM guests
    WHERE guest_code IS NOT NULL AND guest_code ~ '^G-\d+$';
    
    code := 'G-' || LPAD(next_num::TEXT, 3, '0');
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing guests with guest codes
DO $$
DECLARE
    r RECORD;
    counter INTEGER := 1;
BEGIN
    FOR r IN SELECT id FROM guests ORDER BY created_at ASC
    LOOP
        UPDATE guests SET guest_code = 'G-' || LPAD(counter::TEXT, 3, '0') WHERE id = r.id AND guest_code IS NULL;
        counter := counter + 1;
    END LOOP;
END;
$$;

-- Make guest_code NOT NULL after backfill
ALTER TABLE guests ALTER COLUMN guest_code SET NOT NULL;
ALTER TABLE guests ALTER COLUMN guest_code SET DEFAULT '';

-- ============================================================
-- SOURCE: 20260227230500_add_guest_details.sql
-- ============================================================
-- Add more guest details
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS id_proof_name TEXT,
ADD COLUMN IF NOT EXISTS id_proof_number TEXT,
ADD COLUMN IF NOT EXISTS other_guest_names TEXT[];

-- ============================================================
-- SOURCE: 20260227232200_allow_custom_dishes.sql
-- ============================================================
-- Allow custom dishes in order_items
ALTER TABLE order_items ALTER COLUMN food_id DROP NOT NULL;
ALTER TABLE order_items ADD COLUMN custom_name TEXT;

-- ============================================================
-- SOURCE: 20260227232300_update_accept_order_safe.sql
-- ============================================================
-- Update accept_order_safe to handle nullable food_id (custom dishes)
CREATE OR REPLACE FUNCTION public.accept_order_safe(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Re-check auth
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Update order status
  UPDATE public.orders 
  SET status = 'accepted' 
  WHERE id = p_order_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or not in pending state';
  END IF;

  -- Reduce quantities (only for items linked to a menu ID)
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

-- ============================================================
-- SOURCE: 20260228000000_1_year_data_retention.sql
-- ============================================================
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create an optimized function to delete records older than 1 year
CREATE OR REPLACE FUNCTION public.cleanup_old_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Secure execution path
AS $$
DECLARE
  v_deleted_count INT;
  v_batch_size INT := 1000; -- Delete in batches of 1000 to prevent long table locks
  v_cutoff_date TIMESTAMPTZ := NOW() - INTERVAL '1 year';
BEGIN
  -- 1. Delete old Bills in batches (RESTRICTs guests deletion if not removed first)
  LOOP
    WITH to_delete AS (
      SELECT id FROM public.bills 
      WHERE created_at < v_cutoff_date 
      LIMIT v_batch_size
    )
    DELETE FROM public.bills 
    WHERE id IN (SELECT id FROM to_delete);
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;
  
  -- 2. Delete old Orders in batches (Order Items cascade automatically)
  LOOP
    WITH to_delete AS (
      SELECT id FROM public.orders 
      WHERE created_at < v_cutoff_date 
      LIMIT v_batch_size
    )
    DELETE FROM public.orders 
    WHERE id IN (SELECT id FROM to_delete);
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;
  
  -- 3. Delete old Guests in batches
  LOOP
    WITH to_delete AS (
      SELECT id FROM public.guests 
      WHERE created_at < v_cutoff_date 
      LIMIT v_batch_size
    )
    DELETE FROM public.guests 
    WHERE id IN (SELECT id FROM to_delete);
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;

  -- (Optional scaling note: postgres autovacuum will reclaim space organically later)
END;
$$;

-- Security: Prevent external execution via API / anonymous
REVOKE EXECUTE ON FUNCTION public.cleanup_old_records() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_records() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_records() TO postgres, service_role;

-- Schedule the cron job to run daily at 2:00 AM off-peak server time
SELECT cron.schedule(
  'daily_cleanup_old_records_job',
  '0 2 * * *', -- 2:00 AM every day
  $$ SELECT public.cleanup_old_records(); $$
);

-- ============================================================
-- SOURCE: 20260228000001_security_constraints.sql
-- ============================================================
-- Security Hardening: Enforce strict data validity constraints across all financial tables
-- Prevents negative prices, zero prices where inappropriate, and ensures data integrity.

ALTER TABLE public.rooms 
  ADD CONSTRAINT rooms_base_price_check CHECK (base_price >= 0);

ALTER TABLE public.guests 
  ADD CONSTRAINT guests_rate_check CHECK (rate >= 0),
  ADD CONSTRAINT guests_gst_percent_check CHECK (gst_percent >= 0 AND gst_percent <= 100),
  ADD CONSTRAINT guests_people_count_check CHECK (people_count > 0);

ALTER TABLE public.food_menu 
  ADD CONSTRAINT food_menu_price_check CHECK (price >= 0);

ALTER TABLE public.order_items 
  ADD CONSTRAINT order_items_price_snapshot_check CHECK (price_snapshot >= 0);

ALTER TABLE public.bills 
  ADD CONSTRAINT bills_room_charges_check CHECK (room_charges >= 0),
  ADD CONSTRAINT bills_food_charges_check CHECK (food_charges >= 0),
  ADD CONSTRAINT bills_gst_amount_check CHECK (gst_amount >= 0),
  ADD CONSTRAINT bills_total_amount_check CHECK (total_amount >= 0);

-- ============================================================
-- SOURCE: 20260228000002_add_food_images.sql
-- ============================================================
-- 1. Add image_url to food_menu
ALTER TABLE public.food_menu ADD COLUMN image_url TEXT;

-- 2. Create Storage Bucket for food images
INSERT INTO storage.buckets (id, name, public) VALUES ('food_images', 'food_images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for public to read images
CREATE POLICY "Public Access" 
  ON storage.objects FOR SELECT 
  USING ( bucket_id = 'food_images' );

-- Staff can insert, update, delete images
CREATE POLICY "Staff Upload Access" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK ( bucket_id = 'food_images' AND public.is_staff() );

CREATE POLICY "Staff Update Access" 
  ON storage.objects FOR UPDATE 
  TO authenticated 
  USING ( bucket_id = 'food_images' AND public.is_staff() );

CREATE POLICY "Staff Delete Access" 
  ON storage.objects FOR DELETE 
  TO authenticated 
  USING ( bucket_id = 'food_images' AND public.is_staff() );

-- ============================================================
-- SOURCE: 20260228140000_feature_gaps.sql
-- ============================================================
-- ============================================================
-- FEATURE GAPS MIGRATION
-- Addresses: 3-role system, room shift history, KOT entry mode,
-- breakfast control, item codes, order creator tracking
-- ============================================================

-- 1. THREE-ROLE SYSTEM (Admin, Manager 1, Manager 2)
-- Update user_role enum to include 'manager' 
-- superadmin = Admin (full control), admin/manager = Manager level
-- We'll treat 'superadmin' as the "Admin" in the TRD
-- 'admin' as Manager 1, 'manager' as Manager 2

-- 2. ROOM SHIFT HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.room_shifts (
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

CREATE INDEX idx_room_shifts_guest_id ON public.room_shifts(guest_id);
CREATE INDEX idx_room_shifts_created_at ON public.room_shifts(created_at);

ALTER TABLE public.room_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage room shifts"
  ON public.room_shifts FOR ALL
  TO authenticated USING (public.is_staff());

-- Add original_room_id to guests to always track billing room
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS original_room_id UUID REFERENCES public.rooms ON DELETE SET NULL;
-- Backfill: set original_room_id = room_id for existing guests
UPDATE public.guests SET original_room_id = room_id WHERE original_room_id IS NULL;

-- 3. KOT ENTRY MODE (manual vs automatic)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_entry_mode') THEN
    CREATE TYPE public.order_entry_mode AS ENUM ('manual', 'automatic');
  END IF;
END$$;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS entry_mode public.order_entry_mode NOT NULL DEFAULT 'automatic';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users ON DELETE SET NULL;

-- 4. SYSTEM SETTINGS TABLE (for breakfast control, etc.)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES public.users ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read settings"
  ON public.system_settings FOR SELECT
  TO authenticated USING (public.is_staff());

CREATE POLICY "Superadmin can manage settings"
  ON public.system_settings FOR ALL
  TO authenticated USING (public.is_superadmin());

-- Allow anonymous to read settings (for QR order page to check breakfast)
CREATE POLICY "Anyone can read settings"
  ON public.system_settings FOR SELECT
  TO anon USING (true);

-- Insert default breakfast setting
INSERT INTO public.system_settings (key, value)
VALUES ('breakfast_control', '{"enabled": true, "start_time": "07:00", "end_time": "10:30"}')
ON CONFLICT (key) DO NOTHING;

-- 5. HUMAN-READABLE ITEM CODES FOR FOOD MENU
ALTER TABLE public.food_menu ADD COLUMN IF NOT EXISTS item_code TEXT UNIQUE;
ALTER TABLE public.food_menu ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.food_menu ADD COLUMN IF NOT EXISTS gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00;

-- Backfill item codes for existing items
DO $$
DECLARE
  r RECORD;
  counter INTEGER := 1;
BEGIN
  FOR r IN SELECT id FROM public.food_menu ORDER BY created_at ASC
  LOOP
    UPDATE public.food_menu 
    SET item_code = 'F-' || LPAD(counter::TEXT, 3, '0') 
    WHERE id = r.id AND item_code IS NULL;
    counter := counter + 1;
  END LOOP;
END;
$$;

-- 6. ADD REALTIME FOR ROOM SHIFTS
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;

-- 7. AUDIT LOG TABLE (for tracking all actions)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX idx_audit_log_entity_type ON public.audit_log(entity_type);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read audit logs"
  ON public.audit_log FOR ALL
  TO authenticated USING (public.is_staff());

-- Helper function updated: also check for manager role
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SOURCE: 20260228150000_add_disabled_role.sql
-- ============================================================
-- Add 'disabled' as a valid user_role enum value

-- ============================================================
-- SOURCE: 20260228160000_room_types_and_breakfast.sql
-- ============================================================
-- 1. Add 'deluxe' and 'suite' to room_type enum

-- 2. Add breakfast-related columns to food_menu
ALTER TABLE public.food_menu ADD COLUMN IF NOT EXISTS is_breakfast BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.food_menu ADD COLUMN IF NOT EXISTS breakfast_start_time TIME DEFAULT '07:00';
ALTER TABLE public.food_menu ADD COLUMN IF NOT EXISTS breakfast_end_time TIME DEFAULT '10:30';

-- ============================================================
-- SOURCE: 20260228180000_performance_indexes.sql
-- ============================================================
-- ================================================================
-- PERFORMANCE INDEXES FOR PRODUCTION
-- Run after seeding data to ensure fast queries
-- ================================================================

-- History page: list checked-out guests ordered by check_out
CREATE INDEX IF NOT EXISTS idx_guests_active_checkout
  ON public.guests (is_active, check_out DESC NULLS LAST);

-- History page: date-range filter on check_in
CREATE INDEX IF NOT EXISTS idx_guests_check_in
  ON public.guests (check_in DESC);

-- History page: text search on name and guest_code
CREATE INDEX IF NOT EXISTS idx_guests_name_lower
  ON public.guests (lower(name));

CREATE INDEX IF NOT EXISTS idx_guests_guest_code
  ON public.guests (guest_code);

-- Billing: room_id + is_active for active guest lookups
CREATE INDEX IF NOT EXISTS idx_guests_room_active
  ON public.guests (room_id, is_active);

-- Bills: time-based analytics (dashboard, reports)
CREATE INDEX IF NOT EXISTS idx_bills_created_at
  ON public.bills (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bills_payment_status_created
  ON public.bills (payment_status, created_at DESC);

-- Bills: revenue lookups by guest
CREATE INDEX IF NOT EXISTS idx_bills_guest_id
  ON public.bills (guest_id);

-- Orders: analytics (popular items, order history)
CREATE INDEX IF NOT EXISTS idx_orders_status_created
  ON public.orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_food_id
  ON public.order_items (food_id);

-- Room shifts: audit trail queries
CREATE INDEX IF NOT EXISTS idx_room_shifts_created
  ON public.room_shifts (created_at DESC);

-- Analyze tables after index creation for better query plans
ANALYZE public.guests;
ANALYZE public.bills;
ANALYZE public.orders;
ANALYZE public.order_items;

-- ============================================================
-- SOURCE: 20260301000000_daily_order_cleanup.sql
-- ============================================================
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to delete orders from previous days
-- This ensures that every day starts with a clean slate for the guest ordering view
CREATE OR REPLACE FUNCTION public.daily_order_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  -- Delete all orders created before today (midnight today)
  -- Order items will be deleted automatically due to ON DELETE CASCADE
  DELETE FROM public.orders 
  WHERE created_at < CURRENT_DATE;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % orders in daily cleanup', v_deleted_count;
END;
$$;

-- Security: Prevent external execution
REVOKE EXECUTE ON FUNCTION public.daily_order_cleanup() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.daily_order_cleanup() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.daily_order_cleanup() TO postgres, service_role;

-- Schedule the cron job to run daily at 12:01 AM
SELECT cron.schedule(
  'daily_orders_reset_job',
  '1 0 * * *', -- 1 minute after midnight every day
  $$ SELECT public.daily_order_cleanup(); $$
);

-- ============================================================
-- SOURCE: 20260301100000_free_tier_cleanup.sql
-- ============================================================
-- ==========================================================================
-- Free-tier compatible data retention
-- ==========================================================================
-- Supabase free tier does NOT include pg_cron.
-- Primary cleanup is handled by Vercel Cron (/api/cron/cleanup) which:
--   • Deletes orders older than 7 days
--   • Deletes bills, orders, guests older than 1 year
--
-- The functions below are kept as a fallback for Pro-tier users with pg_cron.
-- They are wrapped in exception handlers so they don't break on free tier.
-- ==========================================================================

-- ── Update order cleanup to 7 days instead of daily ──────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_old_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  -- Delete orders older than 7 days (order_items cascade automatically)
  DELETE FROM public.orders
  WHERE created_at < (NOW() - INTERVAL '7 days');

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % orders older than 7 days', v_deleted_count;
END;
$$;

-- Security: restrict execution
REVOKE EXECUTE ON FUNCTION public.cleanup_old_orders() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_orders() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_orders() TO postgres, service_role;

-- ── Update 1-year cleanup (unchanged logic, just recreated cleanly) ──────
CREATE OR REPLACE FUNCTION public.cleanup_old_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INT;
  v_batch_size INT := 1000;
  v_cutoff_date TIMESTAMPTZ := NOW() - INTERVAL '1 year';
BEGIN
  -- 1. Bills first (FK dependency)
  LOOP
    WITH to_delete AS (
      SELECT id FROM public.bills
      WHERE created_at < v_cutoff_date
      LIMIT v_batch_size
    )
    DELETE FROM public.bills
    WHERE id IN (SELECT id FROM to_delete);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;

  -- 2. Orders (order_items cascade)
  LOOP
    WITH to_delete AS (
      SELECT id FROM public.orders
      WHERE created_at < v_cutoff_date
      LIMIT v_batch_size
    )
    DELETE FROM public.orders
    WHERE id IN (SELECT id FROM to_delete);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;

  -- 3. Guests
  LOOP
    WITH to_delete AS (
      SELECT id FROM public.guests
      WHERE created_at < v_cutoff_date
      LIMIT v_batch_size
    )
    DELETE FROM public.guests
    WHERE id IN (SELECT id FROM to_delete);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_records() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_records() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_records() TO postgres, service_role;

-- ── Attempt to schedule pg_cron jobs (gracefully skips on free tier) ─────
DO $$
BEGIN
  -- Try to enable pg_cron (only works on Supabase Pro+)
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  -- Remove old daily cleanup job if it exists
  BEGIN
    PERFORM cron.unschedule('daily_orders_reset_job');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Remove old 1-year cleanup job if it exists
  BEGIN
    PERFORM cron.unschedule('daily_cleanup_old_records_job');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Schedule new 7-day order cleanup (daily at 12:01 AM)
  PERFORM cron.schedule(
    'weekly_order_cleanup_job',
    '1 0 * * *',
    $cron$ SELECT public.cleanup_old_orders(); $cron$
  );

  -- Schedule 1-year data retention cleanup (daily at 2:00 AM)
  PERFORM cron.schedule(
    'yearly_data_retention_job',
    '0 2 * * *',
    $cron$ SELECT public.cleanup_old_records(); $cron$
  );

  RAISE NOTICE 'pg_cron jobs scheduled successfully';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron not available (free tier) — use Vercel Cron at /api/cron/cleanup instead';
END;
$$;

-- ============================================================
-- SOURCE: 20260301120000_add_guest_id_to_orders.sql
-- ============================================================
-- ==========================================================================
-- Add guest_id column to orders table
-- ==========================================================================
-- The orders table was missing a guest_id FK that the application code
-- relies on for linking orders to specific guests (used in QR ordering,
-- order history display, and room-shift order migration).
-- ==========================================================================

-- 1. Add guest_id column (nullable for backward compatibility with existing orders)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES public.guests ON DELETE CASCADE;

-- 2. Backfill: link existing orders to the active guest in the same room
UPDATE public.orders o
SET guest_id = g.id
FROM public.guests g
WHERE o.guest_id IS NULL
  AND o.room_id = g.room_id
  AND g.is_active = true;

-- 3. Index for fast lookups by guest_id
CREATE INDEX IF NOT EXISTS idx_orders_guest_id ON public.orders(guest_id);

-- ==========================================================================
-- Add anon SELECT policy on guests table
-- ==========================================================================
-- The QR ordering page (OrderApp) runs as anon and needs to query the
-- guests table to find the active guest for a room (for guest code
-- verification and fetching order history by guest_id).
-- Without this policy, all anon queries on guests return empty results,
-- breaking the entire QR ordering flow.
-- ==========================================================================

CREATE POLICY "Anyone can read active guests"
  ON public.guests FOR SELECT
  TO anon USING (is_active = true);

-- ============================================================
-- SOURCE: 20260318000000_restaurant_tables.sql
-- ============================================================
-- ==========================================================================
-- Restaurant Tables, Table Orders & Restaurant Bills
-- ==========================================================================

-- ── 1. Create table_status enum ──────────────────────────────────────────
CREATE TYPE public.table_status AS ENUM ('available', 'occupied');

-- ── 2. Create restaurant_tables ──────────────────────────────────────────
CREATE TABLE public.restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 4 CHECK (capacity > 0 AND capacity <= 50),
  status public.table_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Alter orders: add table_id, make room_id nullable ─────────────────
ALTER TABLE public.orders
  ALTER COLUMN room_id DROP NOT NULL;

ALTER TABLE public.orders
  ADD COLUMN table_id UUID REFERENCES public.restaurant_tables ON DELETE CASCADE;

-- An order must be for either a room or a table (not neither, not both)
ALTER TABLE public.orders
  ADD CONSTRAINT orders_room_or_table_check
  CHECK (
    (room_id IS NOT NULL AND table_id IS NULL) OR
    (room_id IS NULL AND table_id IS NOT NULL)
  );

-- ── 4. Create restaurant_bills ───────────────────────────────────────────
CREATE TABLE public.restaurant_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES public.restaurant_tables ON DELETE RESTRICT NOT NULL,
  food_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_mode TEXT NOT NULL DEFAULT 'Cash',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. Indexes ───────────────────────────────────────────────────────────
CREATE INDEX idx_orders_table_id ON public.orders(table_id);
CREATE INDEX idx_restaurant_tables_status ON public.restaurant_tables(status);
CREATE INDEX idx_restaurant_bills_table_id ON public.restaurant_bills(table_id);
CREATE INDEX idx_restaurant_bills_created_at ON public.restaurant_bills(created_at);

-- ── 6. RLS ───────────────────────────────────────────────────────────────
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_bills ENABLE ROW LEVEL SECURITY;

-- Restaurant tables: staff can manage, anyone can read
CREATE POLICY "Staff can manage restaurant tables"
  ON public.restaurant_tables FOR ALL
  TO authenticated USING (public.is_staff());

CREATE POLICY "Anyone can read restaurant tables"
  ON public.restaurant_tables FOR SELECT
  TO anon, authenticated USING (true);

-- Restaurant bills: staff only
CREATE POLICY "Staff can manage restaurant bills"
  ON public.restaurant_bills FOR ALL
  TO authenticated USING (public.is_staff());

-- ── 7. Realtime ──────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;

-- ── 8. Update cleanup function to include restaurant_bills ───────────────
CREATE OR REPLACE FUNCTION public.cleanup_old_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INT;
  v_batch_size INT := 1000;
  v_cutoff_date TIMESTAMPTZ := NOW() - INTERVAL '1 year';
BEGIN
  -- 1. Hotel bills (FK dependency on guests)
  LOOP
    WITH to_delete AS (
      SELECT id FROM public.bills
      WHERE created_at < v_cutoff_date
      LIMIT v_batch_size
    )
    DELETE FROM public.bills
    WHERE id IN (SELECT id FROM to_delete);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;

  -- 2. Restaurant bills
  LOOP
    WITH to_delete AS (
      SELECT id FROM public.restaurant_bills
      WHERE created_at < v_cutoff_date
      LIMIT v_batch_size
    )
    DELETE FROM public.restaurant_bills
    WHERE id IN (SELECT id FROM to_delete);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;

  -- 3. Orders (order_items cascade)
  LOOP
    WITH to_delete AS (
      SELECT id FROM public.orders
      WHERE created_at < v_cutoff_date
      LIMIT v_batch_size
    )
    DELETE FROM public.orders
    WHERE id IN (SELECT id FROM to_delete);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;

  -- 4. Guests
  LOOP
    WITH to_delete AS (
      SELECT id FROM public.guests
      WHERE created_at < v_cutoff_date
      LIMIT v_batch_size
    )
    DELETE FROM public.guests
    WHERE id IN (SELECT id FROM to_delete);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    EXIT WHEN v_deleted_count < v_batch_size;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_records() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_records() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_records() TO postgres, service_role;

-- ============================================================
-- SOURCE: 20260318010000_add_items_to_restaurant_bills.sql
-- ============================================================
ALTER TABLE public.restaurant_bills
ADD COLUMN items jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ============================================================
-- SOURCE: 20260318123000_optimize_rls_helper_functions.sql
-- ============================================================
-- Optimize RLS helper functions for low-latency policy checks.
-- SQL + STABLE allows Postgres to evaluate these once per statement.

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin', 'manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'superadmin'
  );
$$;

-- ============================================================
-- SOURCE: 20260318170000_add_kitchen_role.sql
-- ============================================================
-- Add kitchen as a valid role.
-- IMPORTANT: Do not reference the new enum value in this same migration,
-- otherwise Postgres may raise 55P04 (unsafe use of new enum value).

-- ============================================================
-- SOURCE: 20260318170100_include_kitchen_in_staff_and_kitchen_order_controls.sql
-- ============================================================
-- After kitchen enum is committed, include it in staff checks.
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin', 'manager', 'kitchen')
  );
$$;

-- Kitchen-specific helper for sensitive order-state transitions.
CREATE OR REPLACE FUNCTION public.is_kitchen()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'kitchen'
  );
$$;

-- Harden accept-order RPC so only kitchen users can mutate order state.
CREATE OR REPLACE FUNCTION public.accept_order_safe(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
BEGIN
  IF NOT public.is_kitchen() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.orders
  SET status = 'accepted'
  WHERE id = p_order_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or not in pending state';
  END IF;

  FOR v_item IN (SELECT food_id, quantity FROM public.order_items WHERE order_id = p_order_id) LOOP
    UPDATE public.food_menu
    SET available_quantity = available_quantity - v_item.quantity
    WHERE id = v_item.food_id AND available_quantity >= v_item.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient quantity for food_id: %', v_item.food_id;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SOURCE: 20260318170200_orders_status_update_kitchen_only.sql
-- ============================================================
-- Enforce kitchen-only order status updates at the database policy layer.
-- This prevents non-kitchen users from changing status via direct API calls.

DROP POLICY IF EXISTS "Staff can manage orders" ON public.orders;

CREATE POLICY "Staff can read orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_staff());

CREATE POLICY "Staff can insert orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "Kitchen can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_kitchen())
  WITH CHECK (public.is_kitchen());

CREATE POLICY "Staff can delete orders"
  ON public.orders FOR DELETE
  TO authenticated
  USING (public.is_staff());

-- ============================================================
-- SOURCE: 20260320150000_update_order_status.sql
-- ============================================================
-- Add 'prepared' and 'billed' status to the order_status enum

-- ============================================================
-- SOURCE: 20260324190000_add_gst_number_email_to_guests.sql
-- ============================================================
-- Add optional GST number and email fields to guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS gst_number TEXT DEFAULT NULL;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS email TEXT DEFAULT NULL;
