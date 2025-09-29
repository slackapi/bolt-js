/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {State} state
 * @returns {Exclude<Options['rule'], null | undefined>}
 */
export function checkRule(state: State): Exclude<Options['rule'], null | undefined>;
export type Options = import('../types.js').Options;
export type State = import('../types.js').State;
