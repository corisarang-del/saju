"use client";

import { useEffect } from "react";
import { trackClientEvent } from "@/lib/analytics/client";
import type { AnalyticsEventType } from "@/types/analytics";

interface ClientAnalyticsEventProps {
  eventType: AnalyticsEventType;
  properties?: Record<string, unknown>;
}

export default function ClientAnalyticsEvent({
  eventType,
  properties,
}: ClientAnalyticsEventProps) {
  useEffect(() => {
    trackClientEvent(eventType, properties);
  }, [eventType, properties]);

  return null;
}
