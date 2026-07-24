import { describe, expect, it } from "vitest";
import {
  FREE_BETA_FUNNEL_EVENT_TYPES,
  type AnalyticsEventType,
} from "@/types/analytics";
import {
  FIRST_CONSULTATION_LOADING_STEPS,
  getFirstConsultationLoadingMessage,
} from "./free-beta-funnel";

describe("free_beta_funnel_analytics", () => {
  it("accepts_pm_required_free_beta_events", () => {
    expect(FREE_BETA_FUNNEL_EVENT_TYPES).toEqual<AnalyticsEventType[]>([
      "landing_view",
      "reading_page_view",
      "birth_date_completed",
      "gender_completed",
      "character_selected",
      "login_start",
      "login_success",
      "free_chat_started",
      "first_assistant_response_success",
      "first_assistant_response_failed",
      "follow_up_question_sent",
      "free_quota_exhausted",
      "pricing_panel_view",
      "coin_shop_view",
      "payment_disabled_notice_view",
    ]);
  });

  it("shows_first_consultation_progress_copy_by_elapsed_time", () => {
    expect(FIRST_CONSULTATION_LOADING_STEPS).toEqual([
      { afterMs: 0, message: "사주 흐름을 정리하고 있어" },
      { afterMs: 10_000, message: "고민에 맞는 상담 방향을 잡고 있어" },
      { afterMs: 30_000, message: "답변이 조금 길어지고 있어. 완료되면 바로 보여줄게" },
    ]);

    expect(getFirstConsultationLoadingMessage(0)).toBe("사주 흐름을 정리하고 있어");
    expect(getFirstConsultationLoadingMessage(12_000)).toBe("고민에 맞는 상담 방향을 잡고 있어");
    expect(getFirstConsultationLoadingMessage(35_000)).toBe("답변이 조금 길어지고 있어. 완료되면 바로 보여줄게");
  });
});
