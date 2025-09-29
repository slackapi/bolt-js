/**
 * @param {Image} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function image(node: Image, _: Parents | undefined, state: State, info: Info): string;
export namespace image {
    export { imagePeek as peek };
}
export type Image = import('mdast').Image;
export type Parents = import('mdast').Parents;
export type Info = import('../types.js').Info;
export type State = import('../types.js').State;
/**
 * @returns {string}
 */
declare function imagePeek(): string;
export {};
