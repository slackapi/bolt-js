/**
 * Turn a hast text node into an estree node.
 *
 * @param {HastText} node
 *   hast node to transform.
 * @param {State} state
 *   Info passed around about the current state.
 * @returns {JsxExpressionContainer | undefined}
 *   JSX expression.
 */
export function text(node: HastText, state: State): JsxExpressionContainer | undefined;
export type Literal = import('estree').Literal;
export type JsxExpressionContainer = import('estree-jsx').JSXExpressionContainer;
export type HastText = import('hast').Text;
export type State = import('../state.js').State;
