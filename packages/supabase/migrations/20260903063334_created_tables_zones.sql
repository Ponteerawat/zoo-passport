-- ============================================================
-- Migration: create_zones
-- Static reference data: Lion Zone, Elephant Zone, Giraffe Zone,
-- Penguin Zone, Reptile Zone, Panda Zone (6 total).
-- Powers: Zoo Passport list, Zone Info screen, Collection screen.
-- ============================================================

create table zones (
    id              uuid primary key default gen_random_uuid(),
    animaltype            text unique not null,       -- 'lion', 'elephant', ...
    name_th         text not null,
    name_en         text not null,
    description_th  text,
    icon_url        text,                       -- animal icon (paw/avatar)
    order_index     integer not null default 0, -- display order in passport list
    is_active       boolean not null default true
);

alter table zones enable row level security;

create policy "Anyone can read zones" on zones
    for select using (true);