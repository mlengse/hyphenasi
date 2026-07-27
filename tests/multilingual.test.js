const createHyphenator = require("../hyphen.js");
const frPatterns = require("../patterns/fr.js");
const dePatterns = require("../patterns/de-1996.js");

describe("French hyphenation", () => {
  let hyphenate;

  beforeAll(() => {
    hyphenate = createHyphenator(frPatterns, { hyphenChar: "-" });
  });

  test("Simple word: information", () => {
    expect(hyphenate("information")).toBe("in-for-ma-tion");
  });

  test("Word with diacritics: répétition", () => {
    expect(hyphenate("répétition")).toBe("ré-pé-ti-tion");
  });

  test("Sentence: Le petit prince est une œuvre magnifique", () => {
    expect(hyphenate("Le petit prince est une œuvre magnifique")).toBe(
      "Le pe-tit prince est une œuvre ma-gni-fique"
    );
  });
});

describe("German hyphenation", () => {
  let hyphenate;

  beforeAll(() => {
    hyphenate = createHyphenator(dePatterns, { hyphenChar: "-" });
  });

  test("Simple word: Handschuh", () => {
    expect(hyphenate("Handschuh")).toBe("Hand-schuh");
  });

  test("Compound word: Geschwindigkeitsbeschränkung", () => {
    expect(hyphenate("Geschwindigkeitsbeschränkung")).toBe(
      "Ge-schwin-dig-keits-be-schrän-kung"
    );
  });

  test("Sentence: Die Schnelle Bräune überfällt das faule Schwein", () => {
    expect(hyphenate("Die Schnelle Bräune überfällt das faule Schwein")).toBe(
      "Die Schnel-le Bräu-ne über-fällt das fau-le Schwein"
    );
  });
});
