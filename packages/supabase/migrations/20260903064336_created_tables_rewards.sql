-- ============================================================
-- Migration: create_rewards
-- Master data for the "Congratulations!" reward screen
-- (e.g. completing all 6 stamps → "Master Zoo Explorer" badge).
-- ============================================================

create table rewards (
    id                  uuid primary key default gen_random_uuid(),
    animaltype                text unique not null,   -- 'master_zoo_explorer'
    name_th             text not null,
    description_th      text,
    image_url           text,
    required_stamps     integer not null default 0, -- e.g. 6 = all zones
    points_value        integer not null default 0
);

alter table rewards enable row level security;

create policy "Anyone can read rewards" on rewards
    for select using (true);