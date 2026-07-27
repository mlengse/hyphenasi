const createHyphenator = require("../hyphen.js");

describe("Hindi (Devanagari) hyphenation", () => {
  let hyphenate;

  beforeAll(() => {
    hyphenate = createHyphenator(require("../patterns/hi.js"), {
      hyphenChar: "-"
    });
  });

  test("Simple word: नमस्ते", () => {
    expect(hyphenate("नमस्ते")).toBe("नम-स्ते");
  });

  test("Word: भारतीय", () => {
    expect(hyphenate("भारतीय")).toBe("भा-र-तीय");
  });

  test("Word: गणतंत्र", () => {
    expect(hyphenate("गणतंत्र")).toBe("गण-तं-त्र");
  });

  test("HTML mode: should skip HTML tags", () => {
    expect(hyphenate("<p>नमस्ते</p>")).toBe("<p>नम-स्ते</p>");
  });

  test("Sync mode: should work without async", () => {
    const syncHyphenator = createHyphenator(require("../patterns/hi.js"), {
      hyphenChar: "-",
      async: false
    });
    expect(syncHyphenator("भारतीय")).toBe("भा-र-तीय");
  });
});

describe("Thai hyphenation", () => {
  let hyphenate;

  beforeAll(() => {
    hyphenate = createHyphenator(require("../patterns/th.js"), {
      hyphenChar: "-"
    });
  });

  test("Simple word: สวัสดี", () => {
    expect(hyphenate("สวัสดี")).toBe("สวัส-ดี");
  });

  test("Word: ประเทศไทย", () => {
    expect(hyphenate("ประเทศไทย")).toBe("ประ-เทศ-ไทย");
  });

  test("Sentence: ประเทศไทยเป็นประเทศที่สวยงาม", () => {
    expect(hyphenate("ประเทศไทยเป็นประเทศที่สวยงาม")).toBe(
      "ประ-เทศ-ไทย-เป็น-ประ-เทศที่สวย-งาม"
    );
  });

  test("HTML mode: should skip HTML tags", () => {
    expect(hyphenate("<p>สวัสดี</p>")).toBe("<p>สวัส-ดี</p>");
  });
});

describe("Georgian hyphenation", () => {
  let hyphenate;

  beforeAll(() => {
    hyphenate = createHyphenator(require("../patterns/ka.js"), {
      hyphenChar: "-"
    });
  });

  test("Simple word: ქართული", () => {
    expect(hyphenate("ქართული")).toBe("ქარ-თუ-ლი");
  });

  test("Long word: საქართველო", () => {
    expect(hyphenate("საქართველო")).toBe("სა-ქარ-თვე-ლო");
  });

  test("Sentence: საქართველო ლამაზი ქვეყანაა", () => {
    expect(hyphenate("საქართველო ლამაზი ქვეყანაა")).toBe(
      "სა-ქარ-თვე-ლო ლა-მა-ზი ქვე-ყა-ნაა"
    );
  });
});

describe("Armenian hyphenation", () => {
  let hyphenate;

  beforeAll(() => {
    hyphenate = createHyphenator(require("../patterns/hy.js"), {
      hyphenChar: "-"
    });
  });

  test("Simple word: հայերեն", () => {
    expect(hyphenate("հայերեն")).toBe("հա-յե-րեն");
  });

  test("Word: հայաստան", () => {
    expect(hyphenate("հայաստան")).toBe("հա-յաստան");
  });

  test("Word: հայկական", () => {
    expect(hyphenate("հայկական")).toBe("հայկա-կան");
  });
});
