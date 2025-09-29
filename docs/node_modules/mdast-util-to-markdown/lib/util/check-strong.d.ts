/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {State} state
 * @returns {Exclude<Options['strong'], null | undefined>}
 */
export function checkStrong(state: State): Exclude<Options['strong'], null | undefined>;
export type Options = import('../types.js').Options;
export type State = import('../types.js').State;
