/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {State} state
 * @returns {Exclude<Options['listItemIndent'], null | undefined>}
 */
export function checkListItemIndent(state: State): Exclude<Options['listItemIndent'], null | undefined>;
export type Options = import('../types.js').Options;
export type State = import('../types.js').State;
