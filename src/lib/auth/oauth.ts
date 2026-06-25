const DEFAULT_SITE_URL = "http://localhost:3000";
const DEFAULT_NEXT_PATH = "/";

export function getSiteUrl(origin: string | null | undefined): string {
  const siteUrl = origin || process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SITE_URL;
  return siteUrl.replace(/\/+$/, "");
}

export function sanitizeAuthNext(
  next: string | null | undefined,
  fallback = DEFAULT_NEXT_PATH,
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(next, DEFAULT_SITE_URL);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;
  } catch {
    return fallback;
  }
}

export function buildAuthCallbackUrl({
  siteUrl,
  next,
}: {
  siteUrl: string;
  next?: string | null;
}): string {
  const callbackUrl = new URL("/auth/callback", siteUrl);
  const safeNext = sanitizeAuthNext(next);

  if (safeNext !== DEFAULT_NEXT_PATH) {
    callbackUrl.searchParams.set("next", safeNext);
  }

  return callbackUrl.toString();
}

export function buildLocalizedRedirectPath(next: string, locale: string): string {
  const safeNext = sanitizeAuthNext(next);
  const localePrefix = `/${locale}`;

  if (safeNext === localePrefix || safeNext.startsWith(`${localePrefix}/`)) {
    return safeNext;
  }

  return `${localePrefix}${safeNext === DEFAULT_NEXT_PATH ? "" : safeNext}`;
}

