describe("src/markers.js", () => {
  let levelsToMarkers;
  let insertChar;
  let markersFromExceptionsDefinition;

  beforeAll(() => {
    const fs = require("fs");
    let code = fs.readFileSync("./src/markers.js", "utf8");
    code = code.replace(/export function /g, "function ");
    code += "\nreturn { levelsToMarkers, insertChar, markersFromExceptionsDefinition };\n";
    const mod = new Function(code)();
    levelsToMarkers = mod.levelsToMarkers;
    insertChar = mod.insertChar;
    markersFromExceptionsDefinition = mod.markersFromExceptionsDefinition;
  });

  describe("levelsToMarkers", () => {
    test.each([
      {
        description: "empty array",
        levels: [],
        expected: []
      },
      {
        description: "all even numbers",
        levels: [0, 2, 4, 6, 8, 100],
        expected: []
      },
      {
        description: "all odd numbers",
        levels: [1, 3, 5, 7, 9, 101],
        expected: [0, 1, 2, 3, 4, 5]
      },
      {
        description: "mixed even and odd numbers",
        levels: [0, 1, 0, 3, 2, 5, 4],
        expected: [1, 3, 5]
      },
      {
        description: "single element odd",
        levels: [1],
        expected: [0]
      },
      {
        description: "single element even",
        levels: [0],
        expected: []
      },
      {
        description: "negative numbers (odd vs even)",
        levels: [-1, -2, -3, -4],
        expected: [0, 2]
      }
    ])("should return correct indices for $description", ({ levels, expected }) => {
      expect(levelsToMarkers(levels)).toEqual(expected);
    });
  });

  describe("insertChar", () => {
    test("should return original text when markers array is empty", () => {
      expect(insertChar("hello", "-", [])).toBe("hello");
    });

    test("should insert hyphenChar at single marker index", () => {
      expect(insertChar("hello", "-", [2])).toBe("he-llo");
    });

    test("should insert hyphenChar at multiple marker indices", () => {
      expect(insertChar("hyphenation", "-", [2, 6, 7])).toBe("hy-phen-a-tion");
    });
  });

  describe("markersFromExceptionsDefinition", () => {
    test("should create markers dictionary from hyphenated exception definitions", () => {
      const exceptions = ["hy-phen-a-tion", "ex-am-ple"];
      const result = markersFromExceptionsDefinition(exceptions);

      expect(result).toEqual({
        hyphenation: [2, 6, 7],
        example: [2, 4]
      });
    });

    test("should handle words with no hyphens", () => {
      const exceptions = ["nohyphen"];
      const result = markersFromExceptionsDefinition(exceptions);

      expect(result).toEqual({
        nohyphen: []
      });
    });
  });
});
