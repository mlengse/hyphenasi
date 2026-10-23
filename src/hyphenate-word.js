import { levelsToMarkers } from "./markers.js";

export function hyphenateWord(text, loweredText, levelsTable, patternTrie) {
  var levels = new Uint8Array(text.length + 1),
    loweredChars = "." + loweredText + ".",
    len = loweredChars.length,
    maxStart = len - 3,
    triePtr,
    trieNode,
    patternLevelsIndex,
    patternLevels,
    patternEntityIndex,
    letter;

  for (var start = 0; start <= maxStart; start++) {
    patternEntityIndex = start === 0 ? 0 : start - 1;
    triePtr = patternTrie;

    for (var j = start; j < len; j++) {
      letter = loweredChars[j];

      if ((trieNode = triePtr[letter]) === undefined) {
        break;
      }

      triePtr = {};
      patternLevelsIndex = -1;

      if (Array.isArray(trieNode)) {
        triePtr = trieNode[0];
        patternLevelsIndex = trieNode[1];
      } else if (typeof trieNode === "number") {
        patternLevelsIndex = trieNode;
      } else {
        triePtr = trieNode;
      }

      if (patternLevelsIndex < 0) {
        continue;
      }

      patternLevels = levelsTable[patternLevelsIndex];

      for (var k = 0; k < patternLevels.length; k++) {
        var idx = patternEntityIndex + k;
        if (patternLevels[k] > levels[idx]) {
          levels[idx] = patternLevels[k];
        }
      }
    }
  }

  levels[0] = levels[1] = levels[levels.length - 1] = levels[
    levels.length - 2
  ] = 0;

  DEV: {
    console.log(
      loweredChars,
      levels.join(""),
      levelsToMarkers(levels).join()
    );
  }

  return levelsToMarkers(levels);
}
