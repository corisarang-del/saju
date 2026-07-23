-- 관리자 별 수동 조정 감사로그와 원자적 조정 RPC

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  actor_email text not null,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  amount integer not null,
  before_balance integer not null check (before_balance >= 0),
  after_balance integer not null check (after_balance >= 0),
  reason text not null,
  ip_address text null,
  user_agent text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_logs_target_created_at
  on public.admin_audit_logs(target_user_id, created_at desc);

create index if not exists idx_admin_audit_logs_actor_created_at
  on public.admin_audit_logs(actor_user_id, created_at desc);

alter table public.admin_audit_logs enable row level security;

create or replace function public.admin_adjust_user_stars(
  p_target_user_id uuid,
  p_actor_user_id uuid,
  p_actor_email text,
  p_amount integer,
  p_mode text,
  p_reason text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns table(balance_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before_balance integer;
  v_after_balance integer;
  v_delta integer;
  v_action text;
begin
  if p_target_user_id is null or p_actor_user_id is null then
    raise exception 'INVALID_ADMIN_ADJUSTMENT_USER';
  end if;

  if p_amount is null or p_amount < 1 then
    raise exception 'INVALID_ADMIN_ADJUSTMENT_AMOUNT';
  end if;

  if p_mode not in ('credit', 'debit') then
    raise exception 'INVALID_ADMIN_ADJUSTMENT_MODE';
  end if;

  if length(trim(coalesce(p_reason, ''))) < 4 then
    raise exception 'ADMIN_ADJUSTMENT_REASON_REQUIRED';
  end if;

  insert into public.user_stars (user_id, balance)
  values (p_target_user_id, 0)
  on conflict (user_id) do nothing;

  select balance
    into v_before_balance
    from public.user_stars
   where user_id = p_target_user_id
   for update;

  if p_mode = 'credit' then
    v_delta := p_amount;
    v_after_balance := v_before_balance + p_amount;
    v_action := 'admin_credit';
  else
    if v_before_balance < p_amount then
      raise exception 'INSUFFICIENT_STARS';
    end if;

    v_delta := -p_amount;
    v_after_balance := v_before_balance - p_amount;
    v_action := 'admin_debit';
  end if;

  update public.user_stars
     set balance = v_after_balance
   where user_id = p_target_user_id;

  insert into public.star_transactions (
    user_id,
    amount,
    balance_after,
    type,
    product_type
  )
  values (
    p_target_user_id,
    v_delta,
    v_after_balance,
    v_action,
    v_action
  );

  insert into public.admin_audit_logs (
    actor_user_id,
    actor_email,
    target_user_id,
    action,
    amount,
    before_balance,
    after_balance,
    reason,
    ip_address,
    user_agent,
    metadata
  )
  values (
    p_actor_user_id,
    p_actor_email,
    p_target_user_id,
    v_action,
    v_delta,
    v_before_balance,
    v_after_balance,
    trim(p_reason),
    nullif(trim(coalesce(p_ip_address, '')), ''),
    nullif(trim(coalesce(p_user_agent, '')), ''),
    jsonb_build_object('source', 'admin_page')
  );

  balance_after := v_after_balance;
  return next;
end;
$$;

revoke execute on function public.admin_adjust_user_stars(uuid, uuid, text, integer, text, text, text, text) from public;
revoke execute on function public.admin_adjust_user_stars(uuid, uuid, text, integer, text, text, text, text) from anon;
revoke execute on function public.admin_adjust_user_stars(uuid, uuid, text, integer, text, text, text, text) from authenticated;
grant execute on function public.admin_adjust_user_stars(uuid, uuid, text, integer, text, text, text, text) to service_role;

notify pgrst, 'reload schema';
