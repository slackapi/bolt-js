/**
 * Turn a hast root node into an estree node.
 *
 * @param {HastRoot} node
 *   hast node to transform.
 * @param {State} state
 *   Info passed around about the current state.
 * @returns {JsxFragment}
 *   estree JSX fragment.
 */
export function root(node: HastRoot, state: State): JsxFragment;
export type JsxFragment = import('estree-jsx').JSXFragment;
export type HastRoot = import('hast').Root;
export type State = import('../state.js').State;
export type JsxChild = JsxFragment['children'][number];
