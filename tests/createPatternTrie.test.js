const { createPatternTrie, normalizeEmptyNodes } = require("../scripts/createPatternTrie.cjs");

describe("normalizeEmptyNodes", () => {
  test("simplifies leaf node with weights only to the weight index", () => {
    const parent = {
      a: [{}, 1]
    };
    normalizeEmptyNodes(parent);
    expect(parent).toEqual({
      a: 1
    });
  });

  test("simplifies node with children only to the children object", () => {
    const parent = {
      a: [{ b: [{}, 2] }, undefined]
    };
    normalizeEmptyNodes(parent);
    expect(parent).toEqual({
      a: {
        b: 2
      }
    });
  });

  test("retains array structure [children, weight] when both children and weight exist", () => {
    const parent = {
      a: [{ b: [{}, 2] }, 1]
    };
    normalizeEmptyNodes(parent);
    expect(parent).toEqual({
      a: [{ b: 2 }, 1]
    });
  });

  test("handles deep recursive trie normalization", () => {
    const parent = {
      a: [
        {
          b: [
            {
              c: [{}, 3]
            },
            2
          ]
        },
        1
      ]
    };
    normalizeEmptyNodes(parent);
    expect(parent).toEqual({
      a: [
        {
          b: [
            {
              c: 3
            },
            2
          ]
        },
        1
      ]
    });
  });

  test("handles empty parent object", () => {
    const parent = {};
    normalizeEmptyNodes(parent);
    expect(parent).toEqual({});
  });

  test("handles node with empty children and no weights", () => {
    const parent = {
      a: [{}, undefined]
    };
    normalizeEmptyNodes(parent);
    expect(parent).toEqual({
      a: undefined
    });
  });
});

describe("createPatternTrie", () => {
  test("handles empty patterns array", () => {
    const [weightsTable, trie] = createPatternTrie([]);
    expect(weightsTable).toEqual([]);
    expect(trie).toEqual({});
  });

  test("creates pattern trie and weights table for single simple pattern", () => {
    // "a" -> weight 0 for 'a', pops trailing 0 => weights ""
    const [weightsTable, trie] = createPatternTrie(["a"]);
    expect(weightsTable).toEqual([""]);
    expect(trie).toEqual({
      a: 0
    });
  });

  test("handles leading dot and numbers in patterns correctly", () => {
    // ".ach4" -> '.' (no weight), 'a' (0), 'c' (0), 'h' (0), '4' (4) -> weights "0004"
    const [weightsTable, trie] = createPatternTrie([".ach4"]);
    expect(weightsTable).toEqual(["0004"]);
    expect(trie).toEqual({
      ".": {
        a: {
          c: {
            h: 0
          }
        }
      }
    });
  });

  test("strips trailing zero weights from pattern", () => {
    // "1a" -> '1' (1), 'a' (no leading 0 added since prev is num) -> weights "1"
    const [weightsTable, trie] = createPatternTrie(["1a"]);
    expect(weightsTable).toEqual(["1"]);
    expect(trie).toEqual({
      a: 0
    });
  });

  test("reuses duplicate weight strings in weightsTable", () => {
    // "a" -> weights "" (index 0)
    // "b" -> weights "" (index 0 - reused!)
    // "1c" -> weights "1" (index 1)
    // "1d" -> weights "1" (index 1 - reused!)
    const [weightsTable, trie] = createPatternTrie(["a", "b", "1c", "1d"]);
    expect(weightsTable).toEqual(["", "1"]);
    expect(trie).toEqual({
      a: 0,
      b: 0,
      c: 1,
      d: 1
    });
  });

  test("builds trie for overlapping pattern prefixes", () => {
    // "a1" -> 'a' (0), '1' (1) -> weights "01" (index 0)
    // "a1b2" -> 'a' (0), '1' (1), 'b' (prev num, no 0), '2' (2) -> weights "012" (index 1)
    const [weightsTable, trie] = createPatternTrie(["a1", "a1b2"]);
    expect(weightsTable).toEqual(["01", "012"]);
    expect(trie).toEqual({
      a: [{ b: 1 }, 0]
    });
  });

  test("creates pattern trie and weights table correctly for multiple patterns", () => {
    const patterns = [".ach4", ".ad4der"];
    const [weightsTable, trie] = createPatternTrie(patterns);

    expect(weightsTable).toEqual(["0004", "004"]);
    expect(trie).toEqual({
      ".": {
        a: {
          c: {
            h: 0
          },
          d: {
            d: {
              e: {
                r: 1
              }
            }
          }
        }
      }
    });
  });
});
