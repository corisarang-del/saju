-- P0 보안 핫픽스: 핵심 사주 RLS 복구, 별 차감 원자화, Paddle idempotency.

create or replace function public.saju_reading_owner_id(p_reading_id uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select user_id
  from public.saju_readings
  where id = p_reading_id
$$;

alter table if exists public.saju_readings enable row level security;
alter table if exists public.saju_chat_messages enable row level security;
alter table if exists public.saju_compatibilities enable row level security;

drop policy if exists "Users can read own saju readings" on public.saju_readings;
create policy "Users can read own saju readings"
on public.saju_readings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own saju readings" on public.saju_readings;
create policy "Users can insert own saju readings"
on public.saju_readings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own saju readings" on public.saju_readings;
create policy "Users can update own saju readings"
on public.saju_readings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own saju readings" on public.saju_readings;
create policy "Users can delete own saju readings"
on public.saju_readings
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own chat messages" on public.saju_chat_messages;
create policy "Users can read own chat messages"
on public.saju_chat_messages
for select
using (auth.uid() = public.saju_reading_owner_id(reading_id));

drop policy if exists "Users can insert own chat messages" on public.saju_chat_messages;
create policy "Users can insert own chat messages"
on public.saju_chat_messages
for insert
with check (auth.uid() = public.saju_reading_owner_id(reading_id));

drop policy if exists "Users can delete own chat messages" on public.saju_chat_messages;
create policy "Users can delete own chat messages"
on public.saju_chat_messages
for delete
using (auth.uid() = public.saju_reading_owner_id(reading_id));

drop policy if exists "Users can read own compatibilities" on public.saju_compatibilities;
create policy "Users can read own compatibilities"
on public.saju_compatibilities
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own compatibilities" on public.saju_compatibilities;
create policy "Users can insert own compatibilities"
on public.saju_compatibilities
for insert
with check (
  auth.uid() = user_id
  and auth.uid() = public.saju_reading_owner_id(reading_id)
);

drop policy if exists "Users can update own compatibilities" on public.saju_compatibilities;
create policy "Users can update own compatibilities"
on public.saju_compatibilities
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create unique index if not exists star_transactions_paddle_transaction_id_key
on public.star_transactions(paddle_transaction_id)
where paddle_transaction_id is not null;

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

create or replace function public.deduct_stars_for_report(
  p_user_id uuid,
  p_reading_id uuid
)
returns table(balance_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_balance integer;
  v_balance_after integer;
begin
  select balance
  into v_current_balance
  from public.user_stars
  where user_id = p_user_id
  for update;

  if v_current_balance is null then
    raise exception 'INSUFFICIENT_STARS';
  end if;

  if v_current_balance < 1 then
    raise exception 'INSUFFICIENT_STARS';
  end if;

  update public.user_stars
  set balance = balance - 1
  where user_id = p_user_id
  returning balance into v_balance_after;

  insert into public.star_transactions (
    user_id,
    amount,
    balance_after,
    type,
    reading_id
  )
  values (
    p_user_id,
    -1,
    v_balance_after,
    'report',
    p_reading_id
  );

  return query select v_balance_after;
end;
$$;

grant execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) to authenticated, service_role;
grant execute on function public.deduct_stars_for_report(uuid, uuid) to authenticated, service_role;

notify pgrst, 'reload schema';
