-- 배포 전 릴리즈게이트: 별 직접 조작 잠금, 채팅 예약/환불 RPC, 공유 rate limit 저장소

alter table if exists public.user_stars enable row level security;
alter table if exists public.star_transactions enable row level security;

drop policy if exists "Users can insert own stars" on public.user_stars;
drop policy if exists "Users can update own stars" on public.user_stars;
drop policy if exists "Users can insert own star transactions" on public.star_transactions;

drop policy if exists "Users can read own stars" on public.user_stars;
create policy "Users can read own stars"
on public.user_stars
for select
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own star transactions" on public.star_transactions;
create policy "Users can read own star transactions"
on public.star_transactions
for select
using ((select auth.uid()) = user_id);

create or replace function public.reserve_chat_star(p_user_id uuid)
returns table(balance_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before_balance integer;
  v_after_balance integer;
begin
  if p_user_id is null then
    raise exception 'INVALID_USER_ID';
  end if;

  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  insert into public.user_stars (user_id, balance)
  values (p_user_id, 3)
  on conflict (user_id) do nothing;

  select balance
    into v_before_balance
    from public.user_stars
   where user_id = p_user_id
   for update;

  if v_before_balance is null or v_before_balance <= 0 then
    raise exception 'INSUFFICIENT_STARS';
  end if;

  v_after_balance := v_before_balance - 1;

  update public.user_stars
     set balance = v_after_balance
   where user_id = p_user_id;

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
    v_after_balance,
    'chat_message',
    'chat_message'
  );

  return query select v_after_balance;
end;
$$;

create or replace function public.refund_chat_star(
  p_user_id uuid,
  p_reason text,
  p_reading_id uuid default null
)
returns table(balance_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before_balance integer;
  v_after_balance integer;
  v_reason text;
begin
  if p_user_id is null then
    raise exception 'INVALID_USER_ID';
  end if;

  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  insert into public.user_stars (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select balance
    into v_before_balance
    from public.user_stars
   where user_id = p_user_id
   for update;

  v_after_balance := coalesce(v_before_balance, 0) + 1;
  v_reason := left(nullif(trim(coalesce(p_reason, '')), ''), 80);

  update public.user_stars
     set balance = v_after_balance
   where user_id = p_user_id;

  insert into public.star_transactions (
    user_id,
    amount,
    balance_after,
    type,
    reading_id,
    product_type
  )
  values (
    p_user_id,
    1,
    v_after_balance,
    'chat_refund',
    p_reading_id,
    coalesce(v_reason, 'chat_refund')
  );

  return query select v_after_balance;
end;
$$;

create table if not exists public.rate_limits (
  identifier text primary key,
  window_started_at timestamptz not null default now(),
  count integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rate_limits_updated_at
  on public.rate_limits(updated_at);

alter table public.rate_limits enable row level security;

create or replace function public.check_rate_limit(
  p_identifier text,
  p_limit integer,
  p_window_seconds integer
)
returns table(allowed boolean, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_started_at timestamptz;
  v_count integer;
  v_now timestamptz := now();
  v_remaining integer;
begin
  if nullif(trim(coalesce(p_identifier, '')), '') is null then
    raise exception 'INVALID_RATE_LIMIT_IDENTIFIER';
  end if;

  if p_limit is null or p_limit < 1 then
    raise exception 'INVALID_RATE_LIMIT_LIMIT';
  end if;

  if p_window_seconds is null or p_window_seconds < 1 then
    raise exception 'INVALID_RATE_LIMIT_WINDOW';
  end if;

  insert into public.rate_limits (identifier, window_started_at, count, updated_at)
  values (p_identifier, v_now, 0, v_now)
  on conflict (identifier) do nothing;

  select window_started_at, count
    into v_window_started_at, v_count
    from public.rate_limits
   where identifier = p_identifier
   for update;

  if v_window_started_at <= v_now - make_interval(secs => p_window_seconds) then
    update public.rate_limits
       set window_started_at = v_now,
           count = 1,
           updated_at = v_now
     where identifier = p_identifier;

    return query select true, p_limit - 1;
    return;
  end if;

  if v_count >= p_limit then
    return query select false, 0;
    return;
  end if;

  v_count := v_count + 1;
  v_remaining := greatest(p_limit - v_count, 0);

  update public.rate_limits
     set count = v_count,
         updated_at = v_now
   where identifier = p_identifier;

  return query select true, v_remaining;
end;
$$;

revoke execute on function public.reserve_chat_star(uuid) from public;
revoke execute on function public.reserve_chat_star(uuid) from anon;
revoke execute on function public.reserve_chat_star(uuid) from authenticated;
grant execute on function public.reserve_chat_star(uuid) to service_role;

revoke execute on function public.refund_chat_star(uuid, text, uuid) from public;
revoke execute on function public.refund_chat_star(uuid, text, uuid) from anon;
revoke execute on function public.refund_chat_star(uuid, text, uuid) from authenticated;
grant execute on function public.refund_chat_star(uuid, text, uuid) to service_role;

revoke execute on function public.check_rate_limit(text, integer, integer) from public;
revoke execute on function public.check_rate_limit(text, integer, integer) from anon;
revoke execute on function public.check_rate_limit(text, integer, integer) from authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

revoke execute on function public.decrement_star(uuid) from public;
revoke execute on function public.decrement_star(uuid) from anon;
revoke execute on function public.decrement_star(uuid) from authenticated;
grant execute on function public.decrement_star(uuid) to service_role;

notify pgrst, 'reload schema';
