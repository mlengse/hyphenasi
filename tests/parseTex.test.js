const { parseTex } = require("../scripts/parseTex.cjs");

describe("parseTex", () => {
  test("extracts patterns and hyphenation exceptions correctly", () => {
    const texCode = `
      % This is a comment
      \\patterns{
        .ach4
        .ad4der
        .af1t
      }
      \\hyphenation{
        at-ten-de
        be-tre
      }
    `;

    const [patterns, hyphenation, input] = parseTex(texCode);

    expect(patterns).toEqual([".ach4", ".ad4der", ".af1t"]);
    expect(hyphenation).toEqual(["at-ten-de", "be-tre"]);
    expect(input).toBeUndefined();
  });

  test("handles \\input directives", () => {
    const texCode = `
      \\input hyph-no.tex
      \\hyphenation{
        at-ten-de
      }
    `;

    const [patterns, hyphenation, input] = parseTex(texCode);

    expect(patterns).toEqual([]);
    expect(hyphenation).toEqual(["at-ten-de"]);
    expect(input).toBe("hyph-no.tex");
  });

  test("handles inline comments inside pattern blocks", () => {
    const texCode = `
      \\patterns{
        .ach4 % comment 1
        % full line comment
        .ad4der
      }
    `;

    const [patterns] = parseTex(texCode);

    expect(patterns).toEqual([".ach4", ".ad4der"]);
  });

  test("is immune to JavaScript code injection / malicious TeX input", () => {
    const maliciousTexCode = `
      \\patterns{
        process.exit(1);
        require('child_process').execSync('touch hacked.txt');
      }
    `;

    let globalFlag = false;
    global.hackedFlag = false;

    const [patterns] = parseTex(maliciousTexCode);

    expect(global.hackedFlag).toBe(false);
    expect(patterns).toEqual([
      "process.exit(1);",
      "require('child_process').execSync('touch",
      "hacked.txt');"
    ]);
  });
});
