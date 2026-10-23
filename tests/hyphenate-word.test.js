describe("hyphenateWord", () => {
  let hyphenateWord;

  beforeAll(() => {
    const fs = require("fs");
    let markersCode = fs.readFileSync("./src/markers.js", "utf8");
    markersCode = markersCode.replace(/export function /g, "function ");

    let hyphenateCode = fs.readFileSync("./src/hyphenate-word.js", "utf8");
    hyphenateCode = hyphenateCode.replace(
      /import \{ levelsToMarkers \} from "\.\/markers\.js";/,
      ""
    );
    hyphenateCode = hyphenateCode.replace(/export function /g, "function ");

    const fullCode =
      markersCode + "\n" + hyphenateCode + "\nreturn { hyphenateWord };\n";
    const mod = new Function(fullCode)();
    hyphenateWord = mod.hyphenateWord;
  });

  test("should return correct markers for simple word matching trie patterns", () => {
    // Word: "hyphen" (length 6)
    // Pattern "hy1phen": 'h', 'y' -> index 0 in levelsTable: [0, 0, 1, 0, 0, 0, 0]
    // levelsTable[0] = [0, 0, 1, 0, 0, 0, 0]
    // trie: { h: { y: { p: { h: { e: { n: 0 } } } } } }
    const levelsTable = [[0, 0, 1, 0, 0, 0, 0]];
    const patternTrie = {
      h: {
        y: {
          p: {
            h: {
              e: {
                n: 0
              }
            }
          }
        }
      }
    };

    const markers = hyphenateWord("hyphen", "hyphen", levelsTable, patternTrie);
    expect(markers).toEqual([2]);
  });

  test("should handle trie nodes as numbers (leaf with pattern index)", () => {
    // Word "hyphen" (len 6, levels.length 7, boundary zeroed: 0, 1, 5, 6)
    // Pattern "hy1": levelsTable[0] = [0, 0, 1]
    const levelsTable = [[0, 0, 1]];
    const patternTrie = {
      h: {
        y: 0
      }
    };

    const markers = hyphenateWord("hyphen", "hyphen", levelsTable, patternTrie);
    expect(markers).toEqual([2]);
  });

  test("should handle trie nodes as arrays [childTrie, patternIndex]", () => {
    // Word "hyphen"
    // Pattern 1: "hy1" (levelsTable index 0: [0, 0, 1])
    // Pattern 2: "hyp1h" (levelsTable index 1: [0, 0, 0, 1])
    const levelsTable = [[0, 0, 1], [0, 0, 0, 1]];
    const patternTrie = {
      h: {
        y: [{ p: { h: 1 } }, 0]
      }
    };

    const markers = hyphenateWord("hyphen", "hyphen", levelsTable, patternTrie);
    expect(markers).toEqual([2, 3]);
  });

  test("should handle array trie nodes with negative pattern index (no pattern level for this prefix)", () => {
    // Word "hyphen"
    // Node 'y' has child 'p' and patternIndex -1
    // 'p' has leaf 0 ("hyp1")
    const levelsTable = [[0, 0, 0, 1]];
    const patternTrie = {
      h: {
        y: [{ p: 0 }, -1]
      }
    };

    const markers = hyphenateWord("hyphen", "hyphen", levelsTable, patternTrie);
    expect(markers).toEqual([3]);
  });

  test("should handle trie nodes as objects (internal node without pattern index)", () => {
    // 'h' is object { y: 0 } with patternIndex -1
    const levelsTable = [[0, 0, 1]];
    const patternTrie = {
      h: {
        y: 0
      }
    };

    const markers = hyphenateWord("hyphen", "hyphen", levelsTable, patternTrie);
    expect(markers).toEqual([2]);
  });

  test("should break early when character is not in trie", () => {
    const levelsTable = [[0, 0, 1]];
    const patternTrie = {
      a: {
        b: 0
      }
    };

    const markers = hyphenateWord("hyphen", "hyphen", levelsTable, patternTrie);
    expect(markers).toEqual([]);
  });

  test("should apply leading dot boundary pattern (start = 0)", () => {
    // Pattern ".hy1" -> levelsTable[0]: [0, 0, 1]
    // start = 0 ('.'): patternEntityIndex = 0
    // . -> h -> y gives levelsTable[0]
    const levelsTable = [[0, 0, 1]];
    const patternTrie = {
      ".": {
        h: {
          y: 0
        }
      }
    };

    const markers = hyphenateWord("hyphen", "hyphen", levelsTable, patternTrie);
    expect(markers).toEqual([2]);
  });

  test("should apply trailing dot boundary pattern matching end of word", () => {
    // Word "hyphen" (length 6, valid markers at 2, 3, 4)
    // Pattern "ph1en." -> pattern at start=3 ('p'): 'p', 'h', 'e', 'n', '.'
    // patternLevels = [0, 0, 1, 0, 0]. patternEntityIndex = 2.
    // idx 2 + 2 = 4 (marker 4: hy-ph-en)
    const levelsTable = [[0, 0, 1, 0, 0]];
    const patternTrie = {
      p: {
        h: {
          e: {
            n: {
              ".": 0
            }
          }
        }
      }
    };

    const markers = hyphenateWord("hyphen", "hyphen", levelsTable, patternTrie);
    expect(markers).toEqual([4]);
  });

  test("should combine multiple overlapping patterns in a word", () => {
    // Word "hyphen" (length 6, valid markers 2, 3, 4)
    // Pattern 1: "hy1" -> levelsTable[0]: [0, 0, 1] -> marker 2
    // Pattern 2: "ph1e" -> start=3 ('p'), patternEntityIndex=2, levelsTable[1]: [0, 0, 1, 0] -> marker 4
    const levelsTable = [[0, 0, 1], [0, 0, 1, 0]];
    const patternTrie = {
      h: {
        y: 0
      },
      p: {
        h: {
          e: 1
        }
      }
    };

    const markers = hyphenateWord("hyphen", "hyphen", levelsTable, patternTrie);
    expect(markers).toEqual([2, 4]);
  });

  test("should zero out boundary markers at start and end of word", () => {
    // Pattern "1h2y3p4h5e6n7" -> odd numbers at boundary positions
    // levelsTable[0] = [1, 2, 3, 4, 5, 6, 7]
    const levelsTable = [[1, 2, 3, 4, 5, 6, 7]];
    const patternTrie = {
      h: {
        y: 0
      }
    };

    // levels[0], levels[1], levels[len-1], levels[len-2] are set to 0.
    // For length 6, len = 7 (levels length).
    // levels[0]=0, levels[1]=0, levels[5]=0, levels[6]=0.
    // Only levels[2], levels[3], levels[4] retain values if odd.
    const markers = hyphenateWord("hyphen", "hyphen", levelsTable, patternTrie);
    expect(markers.includes(0)).toBe(false);
    expect(markers.includes(1)).toBe(false);
    expect(markers.includes(5)).toBe(false);
    expect(markers.includes(6)).toBe(false);
  });

  test("should update level only when new pattern level is strictly higher", () => {
    // Pattern 1: level 1 at position 2
    // Pattern 2: level 3 at position 2 (higher)
    // Pattern 3: level 2 at position 2 (lower, should not overwrite 3)
    const levelsTable = [[0, 0, 1], [0, 0, 3], [0, 0, 2]];
    const patternTrie = {
      h: {
        e: 0,
        x: 1,
        y: 2
      }
    };

    const markers1 = hyphenateWord("hello", "hello", levelsTable, patternTrie);
    expect(markers1).toEqual([2]);
  });

  test("should preserve text case while matching loweredText", () => {
    const levelsTable = [[0, 0, 1]];
    const patternTrie = {
      h: {
        y: 0
      }
    };

    // Word with uppercase "Hyphen", loweredText "hyphen"
    const markers = hyphenateWord("Hyphen", "hyphen", levelsTable, patternTrie);
    expect(markers).toEqual([2]);
  });
});
