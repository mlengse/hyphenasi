const createHyphenator = require("../hyphen.js");
const patterns = require("../patterns/id.js");

const WORDS = [
  "pemerintahan",
  "indonesia",
  "republik",
  "kepulauan",
  "demokrasi",
  "pendidikan",
  "kesehatan",
  "masyarakat",
  "pembangunan",
  "persatuan",
  "kemerdekaan",
  "kebangsaan",
  "keadilan",
  "kesejahteraan",
  "musyawarah",
  "mufakat",
  "pancasila",
  "perserikatan",
  "perjuangan",
  "gotongroyong",
  "kebudayaan",
  "kepercayaan",
  "pelayanan",
  "pengembangan",
  "pertumbuhan",
  "perekonomian",
  "infrastruktur",
  "transportasi",
  "komunikasi",
  "informasi",
  "teknologi",
  "nasional",
  "internasional",
  "kelembagaan",
  "kewenangan",
  "pertanggungjawaban",
  "berkembang",
  "memperjuangkan",
  "menyelenggarakan",
  "mewujudkan",
  "melaksanakan",
  "membutuhkan",
  "mengembangkan",
  "menghasilkan",
  "berdasarkan",
  "dipergunakan",
  "keselamatan",
  "ketertiban",
  "keterbukaan",
  "akuntabilitas",
  "transparansi",
  "konsistensi",
  "integritas",
  "profesionalisme"
];

const WORD_COUNT = 10000;

function generateText(wordCount) {
  const result = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(WORDS[i % WORDS.length]);
  }
  return result.join(" ");
}

describe("Stress: long Indonesian text", () => {
  let hyphenateSync;
  let hyphenateAsync;

  beforeAll(() => {
    hyphenateSync = createHyphenator(patterns, {
      hyphenChar: "-",
      async: false
    });
    hyphenateAsync = createHyphenator(patterns, {
      hyphenChar: "-",
      async: true
    });
  });

  test("10000 words should complete in time and stay well-formed", () => {
    const text = generateText(WORD_COUNT);
    const start = Date.now();
    const result = hyphenateSync(text);
    const elapsed = Date.now() - start;

    console.log(`  Sync (${WORD_COUNT} words): ${elapsed}ms`);
    expect(result.split(" ")).toHaveLength(WORD_COUNT);
    expect(result).toContain("-");
    expect(result).not.toMatch(/-{2}/);
    expect(elapsed).toBeLessThan(5000);
  });

  test("Async mode should produce the same result as sync", () => {
    const text = generateText(WORD_COUNT);

    return hyphenateAsync(text).then(result => {
      expect(result).toBe(hyphenateSync(text));
    });
  });
});
