/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {State} state
 * @returns {Exclude<Options['emphasis'], null | undefined>}
 */
export function checkEmphasis(state: State): Exclude<Options['emphasis'], null | undefined>;
export type Options = import('../types.js').Options;
export type State = import('../types.js').State;
