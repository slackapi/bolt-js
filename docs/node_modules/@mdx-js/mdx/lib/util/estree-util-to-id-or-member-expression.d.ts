/**
 * @param {ReadonlyArray<number | string>} ids
 *   Identifiers (example: `['list', 0]).
 * @returns {Identifier | MemberExpression}
 *   Identifier or member expression.
 */
export function toIdOrMemberExpression(ids: ReadonlyArray<number | string>): Identifier | MemberExpression;
/**
 * @param {ReadonlyArray<number | string>} ids
 *   Identifiers (example: `['list', 0]).
 * @returns {JSXIdentifier | JSXMemberExpression}
 *   Identifier or member expression.
 */
export function toJsxIdOrMemberExpression(ids: ReadonlyArray<number | string>): JSXIdentifier | JSXMemberExpression;
export type Identifier = import('estree-jsx').Identifier;
export type JSXIdentifier = import('estree-jsx').JSXIdentifier;
export type JSXMemberExpression = import('estree-jsx').JSXMemberExpression;
export type Literal = import('estree-jsx').Literal;
export type MemberExpression = import('estree-jsx').MemberExpression;
//# sourceMappingURL=estree-util-to-id-or-member-expression.d.ts.map