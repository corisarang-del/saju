-- 월간 전략 리포트 상세판은 월 1회 3별 차감 후 열린다.

create or replace function public.deduct_stars_for_monthly_report(
  p_user_id uuid
)
returns table(balance_after integer, already_unlocked boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report_cost integer := 3;
  v_current_balance integer;
  v_balance_after integer;
begin
  if auth.uid() is not null and auth.uid() <> p_user_id then
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

  if exists (
    select 1
    from public.star_transactions
    where user_id = p_user_id
      and type = 'monthly_report'
      and created_at >= date_trunc('month', now())
  ) then
    return query select v_current_balance, true;
    return;
  end if;

  if v_current_balance < v_report_cost then
    raise exception 'INSUFFICIENT_STARS';
  end if;

  update public.user_stars
  set balance = balance - v_report_cost
  where user_id = p_user_id
  returning balance into v_balance_after;

  insert into public.star_transactions (
    user_id,
    amount,
    balance_after,
    type
  )
  values (
    p_user_id,
    -v_report_cost,
    v_balance_after,
    'monthly_report'
  );

  return query select v_balance_after, false;
end;
$$;

revoke execute on function public.deduct_stars_for_monthly_report(uuid) from public;
revoke execute on function public.deduct_stars_for_monthly_report(uuid) from anon;
revoke execute on function public.deduct_stars_for_monthly_report(uuid) from authenticated;
grant execute on function public.deduct_stars_for_monthly_report(uuid) to service_role;

notify pgrst, 'reload schema';
