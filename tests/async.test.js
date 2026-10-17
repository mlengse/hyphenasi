const createHyphenator = require("../hyphen.js");
const patterns = require("../patterns/en-us.js");

let hyphenate;

beforeAll(() => {
  hyphenate = createHyphenator(patterns, { async: true });
});

test("Hyphenate should let setTimeout callback execute before produce the result", () => {
  expect.assertions(1);

  let isNextTick = false;
  setTimeout(() => {
    isNextTick = true;
  });

  return hyphenate("beautiful").then(function () {
    expect(isNextTick).toBe(true);
  });
});

test("Should throw an error if Promise is missing in global object in async mode", () => {
  const originalPromise = global.Promise;
  delete global.Promise;

  try {
    expect(() => {
      createHyphenator(patterns, { async: true });
    }).toThrow(
      "Failed to create hyphenator: Could not find global Promise object, needed for hyphenator to work in async mode"
    );
  } finally {
    global.Promise = originalPromise;
  }
});
