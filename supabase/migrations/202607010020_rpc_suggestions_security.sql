-- 민감 별 RPC 직접 호출 방어
-- authenticated 직접 실행을 닫고 서버 전용 service_role 경로에서만 호출한다.

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
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.saju_readings
    where id = p_reading_id
      and user_id = p_user_id
  ) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

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

revoke execute on function public.decrement_star(uuid) from public;
revoke execute on function public.decrement_star(uuid) from anon;
revoke execute on function public.decrement_star(uuid) from authenticated;

revoke execute on function public.deduct_stars_for_report(uuid, uuid) from public;
revoke execute on function public.deduct_stars_for_report(uuid, uuid) from anon;
revoke execute on function public.deduct_stars_for_report(uuid, uuid) from authenticated;

revoke execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) from public;
revoke execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) from anon;
revoke execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) from authenticated;

grant execute on function public.decrement_star(uuid) to service_role;
grant execute on function public.deduct_stars_for_report(uuid, uuid) to service_role;
grant execute on function public.credit_stars_for_paddle_purchase(uuid, integer, text, text) to service_role;

notify pgrst, 'reload schema';
