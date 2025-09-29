/**
 * @param {InlineCode} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @returns {string}
 */
export function inlineCode(node: InlineCode, _: Parents | undefined, state: State): string;
export namespace inlineCode {
    export { inlineCodePeek as peek };
}
export type InlineCode = import('mdast').InlineCode;
export type Parents = import('mdast').Parents;
export type State = import('../types.js').State;
/**
 * @returns {string}
 */
declare function inlineCodePeek(): string;
export {};
