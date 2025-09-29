/**
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 *
 * @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
 *
 * @typedef {import('../index.js').MdxFlowExpression} MdxFlowExpression
 * @typedef {import('../index.js').MdxTextExpression} MdxTextExpression
 */

import {ok as assert} from 'devlop'

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
export function mdxExpressionFromMarkdown() {
  return {
    enter: {
      mdxFlowExpression: enterMdxFlowExpression,
      mdxTextExpression: enterMdxTextExpression
    },
    exit: {
      mdxFlowExpression: exitMdxExpression,
      mdxFlowExpressionChunk: exitMdxExpressionData,
      mdxTextExpression: exitMdxExpression,
      mdxTextExpressionChunk: exitMdxExpressionData
    }
  }
}

/**
 * Create an extension for `mdast-util-to-markdown` to enable MDX expressions
 * in markdown.
 *
 * @returns {ToMarkdownExtension}
 *   Extension for `mdast-util-to-markdown` to enable MDX expressions.
 */
export function mdxExpressionToMarkdown() {
  return {
    handlers: {
      mdxFlowExpression: handleMdxExpression,
      mdxTextExpression: handleMdxExpression
    },
    unsafe: [
      {character: '{', inConstruct: ['phrasing']},
      {atBreak: true, character: '{'}
    ]
  }
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterMdxFlowExpression(token) {
  this.enter({type: 'mdxFlowExpression', value: ''}, token)
  this.buffer()
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterMdxTextExpression(token) {
  this.enter({type: 'mdxTextExpression', value: ''}, token)
  this.buffer()
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitMdxExpression(token) {
  const value = this.resume()
  const estree = token.estree
  const node = this.stack[this.stack.length - 1]
  assert(node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression')
  this.exit(token)
  node.value = value

  if (estree) {
    node.data = {estree}
  }
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitMdxExpressionData(token) {
  this.config.enter.data.call(this, token)
  this.config.exit.data.call(this, token)
}

/**
 * @type {ToMarkdownHandle}
 * @param {MdxFlowExpression | MdxTextExpression} node
 */
function handleMdxExpression(node) {
  const value = node.value || ''
  return '{' + value + '}'
}
