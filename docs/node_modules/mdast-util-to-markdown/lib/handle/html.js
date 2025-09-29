/**
 * @typedef {import('mdast').Html} Html
 */

html.peek = htmlPeek

/**
 * @param {Html} node
 * @returns {string}
 */
export function html(node) {
  return node.value || ''
}

/**
 * @returns {string}
 */
function htmlPeek() {
  return '<'
}
