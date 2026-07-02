import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("cookie_inline_notice_regression", () => {
  it("keeps_mobile_cookie_notice_in_document_flow_instead_of_fixed_overlay", () => {
    const consent = readProjectFile("src/components/ui/cookie-consent.tsx");
    const layout = readProjectFile("src/app/[locale]/layout.tsx");

    expect(consent).toContain("role=\"region\"");
    expect(consent).toContain("aria-label=\"쿠키 안내\"");
    expect(consent).toContain("mx-auto max-w-5xl");
    expect(consent).toContain("animate-in fade-in slide-in-from-top-2");
    expect(consent).not.toContain("fixed");
    expect(consent).not.toContain("top-[calc(env(safe-area-inset-top)+0.75rem)]");
    expect(consent).not.toContain("bottom-6");
    expect(layout.indexOf("<ClientWidgets />")).toBeLessThan(layout.indexOf("{children}"));
  });

  it("keeps_cookie_actions_compact_and_non_blocking", () => {
    const consent = readProjectFile("src/components/ui/cookie-consent.tsx");

    expect(consent).toContain('localStorage.setItem("cookie_consent", "dismissed")');
    expect(consent).toContain("로그인과 서비스 이용에 필요한 쿠키만 사용해");
    expect(consent).toContain('href="/privacy-policy"');
    expect(consent).toContain("active:scale-[0.98]");
    expect(consent).not.toContain("z-20");
    expect(consent).not.toContain("z-50");
  });
});
