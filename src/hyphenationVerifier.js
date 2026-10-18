// Matches non-letter characters:
// \s           - whitespace (spaces, tabs, newlines)
// [!-@[-`{-~] - ASCII punctuation: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
// \u2013-\u203C - Unicode: en dash (–) through double exclamation mark (‼)
// (?!')        - excludes single quote from punctuation match
var isNotLetter = RegExp.prototype.test.bind(
  /\s|(?![\'])[\!-\@\[-\`\{-\~\u2013-\u203C]/
);

export function createHTMLVerifier() {
  var skip = false;

  return function (accumulate, char1, char2) {
    if (skip) {
      if (char1 === ">") {
        accumulate();
        skip = false;
      }
    } else if (
      char1 === "<" &&
      (!isNotLetter(char2) || char2 === "/")
    ) {
      skip = true;
    }

    return skip;
  };
}

export function createHyphenCharVerifier(hyphenChar) {
  var skip = false;

  return function (accumulate, char1, char2) {
    if (skip) {
      if (!isNotLetter(char1) && isNotLetter(char2)) {
        accumulate();
        skip = false;
      }
    } else if (char2 === hyphenChar && !isNotLetter(char1)) {
      // Short-circuit: check cheap character equality before regex call
      skip = true;
    }

    return skip;
  };
}

export function createHyphenationVerifier(verifiers, minWordLength) {
  return function () {
    var accum0 = "";
    var accum = "";

    function accumulate() {
      accum0 += accum;
      accum = "";
    }

    function resolveWith(value) {
      accum0 = "";
      accum = "";

      return value;
    }

    return function (char1, char2) {
      accum += char1;

      var skip = false;
      for (var i = 0; i < verifiers.length; i++) {
        if (verifiers[i](accumulate, char1, char2)) {
          skip = true;
          break;
        }
      }

      if (!skip) {
        // Cache regex results to avoid redundant calls per character pair
        var isNotLetter1 = isNotLetter(char1);
        var isNotLetter2 = isNotLetter(char2);

        if (isNotLetter1 && !isNotLetter2) {
          accumulate();
        } else if (!isNotLetter1 && isNotLetter2) {
          if (accum.length >= minWordLength) {
            return resolveWith([accum0, accum]);
          } else {
            accumulate();
          }
        }
      }

      if (char2 === "") {
        if (accum.length < minWordLength || skip) {
          accumulate();
        }

        return resolveWith([accum0, accum]);
      }
    };
  };
}
