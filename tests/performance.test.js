const createHyphenator = require("../hyphen.js");
const patterns = require("../patterns/en-us.js");

function generateText(wordCount) {
  const words = [
    "beautiful",
    "extraordinary",
    "understanding",
    "philosophical",
    "conversation",
    "development",
    "international",
    "sophisticated",
    "communication",
    "environment"
  ];
  const result = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(words[i % words.length]);
  }
  return result.join(" ");
}

describe("Performance benchmarks", () => {
  let hyphenateSync;

  beforeAll(() => {
    hyphenateSync = createHyphenator(patterns, {
      hyphenChar: "-",
      async: false
    });
  });

  test("Short text (10 words) should complete in < 5ms", () => {
    const text = generateText(10);
    const start = Date.now();
    const result = hyphenateSync(text);
    const elapsed = Date.now() - start;

    console.log(`  Short (10 words): ${elapsed}ms`);
    expect(result).toContain("-");
    expect(elapsed).toBeLessThan(5);
  });

  test("Medium text (100 words) should complete in < 50ms", () => {
    const text = generateText(100);
    const start = Date.now();
    const result = hyphenateSync(text);
    const elapsed = Date.now() - start;

    console.log(`  Medium (100 words): ${elapsed}ms`);
    expect(result).toContain("-");
    expect(elapsed).toBeLessThan(50);
  });

  test("Long text (1000 words) should complete in < 200ms", () => {
    const text = generateText(1000);
    const start = Date.now();
    const result = hyphenateSync(text);
    const elapsed = Date.now() - start;

    console.log(`  Long (1000 words): ${elapsed}ms`);
    expect(result).toContain("-");
    expect(elapsed).toBeLessThan(200);
  });

  test("Very long text (10000 words) should complete in < 1000ms", () => {
    const text = generateText(10000);
    const start = Date.now();
    const result = hyphenateSync(text);
    const elapsed = Date.now() - start;

    console.log(`  Very long (10000 words): ${elapsed}ms`);
    expect(result).toContain("-");
    expect(elapsed).toBeLessThan(1000);
  });
});
