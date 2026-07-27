/**
 * Text hyphenation in Javascript.
 *
 * Implements Franklin M. Liang's hyphenation algorithm (the standard TeX
 * hyphenation algorithm) for 75+ languages.
 *
 * @example
 * ```js
 * import createHyphenator from "hyphen";
 * import patterns from "hyphen/patterns/en-us.js";
 *
 * const hyphenate = createHyphenator(patterns, { hyphenChar: "-" });
 * hyphenate("beautiful"); // "beau-ti-ful"
 * ```
 */

type PatternsDefinition = [
  levelsTable: number[][],
  patternTrie: Record<string, unknown>,
  exceptions?: Record<string, number[]>
];

interface HyphenatorOptions {
  /** Enable async mode (default: false) */
  async?: boolean;
  /** Custom exception words in format "word" or "hy-phen-a-ted" */
  exceptions?: string[];
  /** Skip HTML tags during hyphenation (default: true) */
  html?: boolean;
  /** Character to insert at hyphenation points (default: "\\u00AD" soft hyphen) */
  hyphenChar?: string;
  /** Minimum word length to hyphenate (default: 5) */
  minWordLength?: number;
}

type Hyphenator = {
  /**
   * Hyphenate text.
   * @param text - Text to hyphenate
   * @param options - Override options for this call
   * @returns Hyphenated text (string in sync mode, Promise<string> in async mode)
   */
  (text: string, options?: HyphenatorOptions): string | Promise<string>;
};

/**
 * Create a hyphenator function for a specific language.
 *
 * @param patterns - Language patterns definition (imported from hyphen/patterns/*)
 * @param options - Configuration options
 * @returns Hyphenator function
 */
declare function createHyphenator(
  patterns: PatternsDefinition,
  options?: HyphenatorOptions
): Hyphenator;

export default createHyphenator;
export { createHyphenator, Hyphenator, HyphenatorOptions, PatternsDefinition };
