const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "supabase-env-missing":
    "Supabase 환경변수가 설정되지 않았어. .env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 넣고 서버를 재시작해줘.",
  "google-login-unavailable":
    "Google 로그인 URL을 만들지 못했어. Supabase Google Provider 설정과 환경변수를 확인해줘.",
  "auth-code-error":
    "Google 로그인 콜백 처리에 실패했어. Supabase Redirect URL 설정을 확인해줘.",
};

export function getAuthErrorMessage(errorCode: string | null | undefined): string {
  if (!errorCode) {
    return "";
  }

  return (
    AUTH_ERROR_MESSAGES[errorCode] ??
    "로그인 처리 중 문제가 생겼어. 잠시 후 다시 시도해줘."
  );
}
