/**
 * Turn a hast comment into an estree node.
 *
 * @param {HastComment} node
 *   hast node to transform.
 * @param {State} state
 *   Info passed around about the current state.
 * @returns {JsxExpressionContainer}
 *   estree expression.
 */
export function comment(node: HastComment, state: State): JsxExpressionContainer;
export type Comment = import('estree').Comment;
export type JsxEmptyExpression = import('estree-jsx').JSXEmptyExpression;
export type JsxExpressionContainer = import('estree-jsx').JSXExpressionContainer;
export type HastComment = import('hast').Comment;
export type State = import('../state.js').State;
