/**
 * Create an extension for `mdast-util-from-markdown` to enable MDX expressions
 * in markdown.
 *
 * When using the micromark syntax extension with `addResult`, nodes will have
 * a `data.estree` field set to an ESTree `Program` node.
 *
 * @returns {FromMarkdownExtension}
 *   Extension for `mdast-util-from-markdown` to enable MDX expressions.
 */
export function mdxExpressionFromMarkdown(): FromMarkdownExtension
/**
 * Create an extension for `mdast-util-to-markdown` to enable MDX expressions
 * in markdown.
 *
 * @returns {ToMarkdownExtension}
 *   Extension for `mdast-util-to-markdown` to enable MDX expressions.
 */
export function mdxExpressionToMarkdown(): ToMarkdownExtension
export type CompileContext = import('mdast-util-from-markdown').CompileContext
export type FromMarkdownExtension = import('mdast-util-from-markdown').Extension
export type FromMarkdownHandle = import('mdast-util-from-markdown').Handle
export type ToMarkdownHandle = import('mdast-util-to-markdown').Handle
export type ToMarkdownExtension = import('mdast-util-to-markdown').Options
export type MdxFlowExpression = import('../index.js').MdxFlowExpression
export type MdxTextExpression = import('../index.js').MdxTextExpression
