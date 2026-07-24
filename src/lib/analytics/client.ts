"use client";

import type { AnalyticsEventType } from "@/types/analytics";

const SESSION_KEY = "monthly-saju:analytics-session-id";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateAnalyticsSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const sessionId = createSessionId();
  window.localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

export function trackClientEvent(
  eventType: AnalyticsEventType,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    eventType,
    pagePath: window.location.pathname,
    sessionId: getOrCreateAnalyticsSessionId(),
    referrer: document.referrer || undefined,
    properties,
  });

  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon(
      "/api/analytics/track",
      new Blob([payload], { type: "application/json" }),
    );
    if (sent) return;
  }

  void fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
