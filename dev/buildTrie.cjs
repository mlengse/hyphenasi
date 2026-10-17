const { readFileSync } = require("fs");
const { createPatternTrie } = require("../scripts/createPatternTrie.cjs");
const { parseTex } = require("../scripts/parseTex.cjs");

const PATTERNS_PATH = "./tex/hyph-en-us.tex";

var [patterns] = parseTex(readFileSync(PATTERNS_PATH, "utf8"));

patterns = createPatternTrie(patterns);
console.log(patterns);
