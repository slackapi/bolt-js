/**
 * Turn a hast element into an estree node.
 *
 * @param {HastElement} node
 *   hast node to transform.
 * @param {State} state
 *   Info passed around about the current state.
 * @returns {JsxElement}
 *   estree expression.
 */
export function element(node: HastElement, state: State): JsxElement;
export type Property = import('estree').Property;
export type JsxAttribute = import('estree-jsx').JSXAttribute;
export type JsxElement = import('estree-jsx').JSXElement;
export type JsxSpreadAttribute = import('estree-jsx').JSXSpreadAttribute;
export type HastElement = import('hast').Element;
export type State = import('../state.js').State;
export type Style = Record<string, string>;
