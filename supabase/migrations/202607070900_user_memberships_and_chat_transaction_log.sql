-- 멤버십 상태 저장과 채팅 별 차감 거래 로그 보강

create table if not exists public.user_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'paddle',
  subscription_id text not null,
  status text not null,
  current_period_start timestamptz null,
  current_period_end timestamptz null,
  canceled_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, subscription_id)
);

create index if not exists idx_user_memberships_user_updated_at
  on public.user_memberships(user_id, updated_at desc);

alter table public.user_memberships enable row level security;

drop policy if exists "Users can read own memberships" on public.user_memberships;
create policy "Users can read own memberships"
on public.user_memberships
for select
using (auth.uid() = user_id);

drop trigger if exists set_user_memberships_updated_at on public.user_memberships;
create trigger set_user_memberships_updated_at
before update on public.user_memberships
for each row
execute function public.set_updated_at();

create or replace function public.decrement_star(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance_after integer;
begin
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  update public.user_stars
  set balance = balance - 1
  where user_id = p_user_id
    and balance > 0
  returning balance into v_balance_after;

  if v_balance_after is null then
    raise exception 'INSUFFICIENT_STARS';
  end if;

  insert into public.star_transactions (
    user_id,
    amount,
    balance_after,
    type,
    product_type
  )
  values (
    p_user_id,
    -1,
    v_balance_after,
    'chat_message',
    'chat_message'
  );
end;
$$;

revoke execute on function public.decrement_star(uuid) from public;
revoke execute on function public.decrement_star(uuid) from anon;
revoke execute on function public.decrement_star(uuid) from authenticated;
grant execute on function public.decrement_star(uuid) to service_role;

notify pgrst, 'reload schema';
