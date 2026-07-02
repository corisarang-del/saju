-- 월간사주 별(크레딧) 시스템 기본 스키마
-- Supabase SQL Editor에서 먼저 실행한 뒤 테스트 계정 별 충전을 진행한다.

create table if not exists public.user_stars (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.star_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  balance_after integer not null check (balance_after >= 0),
  type text not null,
  reading_id uuid null,
  paddle_transaction_id text null,
  product_type text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_star_transactions_user_created_at
  on public.star_transactions(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_stars_updated_at on public.user_stars;
create trigger set_user_stars_updated_at
before update on public.user_stars
for each row
execute function public.set_updated_at();

create or replace function public.decrement_star(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_stars
  set balance = balance - 1
  where user_id = p_user_id
    and balance > 0;
end;
$$;

alter table public.user_stars enable row level security;
alter table public.star_transactions enable row level security;

drop policy if exists "Users can read own stars" on public.user_stars;
create policy "Users can read own stars"
on public.user_stars
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own stars" on public.user_stars;
create policy "Users can insert own stars"
on public.user_stars
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own stars" on public.user_stars;
create policy "Users can update own stars"
on public.user_stars
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own star transactions" on public.star_transactions;
create policy "Users can read own star transactions"
on public.star_transactions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own star transactions" on public.star_transactions;
create policy "Users can insert own star transactions"
on public.star_transactions
for insert
with check (auth.uid() = user_id);

grant execute on function public.decrement_star(uuid) to authenticated, service_role;
