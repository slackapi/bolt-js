/**
 * @param {LinkReference} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function linkReference(node: LinkReference, _: Parents | undefined, state: State, info: Info): string;
export namespace linkReference {
    export { linkReferencePeek as peek };
}
export type LinkReference = import('mdast').LinkReference;
export type Parents = import('mdast').Parents;
export type Info = import('../types.js').Info;
export type State = import('../types.js').State;
/**
 * @returns {string}
 */
declare function linkReferencePeek(): string;
export {};
