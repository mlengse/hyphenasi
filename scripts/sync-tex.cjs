const { readFileSync, writeFileSync, existsSync, readdirSync } = require("fs");
const { join, resolve } = require("path");
const { TEX_EXCLUDES } = require("./tex-excludes.cjs");

const DIR_TEX = "tex";
const BODY_MARKER = "\\patterns";

const pathTo = (pathRoot => (...args) => join(pathRoot, ...args))(
  resolve(__dirname, "..")
);

const normalizeEol = content => content.replace(/\r\n/g, "\n");

const splitHeaderBody = content => {
  const lines = normalizeEol(content).split("\n");
  const index = lines.findIndex(line => line.startsWith(BODY_MARKER));

  if (index === -1) {
    return { header: lines.join("\n"), body: null, hasMarker: false };
  }

  return {
    header: lines.slice(0, index).join("\n"),
    body: lines.slice(index).join("\n"),
    hasMarker: true
  };
};

const getSourceDir = arg => {
  const fromArg = arg && arg !== "--source" ? arg : undefined;
  return (
    fromArg ||
    process.env.HYPHEN_TEX_SOURCE ||
    "../pattern/tex-hyphen/hyph-utf8/tex/generic/hyph-utf8/patterns/tex"
  );
};

const sourceArg = process.argv[2];
const sourceDir = resolve(__dirname, "..", getSourceDir(sourceArg));

if (!existsSync(sourceDir)) {
  console.error(
    `Source directory not found: ${sourceDir}\n` +
      `Pass it as the first argument or set HYPHEN_TEX_SOURCE env var.`
  );
  process.exit(1);
}

const sourceFiles = readdirSync(sourceDir)
  .filter(filename => filename.endsWith(".tex"))
  .sort();

let added = [];
let updated = [];
let unchanged = [];
let skipped = [];
let excluded = [];

for (const filename of sourceFiles) {
  if (TEX_EXCLUDES.includes(filename)) {
    excluded.push(filename);
    continue;
  }

  const sourceContent = readFileSync(join(sourceDir, filename), "utf8");
  const sourceParsed = splitHeaderBody(sourceContent);
  const destPath = pathTo(DIR_TEX, filename);
  const destExists = existsSync(destPath);

  if (!sourceParsed.hasMarker) {
    skipped.push([filename, "no \\patterns marker"]);
    continue;
  }

  const header = destExists
    ? splitHeaderBody(readFileSync(destPath, "utf8")).header
    : sourceParsed.header;
  const nextContent = `${header}\n${sourceParsed.body}`;

  if (destExists) {
    if (readFileSync(destPath, "utf8") === nextContent) {
      unchanged.push(filename);
      continue;
    }
    updated.push(filename);
  } else {
    added.push(filename);
  }

  writeFileSync(destPath, nextContent, "utf8");
}

console.log(`Syncing tex patterns from ${sourceDir}`);
console.log(`  added: ${added.length}`);
added.forEach(filename => console.log(`    + ${filename}`));
console.log(`  updated: ${updated.length}`);
updated.forEach(filename => console.log(`    ~ ${filename}`));
console.log(`  unchanged: ${unchanged.length}`);
console.log(`  excluded: ${excluded.length}`);
excluded.forEach(filename => console.log(`    - ${filename}`));
console.log(`  skipped: ${skipped.length}`);
skipped.forEach(([filename, reason]) => console.log(`    - ${filename} (${reason})`));
console.log(`Done`);
