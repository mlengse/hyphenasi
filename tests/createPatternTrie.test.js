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
  test("creates pattern trie and weights table correctly", () => {
    const patterns = [".ach4", ".ad4der"];
    const [weightsTable, trie] = createPatternTrie(patterns);

    expect(Array.isArray(weightsTable)).toBe(true);
    expect(trie).toBeDefined();
    expect(typeof trie).toBe("object");
  });
});
