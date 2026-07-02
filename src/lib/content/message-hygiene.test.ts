import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MESSAGE_FILES = ["ko", "en", "ja", "zh"].map(
  (locale) => `messages/${locale}.json`,
);

const FORMER_SAAS_KEYWORDS = [
  "SDS",
  "화학",
  "chemical",
  "LemonSqueezy",
  "your-email@example.com",
  "CAS",
  "GHS",
  "안전보건자료",
  "Imazify",
  "Amazon",
  "アマゾン",
  "亚马逊",
];

describe("message_hygiene", () => {
  it("keeps_localized_messages_aligned_with_monthly_saju", () => {
    for (const file of MESSAGE_FILES) {
      const content = readFileSync(join(process.cwd(), file), "utf8");

      for (const keyword of FORMER_SAAS_KEYWORDS) {
        expect(content, `${file} still contains ${keyword}`).not.toContain(
          keyword,
        );
      }
    }
  });
});
