/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {State} state
 * @returns {Exclude<Options['quote'], null | undefined>}
 */
export function checkQuote(state: State): Exclude<Options['quote'], null | undefined>;
export type Options = import('../types.js').Options;
export type State = import('../types.js').State;
