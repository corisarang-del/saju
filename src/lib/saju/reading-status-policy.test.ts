import { describe, expect, it } from "vitest";
import {
  isClientAllowedReadingStatus,
  isPrivilegedReadingStatus,
} from "./reading-status-policy";

describe("reading_status_policy", () => {
  it("rejects_client_paid_status_when_user_attempts_payment_escalation", () => {
    expect(isClientAllowedReadingStatus("paid")).toBe(false);
  });

  it("rejects_client_generation_statuses_when_user_attempts_lifecycle_escalation", () => {
    expect(isClientAllowedReadingStatus("generating")).toBe(false);
    expect(isClientAllowedReadingStatus("completed")).toBe(false);
  });

  it("allows_client_failed_status_when_user_reports_recoverable_failure", () => {
    expect(isClientAllowedReadingStatus("failed")).toBe(true);
  });

  it("classifies_paid_generating_and_completed_as_privileged_statuses", () => {
    expect(isPrivilegedReadingStatus("paid")).toBe(true);
    expect(isPrivilegedReadingStatus("generating")).toBe(true);
    expect(isPrivilegedReadingStatus("completed")).toBe(true);
    expect(isPrivilegedReadingStatus("failed")).toBe(false);
  });
});
