const createHyphenator = require("../hyphen.js");
const patterns = require("../patterns/en-us.js");

let hyphenate;

beforeAll(() => {
  hyphenate = createHyphenator(patterns, { hyphenChar: "-" });
});

describe("Basic text", () => {
  test("Text 1 should process to predictable result", () => {
    const basicText =
      "The Tortoise never stopped for a moment, walking slowly but steadily, right to the end of the course. The Hare ran fast and stopped to lie down for a rest. But he fell fast asleep. Eventually, he woke up and ran as fast as he could. But when he reached the end, he saw the Tortoise there already, sleeping comfortably after her effort.";
    const predictable =
      "The Tor-toise nev-er stopped for a mo-ment, walk-ing slow-ly but steadi-ly, right to the end of the course. The Hare ran fast and stopped to lie down for a rest. But he fell fast asleep. Even-tu-al-ly, he woke up and ran as fast as he could. But when he reached the end, he saw the Tor-toise there al-ready, sleep-ing com-fort-ably af-ter her ef-fort.";

    expect(hyphenate(basicText)).toBe(predictable);
  });
});

describe("Edge cases", () => {
  test("Empty string", () => {
    expect(hyphenate("")).toBe("");
  });

  test("Single character", () => {
    expect(hyphenate("a")).toBe("a");
  });

  test("Word shorter than minWordLength", () => {
    expect(hyphenate("hi")).toBe("hi");
  });

  test("Text with only spaces", () => {
    expect(hyphenate("   ")).toBe("   ");
  });

  test("Text with unicode characters", () => {
    const result = hyphenate("café résumé");
    expect(result).toContain("-");
  });

  test("Multiple spaces between words", () => {
    expect(hyphenate("hello  beautiful")).toBe("hel-lo  beau-ti-ful");
  });
});

describe("Punctuation edge cases", () => {
  test("Text ending with period", () => {
    expect(hyphenate("hello.")).toBe("hel-lo.");
  });

  test("Text ending with comma", () => {
    expect(hyphenate("word,")).toBe("word,");
  });

  test("Text ending with exclamation", () => {
    expect(hyphenate("beautiful!")).toBe("beau-ti-ful!");
  });

  test("Consecutive punctuation", () => {
    expect(hyphenate("hello...world")).toBe("hel-lo...world");
  });

  test("Mixed punctuation", () => {
    expect(hyphenate("hello, world!")).toBe("hel-lo, world!");
  });
});

describe("HTML edge cases", () => {
  test("Nested HTML tags", () => {
    expect(hyphenate('<div><span>beautiful</span></div>')).toBe(
      '<div><span>beau-ti-ful</span></div>'
    );
  });

  test("Already hyphenated word is preserved", () => {
    expect(hyphenate("hel-lo")).toBe("hel-lo");
  });
});
