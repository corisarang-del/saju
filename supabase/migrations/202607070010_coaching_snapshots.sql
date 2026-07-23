create table if not exists public.coaching_snapshots (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid not null references public.saju_readings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  concern text not null,
  today_do text not null,
  today_avoid text not null,
  relationship_tip text not null,
  follow_up_question text not null,
  weekly_focus text not null,
  monthly_focus text not null,
  source_message_id uuid references public.saju_chat_messages(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_coaching_snapshots_user_created_at
  on public.coaching_snapshots(user_id, created_at desc);

create index if not exists idx_coaching_snapshots_reading_created_at
  on public.coaching_snapshots(reading_id, created_at desc);

alter table public.coaching_snapshots enable row level security;

drop policy if exists "Users can read own coaching snapshots" on public.coaching_snapshots;
create policy "Users can read own coaching snapshots"
on public.coaching_snapshots
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own coaching snapshots" on public.coaching_snapshots;
create policy "Users can insert own coaching snapshots"
on public.coaching_snapshots
for insert
with check (auth.uid() = user_id);
