const fs = require("fs");

describe("start function", () => {
  let start;

  beforeAll(() => {
    let markersCode = fs.readFileSync("./src/markers.js", "utf8");
    markersCode = markersCode.replace(/export function /g, "function ");

    let hyphenateCode = fs.readFileSync("./src/hyphenate-word.js", "utf8");
    hyphenateCode = hyphenateCode.replace(
      /import \{ levelsToMarkers \} from "\.\/markers\.js";/,
      ""
    );
    hyphenateCode = hyphenateCode.replace(/export function /g, "function ");

    let verifierCode = fs.readFileSync("./src/hyphenationVerifier.js", "utf8");
    verifierCode = verifierCode.replace(/export function /g, "function ");

    let textReaderCode = fs.readFileSync("./src/textReader.js", "utf8");
    textReaderCode = textReaderCode.replace(/export function /g, "function ");

    let startCode = fs.readFileSync("./src/start.js", "utf8");
    startCode = startCode.replace(/import [^;]+;/g, "");
    startCode = startCode.replace(/export function /g, "function ");

    const fullCode = [
      markersCode,
      hyphenateCode,
      verifierCode,
      textReaderCode,
      startCode,
      "return { start };"
    ].join("\n");

    const mod = new Function(fullCode)();
    start = mod.start;
  });

  test("should hyphenate text synchronously", () => {
    const levelsTable = [[0, 0, 1]];
    const patterns = { h: { y: 0 } };
    const cache = {};
    const markersDict = {};

    // "hyphen" with pattern "hy1" -> "hy-phen"
    const result = start(
      "hyphen",
      levelsTable,
      patterns,
      cache,
      markersDict,
      "-",
      false,
      5,
      false,
      0
    );

    expect(result).toBe("hy-phen");
  });

  test("should hyphenate text asynchronously returning a Promise", async () => {
    const levelsTable = [[0, 0, 1]];
    const patterns = { h: { y: 0 } };
    const cache = {};
    const markersDict = {};

    const promise = start(
      "hyphen",
      levelsTable,
      patterns,
      cache,
      markersDict,
      "-",
      false,
      5,
      true,
      0
    );

    expect(promise).toBeInstanceOf(Promise);
    const result = await promise;
    expect(result).toBe("hy-phen");
  });

  test("should use cache on duplicate words", () => {
    const levelsTable = [[0, 0, 1]];
    const patterns = { h: { y: 0 } };
    const cache = {};
    const markersDict = {};

    const result = start(
      "hyphen hyphen",
      levelsTable,
      patterns,
      cache,
      markersDict,
      "-",
      false,
      5,
      false,
      0
    );

    expect(result).toBe("hy-phen hy-phen");
    expect(cache["~hyphen"]).toBe("hy-phen");
  });

  test("should handle cacheLimit eviction", () => {
    const levelsTable = [[0, 0, 1]];
    const patterns = {
      w: { o: { r: { d: { a: 0, b: 0, c: 0 } } } }
    };
    const cache = {};
    const markersDict = {};

    // cacheLimit = 2
    // Process "worda wordb wordc"
    const result = start(
      "worda wordb wordc",
      levelsTable,
      patterns,
      cache,
      markersDict,
      "-",
      false,
      5,
      false,
      2
    );

    expect(result).toBe("wo-rda wo-rdb wo-rdc");
    // After third word exceeds cacheLimit (2), cache is reset and only holds counter and last word
    expect(cache["\u0000cacheCount"]).toBe(1);
    expect(cache["~wordc"]).toBe("wo-rdc");
    expect(cache["~worda"]).toBeUndefined();
    expect(cache["~wordb"]).toBeUndefined();
  });

  test("should reuse pre-existing entries in markersDict", () => {
    const levelsTable = [];
    const patterns = {};
    const cache = {};
    // Pre-populate markersDict with explicit hyphenation markers for "custom" -> marker at index 3
    const markersDict = { custom: [3] };

    const result = start(
      "custom",
      levelsTable,
      patterns,
      cache,
      markersDict,
      "-",
      false,
      5,
      false,
      0
    );

    expect(result).toBe("cus-tom");
  });

  test("should respect skipHTML flag", () => {
    const levelsTable = [[0, 0, 1]];
    const patterns = { h: { y: 0 } };
    const cache = {};
    const markersDict = {};

    // skipHTML = true -> HTML tags like <div> should not be hyphenated
    const resultHtmlSkipped = start(
      "<div>hyphen</div>",
      levelsTable,
      patterns,
      cache,
      markersDict,
      "-",
      true,
      5,
      false,
      0
    );
    expect(resultHtmlSkipped).toBe("<div>hy-phen</div>");

    // skipHTML = false -> HTML tag characters are not skipped as tags
    const resultHtmlNotSkipped = start(
      "<divhyphen>",
      levelsTable,
      patterns,
      cache,
      {},
      "-",
      false,
      5,
      false,
      0
    );
    // When skipHTML is false, "divhyphen" inside <...> is treated as a word
    expect(resultHtmlNotSkipped).toContain("hy-phen");
  });

  test("should respect minWordLength parameter", () => {
    const levelsTable = [[0, 0, 1]];
    const patterns = { h: { y: 0 } };
    const cache = {};
    const markersDict = {};

    // Word "hyphen" has length 6. With minWordLength 10, it should not be hyphenated.
    const result = start(
      "hyphen",
      levelsTable,
      patterns,
      cache,
      markersDict,
      "-",
      false,
      10,
      false,
      0
    );

    expect(result).toBe("hyphen");
  });

  test("should use custom hyphenChar", () => {
    const levelsTable = [[0, 0, 1]];
    const patterns = { h: { y: 0 } };
    const cache = {};
    const markersDict = {};

    const result = start(
      "hyphen",
      levelsTable,
      patterns,
      cache,
      markersDict,
      "&shy;",
      false,
      5,
      false,
      0
    );

    expect(result).toBe("hy&shy;phen");
  });
});
