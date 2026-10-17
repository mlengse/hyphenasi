describe("createHTMLVerifier", () => {
  let createHTMLVerifier;
  let verifyHtml;
  let accumulate;

  beforeAll(() => {
    // Dynamically evaluate src/hyphenationVerifier.js in Node/Jest context
    const fs = require("fs");
    let code = fs.readFileSync("./src/hyphenationVerifier.js", "utf8");
    code = code.replace(/export function /g, "function ");
    code += "\nreturn { createHTMLVerifier, createHyphenCharVerifier, createHyphenationVerifier };\n";
    const mod = new Function(code)();
    createHTMLVerifier = mod.createHTMLVerifier;
  });

  beforeEach(() => {
    verifyHtml = createHTMLVerifier();
    accumulate = jest.fn();
  });

  test("should start skipping on opening tag '<a'", () => {
    expect(verifyHtml(accumulate, "<", "a")).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should start skipping on opening tag '<div'", () => {
    expect(verifyHtml(accumulate, "<", "d")).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should start skipping on closing tag '</p>'", () => {
    expect(verifyHtml(accumulate, "<", "/")).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should NOT start skipping if '<' is followed by a space '< '", () => {
    expect(verifyHtml(accumulate, "<", " ")).toBe(false);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should NOT start skipping if '<' is followed by punctuation '<!'", () => {
    expect(verifyHtml(accumulate, "<", "!")).toBe(false);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should stay in skip mode for content inside tag and call accumulate on '>'", () => {
    // Enter HTML tag skip mode
    expect(verifyHtml(accumulate, "<", "d")).toBe(true);

    // Characters inside tag (e.g., 'i', 'v', ' ')
    expect(verifyHtml(accumulate, "i", "v")).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();

    expect(verifyHtml(accumulate, "v", " ")).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();

    // Closing '>' character of tag
    expect(verifyHtml(accumulate, ">", "a")).toBe(false);
    expect(accumulate).toHaveBeenCalledTimes(1);

    // Subsequent text after closing tag should not skip
    expect(verifyHtml(accumulate, "a", "b")).toBe(false);
  });
});

describe("createHyphenCharVerifier", () => {
  let createHyphenCharVerifier;
  let verifyHyphen;
  let accumulate;

  beforeAll(() => {
    const fs = require("fs");
    let code = fs.readFileSync("./src/hyphenationVerifier.js", "utf8");
    code = code.replace(/export function /g, "function ");
    code += "\nreturn { createHTMLVerifier, createHyphenCharVerifier, createHyphenationVerifier };\n";
    const mod = new Function(code)();
    createHyphenCharVerifier = mod.createHyphenCharVerifier;
  });

  beforeEach(() => {
    verifyHyphen = createHyphenCharVerifier("-");
    accumulate = jest.fn();
  });

  test("should start skipping when encountering a letter followed by hyphenChar", () => {
    expect(verifyHyphen(accumulate, "a", "-")).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should NOT start skipping when char1 is not a letter", () => {
    expect(verifyHyphen(accumulate, " ", "-")).toBe(false);
    expect(verifyHyphen(accumulate, "!", "-")).toBe(false);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should NOT start skipping when char2 is not hyphenChar", () => {
    expect(verifyHyphen(accumulate, "a", "b")).toBe(false);
    expect(verifyHyphen(accumulate, "a", " ")).toBe(false);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should stay in skip mode while inside hyphenated word", () => {
    // Trigger skip mode with 'a-'
    expect(verifyHyphen(accumulate, "a", "-")).toBe(true);

    // Intermediate letters (char1 and char2 are letters)
    expect(verifyHyphen(accumulate, "-", "b")).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();

    expect(verifyHyphen(accumulate, "b", "c")).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should exit skip mode and call accumulate when reaching end of word (letter followed by non-letter)", () => {
    // Trigger skip mode with 'a-'
    expect(verifyHyphen(accumulate, "a", "-")).toBe(true);

    // Skip through word 'b'
    expect(verifyHyphen(accumulate, "-", "b")).toBe(true);

    // End of word: char1 is letter ('b'), char2 is non-letter (' ')
    expect(verifyHyphen(accumulate, "b", " ")).toBe(false);
    expect(accumulate).toHaveBeenCalledTimes(1);

    // Subsequent normal characters after exiting skip mode
    expect(verifyHyphen(accumulate, "c", "d")).toBe(false);
  });

  test("should work with custom hyphen character like soft hyphen '\\u00AD'", () => {
    const verifySoftHyphen = createHyphenCharVerifier("\u00AD");

    expect(verifySoftHyphen(accumulate, "a", "\u00AD")).toBe(true);

    // End of word: letter + space
    expect(verifySoftHyphen(accumulate, "b", " ")).toBe(false);
    expect(accumulate).toHaveBeenCalledTimes(1);
  });
});

