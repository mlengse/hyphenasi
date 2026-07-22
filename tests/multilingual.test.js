const createHyphenator = require("../hyphen.js");
const frPatterns = require("../patterns/fr.js");
const dePatterns = require("../patterns/de-1996.js");

describe("French hyphenation", () => {
  let hyphenate;

  beforeAll(() => {
    hyphenate = createHyphenator(frPatterns, { hyphenChar: "-" });
  });

  test("Simple word: information", () => {
    const result = hyphenate("information");
    expect(result).toContain("-");
  });

  test("Word with diacritics: répétition", () => {
    const result = hyphenate("répétition");
    expect(result).toContain("-");
  });

  test("Sentence: Le petit prince est une œuvre magnifique", () => {
    const result = hyphenate("Le petit prince est une œuvre magnifique");
    expect(result).toContain("-");
  });
});

describe("German hyphenation", () => {
  let hyphenate;

  beforeAll(() => {
    hyphenate = createHyphenator(dePatterns, { hyphenChar: "-" });
  });

  test("Simple word: Handschuh", () => {
    const result = hyphenate("Handschuh");
    expect(result).toContain("-");
  });

  test("Compound word: Geschwindigkeitsbeschränkung", () => {
    const result = hyphenate("Geschwindigkeitsbeschränkung");
    expect(result).toContain("-");
  });

  test("Sentence: Die Schnelle Bräune überfällt das faule Schwein", () => {
    const result = hyphenate("Die Schnelle Bräune überfällt das faule Schwein");
    expect(result).toContain("-");
  });
});
