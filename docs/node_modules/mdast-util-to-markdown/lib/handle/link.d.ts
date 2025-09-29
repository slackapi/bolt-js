/**
 * @param {Link} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function link(node: Link, _: Parents | undefined, state: State, info: Info): string;
export namespace link {
    export { linkPeek as peek };
}
export type Link = import('mdast').Link;
export type Parents = import('mdast').Parents;
export type Exit = import('../types.js').Exit;
export type Info = import('../types.js').Info;
export type State = import('../types.js').State;
/**
 * @param {Link} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @returns {string}
 */
declare function linkPeek(node: Link, _: Parents | undefined, state: State): string;
export {};