describe("createHyphenationVerifier", () => {
  let createHyphenationVerifier;

  beforeAll(() => {
    const fs = require("fs");
    let code = fs.readFileSync("./src/hyphenationVerifier.js", "utf8");
    code = code.replace(/export function /g, "function ");
    code += "\nreturn { createHTMLVerifier, createHyphenCharVerifier, createHyphenationVerifier };\n";
    const mod = new Function(code)();
    createHyphenationVerifier = mod.createHyphenationVerifier;
  });

  test("should resolve words that meet or exceed minWordLength", () => {
    const verifierFactory = createHyphenationVerifier([], 5);
    const verifier = verifierFactory();

    // Feeding "hello " char by char
    // 'h','e'
    expect(verifier("h", "e")).toBeUndefined();
    // 'e','l'
    expect(verifier("e", "l")).toBeUndefined();
    // 'l','l'
    expect(verifier("l", "l")).toBeUndefined();
    // 'l','o'
    expect(verifier("l", "o")).toBeUndefined();
    // 'o',' ' -> length of "hello" is 5 >= minWordLength (5) -> resolveWith(["", "hello"])
    const result = verifier("o", " ");
    expect(result).toEqual(["", "hello"]);
  });

  test("should accumulate words shorter than minWordLength instead of resolving immediately", () => {
    const verifierFactory = createHyphenationVerifier([], 5);
    const verifier = verifierFactory();

    // Feeding "hi world "
    // "hi" (len 2 < 5) -> accumulates "hi" into accum0 when 'i' followed by ' '
    expect(verifier("h", "i")).toBeUndefined();
    expect(verifier("i", " ")).toBeUndefined(); // accumulates "hi"

    // space followed by 'w': non-letter followed by letter -> accumulate space into accum0
    expect(verifier(" ", "w")).toBeUndefined();

    // "world" (len 5 >= 5) -> resolves with ["hi ", "world"]
    expect(verifier("w", "o")).toBeUndefined();
    expect(verifier("o", "r")).toBeUndefined();
    expect(verifier("r", "l")).toBeUndefined();
    expect(verifier("l", "d")).toBeUndefined();
    const result = verifier("d", " ");
    expect(result).toEqual(["hi ", "world"]);
  });

  test("should check verifiers and skip/short-circuit when a verifier returns true", () => {
    const mockVerifier1 = jest.fn().mockReturnValue(false);
    const mockVerifier2 = jest.fn().mockReturnValue(true);
    const mockVerifier3 = jest.fn().mockReturnValue(false);

    const verifierFactory = createHyphenationVerifier([mockVerifier1, mockVerifier2, mockVerifier3], 5);
    const verifier = verifierFactory();

    const result = verifier("a", "b");

    expect(result).toBeUndefined();
    expect(mockVerifier1).toHaveBeenCalledWith(expect.any(Function), "a", "b");
    expect(mockVerifier2).toHaveBeenCalledWith(expect.any(Function), "a", "b");
    // mockVerifier3 should not be called due to short-circuiting when mockVerifier2 returned true
    expect(mockVerifier3).not.toHaveBeenCalled();
  });

  test("should handle end of stream when char2 is empty string", () => {
    const verifierFactory = createHyphenationVerifier([], 5);
    const verifier = verifierFactory();

    // "cat" is length 3 (< minWordLength 5)
    verifier("c", "a");
    verifier("a", "t");
    // 't' followed by "" (end of stream) -> accum.length < 5 triggers accumulate(), returns [accum0, accum]
    const result = verifier("t", "");
    expect(result).toEqual(["cat", ""]);
  });

  test("should handle end of stream when word length >= minWordLength and char2 is empty string", () => {
    const verifierFactory = createHyphenationVerifier([], 5);
    const verifier = verifierFactory();

    // "hello" is length 5 (>= minWordLength 5)
    verifier("h", "e");
    verifier("e", "l");
    verifier("l", "l");
    verifier("l", "o");
    // 'o' followed by ""
    const result = verifier("o", "");
    expect(result).toEqual(["", "hello"]);
  });
});
