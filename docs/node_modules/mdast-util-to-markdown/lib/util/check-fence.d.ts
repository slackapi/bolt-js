/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {State} state
 * @returns {Exclude<Options['fence'], null | undefined>}
 */
export function checkFence(state: State): Exclude<Options['fence'], null | undefined>;
export type Options = import('../types.js').Options;
export type State = import('../types.js').State;
