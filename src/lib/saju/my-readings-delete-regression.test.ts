import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("my_readings_delete_regression", () => {
  it("shows_an_individual_delete_button_for_each_my_readings_item", () => {
    const page = readProjectFile("src/app/[locale]/my-readings/page.tsx");

    expect(page).toContain("DeleteReadingButton");
    expect(page).toContain("readingId={reading.id}");
    expect(page).toContain("readingName={reading.name}");
  });

  it("confirms_deletes_and_refreshes_my_readings_without_full_page_reload", () => {
    const button = readProjectFile("src/components/saju/my-readings/DeleteReadingButton.tsx");

    expect(button).toContain('"use client"');
    expect(button).toContain("deleteReading(readingId)");
    expect(button).toContain("window.confirm");
    expect(button).toContain("router.refresh()");
    expect(button).not.toContain("window.location.reload");
  });

  it("keeps_reading_delete_action_owner_guarded", () => {
    const actions = readProjectFile("src/services/saju/chat-actions.ts");

    const deleteIndex = actions.indexOf("export async function deleteReading");
    const ownershipIndex = actions.indexOf("const ownership = await requireOwnedReading", deleteIndex);
    const deleteReadingIndex = actions.indexOf(".from(\"saju_readings\")", deleteIndex);

    expect(deleteIndex).toBeGreaterThan(-1);
    expect(ownershipIndex).toBeGreaterThan(deleteIndex);
    expect(deleteReadingIndex).toBeGreaterThan(ownershipIndex);
    expect(actions.slice(deleteIndex)).toContain(".eq(\"user_id\", ownership.userId)");
  });
});
