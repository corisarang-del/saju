import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("pnpm_workspace_config", () => {
  it("declares_the_root_package_so_pnpm_run_dev_can_resolve_scripts", () => {
    const workspace = readFileSync(join(process.cwd(), "pnpm-workspace.yaml"), "utf8");

    expect(workspace).toContain("packages:");
    expect(workspace).toContain("- .");
  });
});
