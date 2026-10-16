describe("createTextReader", () => {
  let createTextReader;

  beforeAll(() => {
    const fs = require("fs");
    let code = fs.readFileSync("./src/textReader.js", "utf8");
    code = code.replace(/export function /g, "function ");
    code += "\nreturn { createTextReader };\n";
    const mod = new Function(code)();
    createTextReader = mod.createTextReader;
  });

  test("should call setup function when creating reader", () => {
    const setup = jest.fn(() => jest.fn());
    createTextReader(setup);
    expect(setup).toHaveBeenCalledTimes(1);
  });

  test("should iterate through characters and pass char1 and char2 to verifier", () => {
    const mockVerifier = jest.fn();
    const setup = () => mockVerifier;
    const reader = createTextReader(setup);

    reader("abc");

    expect(mockVerifier).toHaveBeenCalledTimes(3);
    expect(mockVerifier).toHaveBeenNthCalledWith(1, "a", "b");
    expect(mockVerifier).toHaveBeenNthCalledWith(2, "b", "c");
    expect(mockVerifier).toHaveBeenNthCalledWith(3, "c", "");
  });

  test("should return early when verifier returns a defined value", () => {
    const mockVerifier = jest.fn((char1, char2) => {
      if (char1 === "b") {
        return "MATCH_B";
      }
      return undefined;
    });
    const setup = () => mockVerifier;
    const reader = createTextReader(setup);

    const result = reader("abcd");

    expect(result).toBe("MATCH_B");
    expect(mockVerifier).toHaveBeenCalledTimes(2);
    expect(mockVerifier).toHaveBeenNthCalledWith(1, "a", "b");
    expect(mockVerifier).toHaveBeenNthCalledWith(2, "b", "c");
  });

  test("should return undefined when end of text is reached without match", () => {
    const mockVerifier = jest.fn(() => undefined);
    const setup = () => mockVerifier;
    const reader = createTextReader(setup);

    const result = reader("hello");

    expect(result).toBeUndefined();
    expect(mockVerifier).toHaveBeenCalledTimes(5);
  });

  test("should maintain state across multiple reader invocations", () => {
    let callCount = 0;
    const mockVerifier = jest.fn((char1, char2) => {
      callCount++;
      if (callCount === 2) {
        return "STOP_AT_2";
      }
      return undefined;
    });
    const setup = () => mockVerifier;
    const reader = createTextReader(setup);

    const firstCall = reader("abcdef");
    expect(firstCall).toBe("STOP_AT_2");
    expect(mockVerifier).toHaveBeenNthCalledWith(1, "a", "b");
    expect(mockVerifier).toHaveBeenNthCalledWith(2, "b", "c");

    // Second call to same reader closure resumes from index i = 2 ('c')
    const secondCall = reader("abcdef");
    expect(secondCall).toBeUndefined();
    expect(mockVerifier).toHaveBeenNthCalledWith(3, "c", "d");
    expect(mockVerifier).toHaveBeenNthCalledWith(4, "d", "e");
    expect(mockVerifier).toHaveBeenNthCalledWith(5, "e", "f");
    expect(mockVerifier).toHaveBeenNthCalledWith(6, "f", "");
  });

  test("should handle empty text gracefully", () => {
    const mockVerifier = jest.fn();
    const setup = () => mockVerifier;
    const reader = createTextReader(setup);

    const result = reader("");

    expect(result).toBeUndefined();
    expect(mockVerifier).not.toHaveBeenCalled();
  });
});
