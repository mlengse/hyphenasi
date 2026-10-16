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
    expect(verifyHtml(accumulate, ["<", "a"])).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should start skipping on opening tag '<div'", () => {
    expect(verifyHtml(accumulate, ["<", "d"])).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should start skipping on closing tag '</p>'", () => {
    expect(verifyHtml(accumulate, ["<", "/"])).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should NOT start skipping if '<' is followed by a space '< '", () => {
    expect(verifyHtml(accumulate, ["<", " "])).toBe(false);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should NOT start skipping if '<' is followed by punctuation '<!'", () => {
    expect(verifyHtml(accumulate, ["<", "!"])).toBe(false);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should stay in skip mode for content inside tag and call accumulate on '>'", () => {
    // Enter HTML tag skip mode
    expect(verifyHtml(accumulate, ["<", "d"])).toBe(true);

    // Characters inside tag (e.g., 'i', 'v', ' ')
    expect(verifyHtml(accumulate, ["i", "v"])).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();

    expect(verifyHtml(accumulate, ["v", " "])).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();

    // Closing '>' character of tag
    expect(verifyHtml(accumulate, [">", "a"])).toBe(false);
    expect(accumulate).toHaveBeenCalledTimes(1);

    // Subsequent text after closing tag should not skip
    expect(verifyHtml(accumulate, ["a", "b"])).toBe(false);
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
    expect(verifyHyphen(accumulate, ["a", "-"])).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should NOT start skipping when chars[0] is not a letter", () => {
    expect(verifyHyphen(accumulate, [" ", "-"])).toBe(false);
    expect(verifyHyphen(accumulate, ["!", "-"])).toBe(false);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should NOT start skipping when chars[1] is not hyphenChar", () => {
    expect(verifyHyphen(accumulate, ["a", "b"])).toBe(false);
    expect(verifyHyphen(accumulate, ["a", " "])).toBe(false);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should stay in skip mode while inside hyphenated word", () => {
    // Trigger skip mode with 'a-'
    expect(verifyHyphen(accumulate, ["a", "-"])).toBe(true);

    // Intermediate letters (chars[0] and chars[1] are letters)
    expect(verifyHyphen(accumulate, ["-", "b"])).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();

    expect(verifyHyphen(accumulate, ["b", "c"])).toBe(true);
    expect(accumulate).not.toHaveBeenCalled();
  });

  test("should exit skip mode and call accumulate when reaching end of word (letter followed by non-letter)", () => {
    // Trigger skip mode with 'a-'
    expect(verifyHyphen(accumulate, ["a", "-"])).toBe(true);

    // Skip through word 'b'
    expect(verifyHyphen(accumulate, ["-", "b"])).toBe(true);

    // End of word: chars[0] is letter ('b'), chars[1] is non-letter (' ')
    expect(verifyHyphen(accumulate, ["b", " "])).toBe(false);
    expect(accumulate).toHaveBeenCalledTimes(1);

    // Subsequent normal characters after exiting skip mode
    expect(verifyHyphen(accumulate, ["c", "d"])).toBe(false);
  });

  test("should work with custom hyphen character like soft hyphen '\\u00AD'", () => {
    const verifySoftHyphen = createHyphenCharVerifier("\u00AD");

    expect(verifySoftHyphen(accumulate, ["a", "\u00AD"])).toBe(true);

    // End of word: letter + space
    expect(verifySoftHyphen(accumulate, ["b", " "])).toBe(false);
    expect(accumulate).toHaveBeenCalledTimes(1);
  });
});
