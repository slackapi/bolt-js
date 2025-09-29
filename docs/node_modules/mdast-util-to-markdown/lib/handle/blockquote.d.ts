/**
 * @typedef {import('mdast').Blockquote} Blockquote
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').Map} Map
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {Blockquote} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function blockquote(node: Blockquote, _: Parents | undefined, state: State, info: Info): string;
export type Blockquote = import('mdast').Blockquote;
export type Parents = import('mdast').Parents;
export type Info = import('../types.js').Info;
export type Map = import('../types.js').Map;
export type State = import('../types.js').State;
