create extension if not exists "pgcrypto";

create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  line_user_id    text unique not null,
  display_name    text,
  avatar_url      text,
  title           text default 'Zoo Explorer',   
  total_points    integer not null default 0,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
    for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
    for update using (auth.uid() = id);