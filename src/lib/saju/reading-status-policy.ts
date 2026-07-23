const CLIENT_ALLOWED_READING_STATUSES = new Set(["failed"]);

export function isClientAllowedReadingStatus(status: unknown): status is "failed" {
  return typeof status === "string" && CLIENT_ALLOWED_READING_STATUSES.has(status);
}

export function isPrivilegedReadingStatus(status: unknown): boolean {
  return status === "paid" || status === "generating" || status === "completed";
}
