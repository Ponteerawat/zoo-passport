-- ============================================================
-- Migration: create_mini_game_attempts
-- Log of every play (not just the winning one) — useful for the
-- Score shown mid-game, "History" on the Profile screen, and any
-- future leaderboard/ranking feature.
-- ============================================================

create table mini_game_attempts (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid not null references profiles(id) on delete cascade,
    mini_game_id        uuid not null references mini_games(id) on delete cascade,
    score               integer not null default 0,
    time_taken_seconds  integer,
    is_passed           boolean not null default false,
    played_at           timestamptz not null default now()
);

create index idx_mini_game_attempts_user_id on mini_game_attempts(user_id);
create index idx_mini_game_attempts_mini_game_id on mini_game_attempts(mini_game_id);

alter table mini_game_attempts enable row level security;

create policy "Users can view own attempts" on mini_game_attempts
    for select using (auth.uid() = user_id);

create policy "Users can insert own attempts" on mini_game_attempts
    for insert with check (auth.uid() = user_id);