/**
 * @param {ImageReference} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function imageReference(node: ImageReference, _: Parents | undefined, state: State, info: Info): string;
export namespace imageReference {
    export { imageReferencePeek as peek };
}
export type ImageReference = import('mdast').ImageReference;
export type Parents = import('mdast').Parents;
export type Info = import('../types.js').Info;
export type State = import('../types.js').State;
/**
 * @returns {string}
 */
declare function imageReferencePeek(): string;
export {};
