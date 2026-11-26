-- ================================================================
-- DAMVIEW RESORT CUSTOMIZATION
-- Extends the Hospiq base schema for Damview Resort, Zimbabwe.
-- Adds: reservations, hourly billing, cashier role, ZW payment modes,
-- room type expansion, and activity/event management.
-- ================================================================

-- ── 1. ROLE EXPANSION: add 'cashier' role ──────────────────────
-- The existing enum is: superadmin, admin, manager, disabled, kitchen
-- We add 'cashier' for front-desk staff who can check in/out and bill
-- but cannot access reports, settings, or staff management.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'cashier';

-- Update is_staff() to include cashier
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'manager', 'cashier')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- New helper: is_cashier_or_above (cashier + manager + admin + superadmin)
CREATE OR REPLACE FUNCTION public.is_cashier_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('cashier', 'admin', 'superadmin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 2. PAYMENT MODE: replace UPI/Card with EcoCash/Bank Transfer ──
-- Drop the old CHECK and add a new one with Zimbabwe-relevant modes.
ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_payment_mode_check;
ALTER TABLE public.bills ADD CONSTRAINT bills_payment_mode_check
  CHECK (payment_mode IN ('Cash', 'EcoCash', 'Bank Transfer', 'Pending', ''));

-- ── 3. ROOM TYPE EXPANSION ─────────────────────────────────────
-- Damview has lodges/chalets, not hotel-style rooms.
-- Add more flexible types. Existing enum: standard, premium, deluxe, suite.
ALTER TYPE public.room_type ADD VALUE IF NOT EXISTS 'lodge';
ALTER TYPE public.room_type ADD VALUE IF NOT EXISTS 'chalet';
ALTER TYPE public.room_type ADD VALUE IF NOT EXISTS 'cottage';
ALTER TYPE public.room_type ADD VALUE IF NOT EXISTS 'camping';

-- Add a human-readable label and description to rooms
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS max_occupancy INTEGER NOT NULL DEFAULT 2;

-- ── 4. HOURLY BILLING ──────────────────────────────────────────
-- Add billing_mode to guests: 'nightly' (default, legacy) or 'hourly'
-- hourly_rate stores the per-hour price when billing_mode = 'hourly'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_mode') THEN
    CREATE TYPE public.billing_mode AS ENUM ('nightly', 'hourly');
  END IF;
END$$;

ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS billing_mode public.billing_mode NOT NULL DEFAULT 'nightly';
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2);

-- Constraint: hourly_rate required when billing_mode is hourly
ALTER TABLE public.guests ADD CONSTRAINT guests_hourly_rate_check
  CHECK (billing_mode = 'nightly' OR (billing_mode = 'hourly' AND hourly_rate IS NOT NULL AND hourly_rate >= 0));

-- ── 5. RESERVATIONS / ADVANCE BOOKINGS ─────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    CREATE TYPE public.reservation_status AS ENUM ('confirmed', 'checked_in', 'cancelled', 'no_show', 'completed');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.reservations (
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

CREATE INDEX IF NOT EXISTS idx_reservations_room_id ON public.reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_check_in ON public.reservations(check_in_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_guest_phone ON public.reservations(guest_phone);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage reservations"
  ON public.reservations FOR ALL
  TO authenticated USING (public.is_staff());

-- Link guest to reservation on check-in
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS reservation_id UUID REFERENCES public.reservations ON DELETE SET NULL;

-- ── 6. ROOM STATUS EXPANSION ───────────────────────────────────
-- Add 'reserved' and 'maintenance' statuses
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'reserved';
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'maintenance';

-- ── 7. ACTIVITIES & EVENTS ─────────────────────────────────────
-- Damview offers damside activities (boat rides, fishing, swimming)
-- and hosts events. These need tracking and billing.

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_per_person NUMERIC(10, 2) NOT NULL CHECK (price_per_person >= 0),
  price_per_hour NUMERIC(10, 2),
  max_capacity INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage activities"
  ON public.activities FOR ALL
  TO authenticated USING (public.is_staff());

CREATE POLICY "Anyone can read active activities"
  ON public.activities FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Activity bookings (linked to guest or standalone)
CREATE TABLE IF NOT EXISTS public.activity_bookings (
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

CREATE INDEX IF NOT EXISTS idx_activity_bookings_guest ON public.activity_bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_activity_bookings_activity ON public.activity_bookings(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_bookings_created ON public.activity_bookings(created_at DESC);

ALTER TABLE public.activity_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage activity bookings"
  ON public.activity_bookings FOR ALL
  TO authenticated USING (public.is_staff());

-- ── 8. TAX DEFAULT: Zimbabwe VAT is 15% ────────────────────────
ALTER TABLE public.guests ALTER COLUMN gst_percent SET DEFAULT 15.00;
ALTER TABLE public.food_menu ALTER COLUMN gst_percent SET DEFAULT 15.00;

-- ── 9. GUEST EMAIL (already nullable in Hospiq but confirm) ────
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS gst_number TEXT;

-- ── 10. REALTIME for reservations ──────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_bookings;

-- ── 11. RESTAURANT TABLES (from Hospiq, may already exist) ─────
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage restaurant tables"
  ON public.restaurant_tables FOR ALL
  TO authenticated USING (public.is_staff());

CREATE POLICY "Anyone can read restaurant tables"
  ON public.restaurant_tables FOR SELECT
  TO anon, authenticated USING (true);

-- Restaurant bills table (from Hospiq, may already exist)
CREATE TABLE IF NOT EXISTS public.restaurant_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES public.restaurant_tables ON DELETE SET NULL,
  food_charges NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_mode TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_mode IN ('Cash', 'EcoCash', 'Bank Transfer')),
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.restaurant_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage restaurant bills"
  ON public.restaurant_bills FOR ALL
  TO authenticated USING (public.is_staff());

-- ── 12. PARTIAL PAYMENTS: track amount_paid and outstanding on bills ──
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2);
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS outstanding_balance NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Allow 'partial' as a payment_status value (existing enum: pending, paid)
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'partial';

-- ── 13. AUDIT LOG ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read audit log"
  ON public.audit_log FOR SELECT
  TO authenticated USING (public.is_staff());

CREATE POLICY "Staff can insert audit log"
  ON public.audit_log FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());

-- Analyze new tables
ANALYZE public.reservations;
ANALYZE public.activities;
ANALYZE public.activity_bookings;
ANALYZE public.audit_log;
