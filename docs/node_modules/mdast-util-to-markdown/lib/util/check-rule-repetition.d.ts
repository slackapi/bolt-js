/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {State} state
 * @returns {Exclude<Options['ruleRepetition'], null | undefined>}
 */
export function checkRuleRepetition(state: State): Exclude<Options['ruleRepetition'], null | undefined>;
export type Options = import('../types.js').Options;
export type State = import('../types.js').State;
