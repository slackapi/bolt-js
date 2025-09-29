/**
 * Create an extension for `micromark` to enable MDX JSX syntax.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions` to enable MDX
 *   JSX syntax.
 */
export function mdxJsx(options?: Options | null | undefined): Extension;
export type Extension = import('micromark-util-types').Extension;
export type Acorn = import('micromark-factory-mdx-expression').Acorn;
export type AcornOptions = import('micromark-factory-mdx-expression').AcornOptions;
/**
 * Configuration (optional).
 */
export type Options = {
    /**
     * Acorn parser to use (optional).
     */
    acorn?: Acorn | null | undefined;
    /**
     * Configuration for acorn (default: `{ecmaVersion: 2024, locations: true,
     * sourceType: 'module'}`); all fields except `locations` can be set.
     */
    acornOptions?: AcornOptions | null | undefined;
    /**
     * Whether to add `estree` fields to tokens with results from acorn
     * (default: `false`).
     */
    addResult?: boolean | null | undefined;
};
