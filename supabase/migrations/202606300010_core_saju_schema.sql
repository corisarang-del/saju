-- 월간사주 핵심 사주/채팅/궁합 스키마
-- Supabase SQL Editor에서 실행하면 saju_readings schema cache 오류를 해결한다.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.saju_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  name text not null,
  gender text not null check (gender in ('male', 'female')),
  birth_year integer not null,
  birth_month integer not null check (birth_month between 1 and 12),
  birth_day integer not null check (birth_day between 1 and 31),
  birth_hour integer null check (birth_hour is null or birth_hour between 0 and 23),
  birth_minute integer not null default 0 check (birth_minute between 0 and 59),
  is_lunar boolean not null default false,
  is_leap_month boolean not null default false,
  concerns text[] not null default '{}',
  four_pillars jsonb null,
  five_elements jsonb null,
  preview_summary text null,
  full_analysis jsonb null,
  status text not null default 'pending' check (
    status in ('pending', 'preview', 'paid', 'generating', 'completed', 'failed')
  ),
  paddle_transaction_id text null,
  pdf_url text null,
  birth_city text null,
  birth_longitude numeric null,
  chat_credits integer not null default 3 check (chat_credits >= 0),
  chat_used integer not null default 0 check (chat_used >= 0),
  character_id text not null default 'charon_f' check (
    character_id in ('charon_m', 'charon_f', 'doctor', 'minjun', 'haeun', 'jian', 'seojun', 'doyun')
  ),
  title text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_saju_readings_user_created_at
  on public.saju_readings(user_id, created_at desc);

create index if not exists idx_saju_readings_status
  on public.saju_readings(status);

drop trigger if exists set_saju_readings_updated_at on public.saju_readings;
create trigger set_saju_readings_updated_at
before update on public.saju_readings
for each row
execute function public.set_updated_at();

create table if not exists public.saju_chat_messages (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid not null references public.saju_readings(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  character_id text not null check (
    character_id in ('charon_m', 'charon_f', 'doctor', 'minjun', 'haeun', 'jian', 'seojun', 'doyun')
  ),
  created_at timestamptz not null default now()
);

create index if not exists idx_saju_chat_messages_reading_created_at
  on public.saju_chat_messages(reading_id, created_at asc);

create table if not exists public.saju_compatibilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  reading_id uuid not null references public.saju_readings(id) on delete cascade,
  partner_name text not null,
  partner_gender text not null check (partner_gender in ('male', 'female')),
  partner_birth_year integer not null,
  partner_birth_month integer not null check (partner_birth_month between 1 and 12),
  partner_birth_day integer not null check (partner_birth_day between 1 and 31),
  partner_birth_hour integer null check (
    partner_birth_hour is null or partner_birth_hour between 0 and 23
  ),
  partner_birth_minute integer not null default 0 check (partner_birth_minute between 0 and 59),
  partner_is_lunar boolean not null default false,
  partner_is_leap_month boolean not null default false,
  partner_four_pillars jsonb null,
  partner_five_elements jsonb null,
  analysis jsonb null,
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'generating', 'completed', 'failed')
  ),
  paddle_transaction_id text null,
  pdf_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_saju_compatibilities_reading_created_at
  on public.saju_compatibilities(reading_id, created_at desc);

create index if not exists idx_saju_compatibilities_user_created_at
  on public.saju_compatibilities(user_id, created_at desc);

drop trigger if exists set_saju_compatibilities_updated_at on public.saju_compatibilities;
create trigger set_saju_compatibilities_updated_at
before update on public.saju_compatibilities
for each row
execute function public.set_updated_at();

create or replace function public.set_saju_compatibility_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    select user_id
    into new.user_id
    from public.saju_readings
    where id = new.reading_id;
  end if;

  return new;
end;
$$;

drop trigger if exists set_saju_compatibility_user_id on public.saju_compatibilities;
create trigger set_saju_compatibility_user_id
before insert or update of reading_id, user_id on public.saju_compatibilities
for each row
execute function public.set_saju_compatibility_user_id();

drop view if exists public.saju_compatibility;
create or replace view public.saju_compatibility
with (security_invoker = true)
as
select *
from public.saju_compatibilities;

do $$
begin
  if to_regclass('public.saju_readings') is not null then
    execute 'alter table public.saju_readings enable row level security';
  end if;

  if to_regclass('public.saju_chat_messages') is not null then
    execute 'alter table public.saju_chat_messages enable row level security';
  end if;

  if to_regclass('public.saju_compatibilities') is not null then
    execute 'alter table public.saju_compatibilities enable row level security';
  end if;
end $$;

do $$
begin
  if to_regclass('public.star_transactions') is not null
    and not exists (
      select 1
      from pg_constraint
      where conname = 'star_transactions_reading_id_fkey'
    )
  then
    alter table public.star_transactions
      add constraint star_transactions_reading_id_fkey
      foreign key (reading_id)
      references public.saju_readings(id)
      on delete set null;
  end if;
end $$;

notify pgrst, 'reload schema';
