/**
 * Parse JSX (text).
 *
 * @param {Acorn | undefined} acorn
 *   Acorn parser to use (optional).
 * @param {Options} options
 *   Configuration.
 * @returns {Construct}
 *   Construct.
 */
export function jsxText(acorn: Acorn | undefined, options: Options): Construct;
export type Acorn = import('micromark-factory-mdx-expression').Acorn;
export type AcornOptions = import('micromark-factory-mdx-expression').AcornOptions;
export type Construct = import('micromark-util-types').Construct;
export type TokenizeContext = import('micromark-util-types').TokenizeContext;
export type Tokenizer = import('micromark-util-types').Tokenizer;
/**
 * Configuration.
 */
export type Options = {
    /**
     *   Acorn options.
     */
    acornOptions: AcornOptions | undefined;
    /**
     *   Whether to add `estree` fields to tokens with results from acorn.
     */
    addResult: boolean | undefined;
};
