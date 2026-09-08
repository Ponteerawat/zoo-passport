-- ============================================================
-- Migration: create_user_rewards
-- Which rewards a user has actually claimed
-- ("รับรางวัล" button on the Reward screen).
-- ============================================================

create table user_rewards (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references profiles(id) on delete cascade,
    reward_id       uuid not null references rewards(id) on delete cascade,
    claimed_at      timestamptz not null default now(),
    unique (user_id, reward_id)
);

create index idx_user_rewards_user_id on user_rewards(user_id);

alter table user_rewards enable row level security;

create policy "Users can view own rewards" on user_rewards
    for select using (auth.uid() = user_id);

create policy "Users can claim own rewards" on user_rewards
    for insert with check (auth.uid() = user_id);