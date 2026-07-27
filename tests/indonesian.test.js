const createHyphenator = require("../hyphen.js");
const patterns = require("../patterns/id.js");

let hyphenate;

beforeAll(() => {
  hyphenate = createHyphenator(patterns, { hyphenChar: "-" });
});

describe("Indonesian hyphenation", () => {
  test("Simple word: Indonesia", () => {
    expect(hyphenate("Indonesia")).toBe("In-do-ne-sia");
  });

  test("Long word: Pemerintahan", () => {
    expect(hyphenate("Pemerintahan")).toBe("Pe-me-rin-tah-an");
  });

  test("Sentence: Republik Indonesia adalah negara kepulauan", () => {
    expect(hyphenate("Republik Indonesia adalah negara kepulauan")).toBe(
      "Re-pu-blik In-do-ne-sia ada-lah ne-ga-ra ke-pu-la-u-an"
    );
  });

  test("HTML mode: should skip HTML tags", () => {
    expect(hyphenate('<p class="test">Indonesia</p>')).toBe(
      '<p class="test">In-do-ne-sia</p>'
    );
  });

  test("Sync mode: should work without async", () => {
    const syncHyphenator = createHyphenator(patterns, {
      hyphenChar: "-",
      async: false
    });
    expect(syncHyphenator("Indonesia")).toBe("In-do-ne-sia");
  });
});
