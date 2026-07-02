import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("next_proxy_convention", () => {
  it("uses_proxy_file_convention_instead_of_deprecated_middleware_file", () => {
    const projectRoot = process.cwd();

    expect(existsSync(join(projectRoot, "src", "proxy.ts"))).toBe(true);
    expect(existsSync(join(projectRoot, "src", "middleware.ts"))).toBe(false);
  });
});
