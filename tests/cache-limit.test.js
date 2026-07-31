const createHyphenator = require("../hyphen.js");
const patterns = require("../patterns/en-us.js");

const TEXT =
  "international communication extraordinary development beautiful " +
  "understanding philosophical conversation sophisticated environment " +
  "accommodation implementation representation establishment organization";

describe("Bounded hyphenation cache", () => {
  test("Small cacheLimit preserves output correctness", () => {
    const bounded = createHyphenator(patterns, {
      hyphenChar: "-",
      async: false,
      cacheLimit: 5
    });
    const unlimited = createHyphenator(patterns, {
      hyphenChar: "-",
      async: false
    });

    expect(bounded(TEXT)).toBe(unlimited(TEXT));
  });

  test("cacheLimit 0 disables the cap", () => {
    const capped = createHyphenator(patterns, {
      hyphenChar: "-",
      async: false,
      cacheLimit: 0
    });
    const unlimited = createHyphenator(patterns, {
      hyphenChar: "-",
      async: false
    });

    expect(capped(TEXT)).toBe(unlimited(TEXT));
  });

  test("Repeated calls with eviction stay consistent", () => {
    const bounded = createHyphenator(patterns, {
      hyphenChar: "-",
      async: false,
      cacheLimit: 3
    });

    const first = bounded(TEXT);
    const second = bounded(TEXT);

    expect(second).toBe(first);
  });

  test("Evicted word is re-hyphenated identically", () => {
    const bounded = createHyphenator(patterns, {
      hyphenChar: "-",
      async: false,
      cacheLimit: 1
    });

    const first = bounded("international communication");
    const again = bounded("communication international");

    expect(bounded("international")).toBe(first.split(" ")[0]);
    expect(bounded("communication")).toBe(first.split(" ")[1]);
    expect(again.split(" ")[1]).toBe(first.split(" ")[0]);
  });
});
