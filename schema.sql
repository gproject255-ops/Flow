-- Run this in Supabase SQL Editor (Database → SQL Editor)

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  prefs jsonb default '[]'::jsonb,
  plan text default 'free',
  updated_at timestamptz default now()
);

-- Sessions table
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  mode_id text not null,
  duration_seconds integer not null,
  ended_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;

-- Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can upsert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);
