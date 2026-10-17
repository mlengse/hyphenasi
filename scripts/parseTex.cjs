/**
 * Safely parses TeX hyphenation files to extract patterns, hyphenation exceptions, and input filenames.
 * Eliminates code execution / eval() vulnerabilities when processing TeX pattern source files.
 */
function parseTex(texCode) {
  let patterns = [];
  let hyphenation = [];
  let input = undefined;

  // Find \input <filename>
  const inputMatch = texCode.match(/\\input\s+([^\s%\}]+)/);
  if (inputMatch) {
    input = inputMatch[1];
  }

  // Extract tokens inside \commandName{ ... } blocks safely
  function extractBlocks(commandName) {
    let items = [];
    let regex = new RegExp("\\\\" + commandName + "\\s*\\{", "g");
    let match;

    while ((match = regex.exec(texCode)) !== null) {
      let startPos = match.index + match[0].length;
      let depth = 1;
      let pos = startPos;
      let blockContent = "";

      while (pos < texCode.length && depth > 0) {
        let ch = texCode[pos];
        if (ch === "%") {
          let eol = texCode.indexOf("\n", pos);
          if (eol === -1) break;
          pos = eol + 1;
          continue;
        }
        if (ch === "{") depth++;
        else if (ch === "}") depth--;

        if (depth > 0) {
          blockContent += ch;
        }
        pos++;
      }

      let tokens = blockContent.trim().split(/\s+/).filter(Boolean);
      items.push(...tokens);
    }

    return items;
  }

  patterns = extractBlocks("patterns");
  hyphenation = extractBlocks("hyphenation");

  return [patterns, hyphenation, input];
}

module.exports = { parseTex };
