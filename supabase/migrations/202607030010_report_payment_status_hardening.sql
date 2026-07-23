-- 리포트 결제 상태 승격을 별 차감 RPC 안에서 원자적으로 처리한다.

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
  v_reading_status text;
begin
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select status
  into v_reading_status
  from public.saju_readings
  where id = p_reading_id
    and user_id = p_user_id
  for update;

  if v_reading_status is null then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if v_reading_status in ('paid', 'generating', 'completed') then
    raise exception 'REPORT_ALREADY_PAID' using errcode = '23505';
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

  update public.saju_readings
  set status = 'paid',
      updated_at = now()
  where id = p_reading_id
    and user_id = p_user_id;

  return query select v_balance_after;
end;
$$;

revoke execute on function public.deduct_stars_for_report(uuid, uuid) from public;
revoke execute on function public.deduct_stars_for_report(uuid, uuid) from anon;
revoke execute on function public.deduct_stars_for_report(uuid, uuid) from authenticated;
grant execute on function public.deduct_stars_for_report(uuid, uuid) to service_role;

notify pgrst, 'reload schema';
