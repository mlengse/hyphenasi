export function levelsToMarkers(levels) {
  var markers = [];

  for (var i = 0; i < levels.length; i++)
    if ((levels[i] & 1) === 1) markers.push(i);

  return markers;
}

export function insertChar(text, hyphenChar, markers) {
  var len = markers.length;
  if (len === 0) {
    return text;
  }

  var resultText = text.slice(0, markers[0]);

  for (var i = 0; i < len - 1; i++) {
    resultText += hyphenChar + text.slice(markers[i], markers[i + 1]);
  }

  return resultText + hyphenChar + text.slice(markers[len - 1]);
}

export function markersFromExceptionsDefinition(exceptionsList) {
  return exceptionsList.reduce(function (markersDict, definition) {
    var i = 0,
      markers = [];

    while ((i = definition.indexOf("-", i + 1)) > -1) {
      markers.push(i - markers.length);
    }

    markersDict[definition.toLocaleLowerCase().replace(/\-/g, "")] = markers;

    return markersDict;
  }, {});
}
