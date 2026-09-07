-- ============================================================
-- Migration: create_mini_games
-- One (or more) mini-game per zone. game_type + config lets each
-- zone use a different mechanic (memory match, AR feeding, platformer)
-- without needing separate tables per game.
-- ============================================================

create table mini_games (
    id                  uuid primary key default gen_random_uuid(),
    zone_id             uuid not null references zones(id) on delete cascade,
    name                text not null,
    game_type           text not null,      -- 'memory_match' | 'ar_feeding' | 'platformer' | ...
    time_limit_seconds  integer,            -- e.g. 30 (shown as countdown in Mini Game screen)
    pass_score          integer default 0,  -- min score required to earn the stamp
    config              jsonb default '{}', -- game-specific settings (grid size, tiles, etc.)
    is_active           boolean not null default true
);

create index idx_mini_games_zone_id on mini_games(zone_id);

alter table mini_games enable row level security;

create policy "Anyone can read mini_games" on mini_games
    for select using (true);