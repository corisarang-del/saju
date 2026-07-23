import { describe, expect, it } from "vitest";
import { generateAdvancedSajuContext } from "./advanced-analysis";

describe("advanced_analysis_language", () => {
  it("keeps_astrology_context_in_korean_without_parenthesized_english_labels", async () => {
    const context = await generateAdvancedSajuContext(1994, 3, 12, 9, "male");

    expect(context).toContain("[서양 점성술");
    expect(context).toContain("상승궁");
    expect(context).toContain("중천");
    expect(context).not.toMatch(/\((Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\)/);
    expect(context).not.toMatch(/Western Astrology|Ascendant|Midheaven|Children's Palace|Emperor Star|supportive star/i);
  });
});
