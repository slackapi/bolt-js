/**
 * @typedef {import('mdast').Blockquote} Blockquote
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').Map} Map
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {Blockquote} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function blockquote(node, _, state, info) {
  const exit = state.enter('blockquote')
  const tracker = state.createTracker(info)
  tracker.move('> ')
  tracker.shift(2)
  const value = state.indentLines(
    state.containerFlow(node, tracker.current()),
    map
  )
  exit()
  return value
}

/** @type {Map} */
function map(line, _, blank) {
  return '>' + (blank ? '' : ' ') + line
}
