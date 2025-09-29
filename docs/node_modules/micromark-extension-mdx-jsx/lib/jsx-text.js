/**
 * @typedef {import('micromark-factory-mdx-expression').Acorn} Acorn
 * @typedef {import('micromark-factory-mdx-expression').AcornOptions} AcornOptions
 * @typedef {import('micromark-util-types').Construct} Construct
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 */

/**
 * @typedef Options
 *   Configuration.
 * @property {AcornOptions | undefined} acornOptions
 *   Acorn options.
 * @property {boolean | undefined} addResult
 *   Whether to add `estree` fields to tokens with results from acorn.
 */

import { factoryTag } from './factory-tag.js';

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
export function jsxText(acorn, options) {
  return {
    name: 'mdxJsxTextTag',
    tokenize: tokenizeJsxText
  };

  /**
   * MDX JSX (text).
   *
   * ```markdown
   * > | a <b />.
   *       ^^^^^
   * ```
   *
   * @this {TokenizeContext}
   * @type {Tokenizer}
   */
  function tokenizeJsxText(effects, ok, nok) {
    return factoryTag.call(this, effects, ok, nok, acorn, options.acornOptions, options.addResult, true, 'mdxJsxTextTag', 'mdxJsxTextTagMarker', 'mdxJsxTextTagClosingMarker', 'mdxJsxTextTagSelfClosingMarker', 'mdxJsxTextTagName', 'mdxJsxTextTagNamePrimary', 'mdxJsxTextTagNameMemberMarker', 'mdxJsxTextTagNameMember', 'mdxJsxTextTagNamePrefixMarker', 'mdxJsxTextTagNameLocal', 'mdxJsxTextTagExpressionAttribute', 'mdxJsxTextTagExpressionAttributeMarker', 'mdxJsxTextTagExpressionAttributeValue', 'mdxJsxTextTagAttribute', 'mdxJsxTextTagAttributeName', 'mdxJsxTextTagAttributeNamePrimary', 'mdxJsxTextTagAttributeNamePrefixMarker', 'mdxJsxTextTagAttributeNameLocal', 'mdxJsxTextTagAttributeInitializerMarker', 'mdxJsxTextTagAttributeValueLiteral', 'mdxJsxTextTagAttributeValueLiteralMarker', 'mdxJsxTextTagAttributeValueLiteralValue', 'mdxJsxTextTagAttributeValueExpression', 'mdxJsxTextTagAttributeValueExpressionMarker', 'mdxJsxTextTagAttributeValueExpressionValue');
  }
}