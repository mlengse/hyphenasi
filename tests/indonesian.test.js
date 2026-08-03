const createHyphenator = require("../hyphen.js");
const patterns = require("../patterns/id.js");
const kbbiSample = require("./fixtures/indonesian-kbbi.json");

let hyphenate;
let hyphenateShort;

beforeAll(() => {
  hyphenate = createHyphenator(patterns, { hyphenChar: "-" });
  hyphenateShort = createHyphenator(patterns, { hyphenChar: "-", minWordLength: 2 });
});

describe("Indonesian hyphenation", () => {
  test("Simple word: Indonesia", () => {
    expect(hyphenate("Indonesia")).toBe("In-do-ne-si-a");
  });

  test("Long word: Pemerintahan", () => {
    expect(hyphenate("Pemerintahan")).toBe("Pe-me-rin-tah-an");
  });

  test("Sentence: Republik Indonesia adalah negara kepulauan", () => {
    expect(hyphenate("Republik Indonesia adalah negara kepulauan")).toBe(
      "Re-pub-lik In-do-ne-si-a a-da-lah ne-ga-ra ke-pu-lau-an"
    );
  });

  test("HTML mode: should skip HTML tags", () => {
    expect(hyphenate('<p class="test">Indonesia</p>')).toBe(
      '<p class="test">In-do-ne-si-a</p>'
    );
  });

  test("Sync mode: should work without async", () => {
    const syncHyphenator = createHyphenator(patterns, {
      hyphenChar: "-",
      async: false
    });
    expect(syncHyphenator("Indonesia")).toBe("In-do-ne-si-a");
  });

  test("Compound: kepulauan", () => {
    expect(hyphenate("kepulauan")).toBe("ke-pu-lau-an");
  });

  test("Compound: demokratisasi", () => {
    expect(hyphenate("demokratisasi")).toBe("de-mo-kra-ti-sa-si");
  });

  test("Compound: perserikatan", () => {
    expect(hyphenate("perserikatan")).toBe("per-se-ri-kat-an");
  });

  test("Compound: kebangsaan", () => {
    expect(hyphenate("kebangsaan")).toBe("ke-bang-sa-an");
  });

  test("Affixed verb: membantu", () => {
    expect(hyphenate("membantu")).toBe("mem-ban-tu");
  });

  test("Sentence: Kesatuan Republik Indonesia", () => {
    expect(hyphenate("Kesatuan Republik Indonesia")).toBe(
      "Ke-sa-tu-an Re-pub-lik In-do-ne-si-a"
    );
  });

  test("Short word: aba", () => {
    expect(hyphenateShort("aba")).toBe("a-ba");
  });

  test("Short word: abai", () => {
    expect(hyphenateShort("abai")).toBe("a-bai");
  });

  test("Short word: boi", () => {
    expect(hyphenateShort("boi")).toBe("bo-i");
  });

  test("Short word: kia (override)", () => {
    expect(hyphenateShort("kia")).toBe("ki-a");
  });

  test("Short word: kpop (override)", () => {
    expect(hyphenateShort("kpop")).toBe("k-pop");
  });

  test("Short word: enak (override)", () => {
    expect(hyphenateShort("enak")).toBe("e-nak");
  });

  test("Sample of 800 words from KBBI ground truth (incl. 300 short)", () => {
    for (const [word, expected] of kbbiSample) {
      expect(hyphenateShort(word)).toBe(expected);
    }
  });
});
