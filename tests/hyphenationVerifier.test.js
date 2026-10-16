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
