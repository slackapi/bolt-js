/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {State} state
 * @returns {Exclude<Options['bullet'], null | undefined>}
 */
export function checkBullet(state: State): Exclude<Options['bullet'], null | undefined>;
export type Options = import('../types.js').Options;
export type State = import('../types.js').State;
