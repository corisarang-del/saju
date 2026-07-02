-- 월간사주 핵심 사주 테이블 RLS 복구 스크립트
-- P0 보안 핫픽스 이후 로컬/운영 모두 RLS를 켠 상태로 유지한다.

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

notify pgrst, 'reload schema';
