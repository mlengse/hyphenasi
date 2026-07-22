const createHyphenator = require("../hyphen.js");
const patterns = require("../patterns/id.js");

let hyphenate;

beforeAll(() => {
  hyphenate = createHyphenator(patterns, { hyphenChar: "-" });
});

describe("Indonesian hyphenation", () => {
  test("Simple word: Indonesia", () => {
    const result = hyphenate("Indonesia");
    expect(result).toContain("-");
  });

  test("Long word: Pemerintahan", () => {
    const result = hyphenate("Pemerintahan");
    expect(result).toContain("-");
  });

  test("Sentence: Republik Indonesia adalah negara kepulauan", () => {
    const result = hyphenate("Republik Indonesia adalah negara kepulauan");
    expect(result).toContain("-");
    expect(result).not.toBe("Republik Indonesia adalah negara kepulauan");
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
    const result = syncHyphenator("Indonesia");
    expect(result).toContain("-");
  });
});
