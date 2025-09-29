/**
 * @typedef {import('mdast').Break} Break
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */

import {patternInScope} from '../util/pattern-in-scope.js'

/**
 * @param {Break} _
 * @param {Parents | undefined} _1
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function hardBreak(_, _1, state, info) {
  let index = -1

  while (++index < state.unsafe.length) {
    // If we can’t put eols in this construct (setext headings, tables), use a
    // space instead.
    if (
      state.unsafe[index].character === '\n' &&
      patternInScope(state.stack, state.unsafe[index])
    ) {
      return /[ \t]/.test(info.before) ? '' : ' '
    }
  }

  return '\\\n'
}
