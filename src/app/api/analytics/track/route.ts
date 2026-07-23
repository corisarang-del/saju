import { trackEvent } from "@/lib/analytics/track";
import type { AnalyticsEventType } from "@/types/analytics";

export const runtime = "nodejs";

const ANALYTICS_EVENT_TYPES = new Set<AnalyticsEventType>([
  "page_view",
  "signup",
  "login",
  "reading_start",
  "reading_complete",
  "chat_message",
  "purchase",
  "compatibility_start",
  "payment_success",
  "payment_failed",
]);

interface AnalyticsTrackRequest {
  event_type?: string;
  eventType?: string;
  page_path?: string;
  pagePath?: string;
  session_id?: string;
  sessionId?: string;
  referrer?: string;
  utm_source?: string;
  utmSource?: string;
  utm_medium?: string;
  utmMedium?: string;
  utm_campaign?: string;
  utmCampaign?: string;
  utm_content?: string;
  utmContent?: string;
  utm_term?: string;
  utmTerm?: string;
  properties?: Record<string, unknown>;
}

function toAnalyticsEventType(value: string | undefined): AnalyticsEventType | null {
  if (!value) return null;
  return ANALYTICS_EVENT_TYPES.has(value as AnalyticsEventType)
    ? (value as AnalyticsEventType)
    : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as AnalyticsTrackRequest;
    const eventType = toAnalyticsEventType(body.event_type ?? body.eventType);

    if (!eventType) {
      return Response.json({ ok: true });
    }

    await trackEvent({
      eventType,
      pagePath: body.page_path ?? body.pagePath,
      sessionId: body.session_id ?? body.sessionId,
      referrer: body.referrer,
      utmSource: body.utm_source ?? body.utmSource,
      utmMedium: body.utm_medium ?? body.utmMedium,
      utmCampaign: body.utm_campaign ?? body.utmCampaign,
      utmContent: body.utm_content ?? body.utmContent,
      utmTerm: body.utm_term ?? body.utmTerm,
      properties: body.properties,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[analytics] track route error:", error);
    return Response.json({ ok: true });
  }
}
