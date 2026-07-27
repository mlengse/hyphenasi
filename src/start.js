import { createTextReader } from "./textReader.js";
import {
  createHTMLVerifier,
  createHyphenCharVerifier,
  createHyphenationVerifier
} from "./hyphenationVerifier.js";
import { hyphenateWord } from "./hyphenate-word.js";
import { insertChar } from "./markers.js";

export function start(
  text,
  levelsTable,
  patterns,
  cache,
  markersDict,
  hyphenChar,
  skipHTML,
  minWordLength,
  isAsync
) {
  function done() {
    DEV: allTime = Date.now() - allTime;
    resolveNewText(textParts.join(""));

    DEV: {
      console.log(
        "----------------\nHyphenation stats: " +
          processedN +
          " text chunks processed, " +
          hyphenatedN +
          " words hyphenated"
      );
      console.log("Work time: " + workTime / 1000);
      console.log("Wait time: " + (allTime - workTime) / 1000);
      console.log("All time: " + allTime / 1000);
    }
  }

  var textParts = [],
    fragments,
    readText = createTextReader(
      createHyphenationVerifier(
        (skipHTML ? [createHTMLVerifier()] : []).concat(
          createHyphenCharVerifier(hyphenChar)
        ),
        minWordLength
      )
    ),
    resolveNewText = function () {};

  DEV: {
    var processedN = 0,
      hyphenatedN = 0,
      allTime = Date.now(),
      workTime = 0;
  }

  function nextTick() {
    var loopStart = Date.now();

    while (
      (!isAsync || Date.now() - loopStart < 10) &&
      (fragments = readText(text))
    ) {
      if (fragments[1]) {
        var cacheKey = fragments[1].length ? "~" + fragments[1] : "";

        if (!Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
          var loweredWord = fragments[1].toLocaleLowerCase();

          if (!Object.prototype.hasOwnProperty.call(markersDict, loweredWord))
            markersDict[loweredWord] = hyphenateWord(
              fragments[1],
              loweredWord,
              levelsTable,
              patterns
            );

          cache[cacheKey] = insertChar(
            fragments[1],
            hyphenChar,
            markersDict[loweredWord]
          );
        }

        DEV: if (fragments[1] !== cache[cacheKey]) {
          hyphenatedN++;
        }

        fragments[1] = cache[cacheKey];
      }

      textParts.push(fragments[0], fragments[1]);
      DEV: processedN++;
    }

    DEV: workTime += Date.now() - loopStart;

    if (!fragments) {
      done();
    } else {
      setTimeout(nextTick);
    }
  }

  if (isAsync) {
    setTimeout(nextTick);
    return new Promise(function (resolve) {
      resolveNewText = resolve;
    });
  } else {
    nextTick();
    return textParts.join("");
  }
}
