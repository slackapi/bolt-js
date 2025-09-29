/**
 * @param {Html} node
 * @returns {string}
 */
export function html(node: Html): string;
export namespace html {
    export { htmlPeek as peek };
}
export type Html = import('mdast').Html;
/**
 * @returns {string}
 */
declare function htmlPeek(): string;
export {};
