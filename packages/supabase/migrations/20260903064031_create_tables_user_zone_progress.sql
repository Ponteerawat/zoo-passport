-- ============================================================
-- Migration: create_user_zone_progress
-- One row per (user, zone). This is the source of truth for:
--   - "Your Progress 3/6 Stamps" on the Zoo Passport screen
--   - the paw-stamp icon state per zone row
--   - the Collection screen (join with zones; "collected" =
--     stamp_received_at is not null — no separate collection
--     table needed)
-- ============================================================

create table user_zone_progress (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid not null references profiles(id) on delete cascade,
    zone_id             uuid not null references zones(id) on delete cascade,
    status              text not null default 'locked'
                            check (status in ('locked', 'available', 'in_progress', 'completed')),
    best_score          integer not null default 0,
    stamp_received_at   timestamptz,          -- null until mini-game is passed
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    unique (user_id, zone_id)
);

create index idx_user_zone_progress_user_id on user_zone_progress(user_id);
create index idx_user_zone_progress_zone_id on user_zone_progress(zone_id);

alter table user_zone_progress enable row level security;

create policy "Users can view own progress" on user_zone_progress
    for select using (auth.uid() = user_id);

create policy "Users can insert own progress" on user_zone_progress
    for insert with check (auth.uid() = user_id);

create policy "Users can update own progress" on user_zone_progress
    for update using (auth.uid() = user_id);