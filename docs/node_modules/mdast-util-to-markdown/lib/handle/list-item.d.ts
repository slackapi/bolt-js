/**
 * @param {ListItem} node
 * @param {Parents | undefined} parent
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function listItem(node: ListItem, parent: Parents | undefined, state: State, info: Info): string;
export type ListItem = import('mdast').ListItem;
export type Parents = import('mdast').Parents;
export type Info = import('../types.js').Info;
export type Map = import('../types.js').Map;
export type State = import('../types.js').State;
