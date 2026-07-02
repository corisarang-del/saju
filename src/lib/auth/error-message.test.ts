import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "./error-message";

describe("auth_error_message", () => {
  it("returns_actionable_message_when_supabase_env_is_missing", () => {
    expect(getAuthErrorMessage("supabase-env-missing")).toBe(
      "Supabase 환경변수가 설정되지 않았어. .env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 넣고 서버를 재시작해줘.",
    );
  });

  it("returns_generic_message_when_error_code_is_unknown", () => {
    expect(getAuthErrorMessage("unknown")).toBe(
      "로그인 처리 중 문제가 생겼어. 잠시 후 다시 시도해줘.",
    );
  });
});
