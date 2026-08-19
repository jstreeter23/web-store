-- Applied to the web-store Supabase project. Kept here so the repo matches the live schema.

create table if not exists public.beats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  bpm integer,
  key text,
  genre text,
  mood text,
  tags text[],
  preview_url text not null default '',
  full_mp3_url text not null default '',
  full_wav_url text not null default '',
  lease_price numeric(10, 2) not null default 50.00,
  exclusive_price numeric(10, 2) not null default 199.00,
  is_exclusive_sold boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  beat_id uuid not null references public.beats(id) on delete restrict,
  license_type text not null check (license_type in ('lease', 'exclusive')),
  buyer_email text not null,
  buyer_name text not null,
  amount_paid numeric(10, 2) not null,
  stripe_session_id text unique,
  stripe_payment_intent text unique,
  download_token uuid not null default gen_random_uuid(),
  download_expires_at timestamptz,
  downloaded_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  producer_name text not null default 'Jordan',
  default_lease_price numeric(10, 2) not null default 50.00,
  default_exclusive_price numeric(10, 2) not null default 199.00,
  watermark_audio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.beats enable row level security;
alter table public.orders enable row level security;
alter table public.settings enable row level security;
