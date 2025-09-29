/**
 * @param {Code} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function code(node: Code, _: Parents | undefined, state: State, info: Info): string;
export type Code = import('mdast').Code;
export type Parents = import('mdast').Parents;
export type Info = import('../types.js').Info;
export type Map = import('../types.js').Map;
export type State = import('../types.js').State;
