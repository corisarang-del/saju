const DEFAULT_SITE_URL = "http://localhost:3000";
const DEFAULT_NEXT_PATH = "/";

function cleanSiteUrl(value: string | null | undefined): string | null {
  if (!value || value === "undefined" || value === "null") {
    return null;
  }

  return value.replace(/\/+$/, "");
}

function getConfiguredSiteUrl(): string | null {
  return cleanSiteUrl(process.env.APP_ORIGIN)
    || cleanSiteUrl(process.env.NEXT_PUBLIC_APP_URL);
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function requireConfiguredSiteUrlInProduction(
  configuredSiteUrl: string | null,
): string | null {
  if (isProduction() && !configuredSiteUrl) {
    throw new Error("PRODUCTION_APP_ORIGIN_REQUIRED");
  }

  return configuredSiteUrl;
}

export function getSiteUrl(origin: string | null | undefined): string {
  const configuredSiteUrl = getConfiguredSiteUrl();
  requireConfiguredSiteUrlInProduction(configuredSiteUrl);

  if (isProduction() && configuredSiteUrl) {
    return configuredSiteUrl;
  }

  return cleanSiteUrl(origin)
    || configuredSiteUrl
    || DEFAULT_SITE_URL;
}

export function getSiteUrlFromRequestHeaders(headers: {
  get(name: string): string | null;
}): string {
  const configuredSiteUrl = getConfiguredSiteUrl();
  requireConfiguredSiteUrlInProduction(configuredSiteUrl);

  if (isProduction() && configuredSiteUrl) {
    return configuredSiteUrl;
  }

  const origin = headers.get("origin");
  const forwardedHost =
    headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headers.get("host");
  const forwardedProto =
    headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const forwardedUrl = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : null;
  const siteUrl =
    cleanSiteUrl(origin)
    || cleanSiteUrl(forwardedUrl)
    || configuredSiteUrl
    || DEFAULT_SITE_URL;

  return siteUrl;
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

export function buildAuthRedirectUrl({
  requestUrl,
  headers,
  path,
}: {
  requestUrl: string;
  headers: { get(name: string): string | null };
  path: string;
}): string {
  const siteUrl = getSiteUrlFromRequestHeaders(headers);
  const fallbackOrigin = new URL(requestUrl).origin;
  const baseUrl = siteUrl || fallbackOrigin;

  return `${baseUrl}${sanitizeAuthNext(path)}`;
}
