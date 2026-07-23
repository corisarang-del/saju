-- production 상담 QA: 서버리스 인스턴스가 갈라져도 같은 reading 동시 생성은 하나만 허용한다.

create table if not exists public.chat_generation_locks (
  user_id uuid not null references auth.users(id) on delete cascade,
  reading_id uuid not null references public.saju_readings(id) on delete cascade,
  request_id uuid not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, reading_id)
);

create index if not exists idx_chat_generation_locks_expires_at
  on public.chat_generation_locks(expires_at);

alter table public.chat_generation_locks enable row level security;

create or replace function public.acquire_chat_generation_lock(
  p_user_id uuid,
  p_reading_id uuid,
  p_request_id uuid,
  p_ttl_seconds integer default 180
)
returns table(acquired boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_acquired boolean := false;
begin
  if p_user_id is null then
    raise exception 'INVALID_USER_ID';
  end if;

  if p_reading_id is null then
    raise exception 'INVALID_READING_ID';
  end if;

  if p_request_id is null then
    raise exception 'INVALID_REQUEST_ID';
  end if;

  if p_ttl_seconds is null or p_ttl_seconds < 1 or p_ttl_seconds > 600 then
    raise exception 'INVALID_LOCK_TTL';
  end if;

  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  insert into public.chat_generation_locks (
    user_id,
    reading_id,
    request_id,
    expires_at,
    created_at,
    updated_at
  )
  values (
    p_user_id,
    p_reading_id,
    p_request_id,
    v_now + make_interval(secs => p_ttl_seconds),
    v_now,
    v_now
  )
  on conflict (user_id, reading_id) do update
    set request_id = excluded.request_id,
        expires_at = excluded.expires_at,
        updated_at = excluded.updated_at
    where public.chat_generation_locks.expires_at <= v_now
  returning true into v_acquired;

  return query select coalesce(v_acquired, false);
end;
$$;

create or replace function public.release_chat_generation_lock(
  p_user_id uuid,
  p_reading_id uuid,
  p_request_id uuid
)
returns table(released boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_released boolean := false;
begin
  if p_user_id is null then
    raise exception 'INVALID_USER_ID';
  end if;

  if p_reading_id is null then
    raise exception 'INVALID_READING_ID';
  end if;

  if p_request_id is null then
    raise exception 'INVALID_REQUEST_ID';
  end if;

  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  delete from public.chat_generation_locks
   where user_id = p_user_id
     and reading_id = p_reading_id
     and request_id = p_request_id
  returning true into v_released;

  return query select coalesce(v_released, false);
end;
$$;

revoke execute on function public.acquire_chat_generation_lock(uuid, uuid, uuid, integer) from public;
revoke execute on function public.acquire_chat_generation_lock(uuid, uuid, uuid, integer) from anon;
revoke execute on function public.acquire_chat_generation_lock(uuid, uuid, uuid, integer) from authenticated;
grant execute on function public.acquire_chat_generation_lock(uuid, uuid, uuid, integer) to service_role;

revoke execute on function public.release_chat_generation_lock(uuid, uuid, uuid) from public;
revoke execute on function public.release_chat_generation_lock(uuid, uuid, uuid) from anon;
revoke execute on function public.release_chat_generation_lock(uuid, uuid, uuid) from authenticated;
grant execute on function public.release_chat_generation_lock(uuid, uuid, uuid) to service_role;
