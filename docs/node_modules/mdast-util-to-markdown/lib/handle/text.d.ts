/**
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('mdast').Text} Text
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {Text} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function text(node: Text, _: Parents | undefined, state: State, info: Info): string;
export type Parents = import('mdast').Parents;
export type Text = import('mdast').Text;
export type Info = import('../types.js').Info;
export type State = import('../types.js').State;
