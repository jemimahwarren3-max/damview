-- Dam View Resort — Stage 10 database schema
--
-- Maps directly onto the TypeScript interfaces already defined in types/
-- and the mock data in lib/data/. Not applied anywhere yet — this is ready
-- to run in the Supabase SQL editor once a project exists.
--
-- Staff accounts/auth are handled by Supabase Auth itself (auth.users),
-- not a custom table here — staff_profiles below just attaches a role to
-- an existing auth user.

create extension if not exists pgcrypto;

-- ===== Accommodation =====

create table room_blocks (
  id text primary key,
  name text not null,
  rate_per_stay numeric(10, 2) not null,
  stay_duration_hours integer not null
);

create table rooms (
  id text primary key,
  block_id text not null references room_blocks(id) on delete cascade,
  number text not null,
  status text not null default 'available' check (status in ('available', 'booked', 'maintenance'))
);

create table lodge_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  block_id text references room_blocks(id),
  check_in date not null,
  guests integer not null
);

-- ===== Gym =====

create table gym_packages (
  id text primary key,
  name text not null,
  price numeric(10, 2), -- null = not yet confirmed
  billing_period text not null check (billing_period in ('session', 'month', 'year')),
  features text[] not null default '{}'
);

create table gym_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  package_id text references gym_packages(id)
);

-- ===== Restaurant =====

create table menu_categories (
  id text primary key,
  name text not null
);

create table menu_items (
  id text primary key,
  category_id text not null references menu_categories(id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null,
  description text,
  image text,
  available boolean not null default true
);

-- ===== Activities (Damside + Recreational) =====

create table activities (
  id text primary key,
  category text not null check (category in ('damside', 'recreational')),
  name text not null,
  description text not null,
  price_amount numeric(10, 2), -- null = pricing not yet confirmed
  price_unit text check (price_unit in ('per_person', 'per_hour', 'per_session', 'free')),
  image text
);

create table activity_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  activity_id text not null references activities(id),
  preferred_date date,
  party_size integer
);

-- ===== Events =====

create table event_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  event_type text not null check (
    event_type in ('wedding', 'birthday', 'private_party', 'family_gathering', 'corporate', 'conference', 'other')
  ),
  proposed_date date not null,
  expected_guests integer not null,
  facilities_required text[] not null default '{}',
  catering_required boolean not null default false,
  accommodation_required boolean not null default false
);

-- ===== Gallery =====

create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (
    category in ('accommodation', 'pool', 'restaurant', 'gym', 'waterfront', 'activities', 'events', 'general')
  ),
  type text not null check (type in ('image', 'video')),
  url text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- ===== Guest reviews (moderated) =====

create table guest_reviews (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  rating smallint not null check (rating between 1 and 5),
  quote text not null,
  image text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
-- Only 'approved' reviews should ever be queried for public display — the
-- brief is explicit that reviews are moderated before they go live.

-- ===== Staff (roles only — auth itself is Supabase Auth) =====

create table staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('director', 'general_manager', 'managerial_officer', 'department_head', 'employee')),
  department text
);
-- Role names taken from the real org chart in "2025 Damview SOP.docx".

-- ===== Financial documents =====

create table documents (
  id uuid primary key default gen_random_uuid(),
  document_type text not null check (document_type in ('quotation', 'invoice', 'receipt')),
  document_number text not null unique,
  customer_name text not null,
  issue_date date not null default current_date,
  amount_paid numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table document_line_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(10, 2) not null
);
