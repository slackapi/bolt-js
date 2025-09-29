/**
 * @typedef {import('mdast').Paragraph} Paragraph
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */
/**
 * @param {Paragraph} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function paragraph(node: Paragraph, _: Parents | undefined, state: State, info: Info): string;
export type Paragraph = import('mdast').Paragraph;
export type Parents = import('mdast').Parents;
export type Info = import('../types.js').Info;
export type State = import('../types.js').State;
