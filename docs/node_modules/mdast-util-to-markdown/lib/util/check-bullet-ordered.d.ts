/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {State} state
 * @returns {Exclude<Options['bulletOrdered'], null | undefined>}
 */
export function checkBulletOrdered(state: State): Exclude<Options['bulletOrdered'], null | undefined>;
export type Options = import('../types.js').Options;
export type State = import('../types.js').State;
