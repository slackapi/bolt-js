/**
 * Add support for MDX (JSX: `<Video id={123} />`, export/imports: `export {x}
 * from 'y'`; and expressions: `{1 + 1}`).
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function remarkMdx(options?: Readonly<Options> | null | undefined): undefined;
export type ToMarkdownOptions = import('mdast-util-mdx').ToMarkdownOptions;
export type MicromarkOptions = import('micromark-extension-mdxjs').Options;
export type Processor = import('unified').Processor;
/**
 * Configuration.
 */
export type Options = MicromarkOptions & ToMarkdownOptions;
//# sourceMappingURL=index.d.ts.map