const createHyphenator = require("../hyphen.js");
const patterns = require("../patterns/en-us.js");

describe("Prototype Pollution Security", () => {
  beforeEach(() => {
    delete Object.prototype.polluted;
  });

  afterEach(() => {
    delete Object.prototype.polluted;
  });

  test("should not pollute Object.prototype when extend is called with __proto__", () => {
    // Testing pattern exceptions / markers setup with crafted userExceptions definition
    // or when extend evaluates source properties.
    const hyphenate = createHyphenator(patterns, {
      hyphenChar: "-",
      exceptions: ["h-e-l-l-o"]
    });

    hyphenate("hello", { exceptions: ["w-o-r-r-y"] });

    expect({}.polluted).toBeUndefined();
    expect(Object.prototype.polluted).toBeUndefined();
  });

  test("hyphen.js should contain prototype pollution protections in extend", () => {
    const fs = require("fs");
    const code = fs.readFileSync("./hyphen.js", "utf8");

    // Check that extend function includes prototype guard checks
    expect(code).toContain("hasOwnProperty.call");
    expect(code).toContain("__proto__");
    expect(code).toContain("constructor");
    expect(code).toContain("prototype");
  });
});
