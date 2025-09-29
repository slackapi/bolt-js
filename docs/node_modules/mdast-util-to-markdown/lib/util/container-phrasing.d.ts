/**
 * @typedef {import('../types.js').Handle} Handle
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').PhrasingParents} PhrasingParents
 * @typedef {import('../types.js').State} State
 */
/**
 * Serialize the children of a parent that contains phrasing children.
 *
 * These children will be joined flush together.
 *
 * @param {PhrasingParents} parent
 *   Parent of flow nodes.
 * @param {State} state
 *   Info passed around about the current state.
 * @param {Info} info
 *   Info on where we are in the document we are generating.
 * @returns {string}
 *   Serialized children, joined together.
 */
export function containerPhrasing(parent: PhrasingParents, state: State, info: Info): string;
export type Handle = import('../types.js').Handle;
export type Info = import('../types.js').Info;
export type PhrasingParents = import('../types.js').PhrasingParents;
export type State = import('../types.js').State;
