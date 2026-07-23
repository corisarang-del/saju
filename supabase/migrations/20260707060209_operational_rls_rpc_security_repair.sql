-- 운영 DB RLS/RPC 보안 복구.
-- 수동 SQL 적용으로 migration history가 비어 있는 운영 DB에 필요한 보안 상태를 재적용한다.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table if exists public.saju_readings enable row level security;
alter table if exists public.saju_chat_messages enable row level security;
alter table if exists public.saju_compatibilities enable row level security;
alter table if exists public.user_stars enable row level security;
alter table if exists public.star_transactions enable row level security;
alter table if exists public.coaching_snapshots enable row level security;

drop policy if exists "Users can read own saju readings" on public.saju_readings;
create policy "Users can read own saju readings"
on public.saju_readings
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own saju readings" on public.saju_readings;
create policy "Users can insert own saju readings"
on public.saju_readings
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own saju readings" on public.saju_readings;
create policy "Users can update own saju readings"
on public.saju_readings
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own saju readings" on public.saju_readings;
create policy "Users can delete own saju readings"
on public.saju_readings
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own chat messages" on public.saju_chat_messages;
create policy "Users can read own chat messages"
on public.saju_chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.saju_readings readings
    where readings.id = reading_id
      and readings.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can insert own chat messages" on public.saju_chat_messages;
create policy "Users can insert own chat messages"
on public.saju_chat_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.saju_readings readings
    where readings.id = reading_id
      and readings.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can delete own chat messages" on public.saju_chat_messages;
create policy "Users can delete own chat messages"
on public.saju_chat_messages
for delete
to authenticated
using (
  exists (
    select 1
    from public.saju_readings readings
    where readings.id = reading_id
      and readings.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can read own compatibilities" on public.saju_compatibilities;
create policy "Users can read own compatibilities"
on public.saju_compatibilities
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own compatibilities" on public.saju_compatibilities;
create policy "Users can insert own compatibilities"
on public.saju_compatibilities
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.saju_readings readings
    where readings.id = reading_id
      and readings.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update own compatibilities" on public.saju_compatibilities;
create policy "Users can update own compatibilities"
on public.saju_compatibilities
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own compatibilities" on public.saju_compatibilities;
create policy "Users can delete own compatibilities"
on public.saju_compatibilities
for delete
to authenticated
using ((select auth.uid()) = user_id);

create unique index if not exists star_transactions_paddle_transaction_id_key
on public.star_transactions(paddle_transaction_id)
where paddle_transaction_id is not null;

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
end;
$$;

create or replace function public.credit_stars_for_paddle_purchase(
  p_user_id uuid,
  p_credits integer,
  p_transaction_id text,
  p_product_type text
)
returns table(balance_after integer, inserted boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance_after integer;
begin
  if p_credits <= 0 or p_transaction_id is null or btrim(p_transaction_id) = '' then
    raise exception 'INVALID_PADDLE_CREDIT';
  end if;

  if exists (
    select 1
    from public.star_transactions
    where paddle_transaction_id = p_transaction_id
  ) then
    select balance
    into v_balance_after
    from public.user_stars
    where user_id = p_user_id;

    return query select coalesce(v_balance_after, 0), false;
    return;
  end if;

  insert into public.user_stars (user_id, balance)
  values (p_user_id, 3 + p_credits)
  on conflict (user_id) do update
  set balance = public.user_stars.balance + p_credits
  returning balance into v_balance_after;

  insert into public.star_transactions (
    user_id,
    amount,
    balance_after,
    type,
    paddle_transaction_id,
    product_type
  )
  values (
    p_user_id,
    p_credits,
    v_balance_after,
    'purchase',
    p_transaction_id,
    p_product_type
  );

  return query select v_balance_after, true;
exception
  when unique_violation then
    select balance
    into v_balance_after
    from public.user_stars
    where user_id = p_user_id;

    return query select coalesce(v_balance_after, 0), false;
end;
$$;

revoke execute on function public.decrement_star(uuid) from public;
revoke execute on function public.decrement_star(uuid) from anon;
revoke execute on function public.decrement_star(uuid) from authenticated;

revoke execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) from public;
revoke execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) from anon;
revoke execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) from authenticated;

revoke execute on function public.deduct_stars_for_report(uuid, uuid) from public;
revoke execute on function public.deduct_stars_for_report(uuid, uuid) from anon;
revoke execute on function public.deduct_stars_for_report(uuid, uuid) from authenticated;

revoke execute on function public.deduct_stars_for_monthly_report(uuid) from public;
revoke execute on function public.deduct_stars_for_monthly_report(uuid) from anon;
revoke execute on function public.deduct_stars_for_monthly_report(uuid) from authenticated;

grant execute on function public.decrement_star(uuid) to service_role;
grant execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) to service_role;
grant execute on function public.deduct_stars_for_report(uuid, uuid) to service_role;
grant execute on function public.deduct_stars_for_monthly_report(uuid) to service_role;

notify pgrst, 'reload schema';
