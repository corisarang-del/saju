import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

const routeFiles = [
  "src/app/api/saju/preview/route.ts",
  "src/app/api/saju/analyze/route.ts",
  "src/app/api/saju/compatibility/route.ts",
  "src/app/api/saju/chat/route.ts",
];

describe("invalid JSON API hardening", () => {
  it("saju_generation_routes_return_structured_400_when_body_is_not_json", () => {
    const routes = routeFiles.map((file) => ({
      file,
      source: readFileSync(file, "utf8"),
    }));

    expect(routes).toEqual(
      routeFiles.map((file) => ({
        file,
        source: expect.stringContaining("safeJson"),
      })),
    );

    for (const route of routes) {
      expect(route.source).not.toContain("await req.json()");
      expect(route.source).not.toContain("req.clone().json()");
      expect(route.source).toContain("return parsed.response");
    }
  });
});
