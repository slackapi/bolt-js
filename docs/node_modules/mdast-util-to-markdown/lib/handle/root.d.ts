/**
 * @param {Root} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function root(node: Root, _: Parents | undefined, state: State, info: Info): string;
export type Parents = import('mdast').Parents;
export type Root = import('mdast').Root;
export type Info = import('../types.js').Info;
export type State = import('../types.js').State;
