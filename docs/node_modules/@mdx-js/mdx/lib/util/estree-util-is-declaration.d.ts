/**
 * Check if `node` is a declaration.
 *
 * @param {Readonly<MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration | Node>} node
 *   Node to check.
 * @returns {node is Declaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration}
 *   Whether `node` is a declaration.
 */
export function isDeclaration(node: Readonly<MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration | Node>): node is import("estree").MaybeNamedClassDeclaration | import("estree").MaybeNamedFunctionDeclaration | import("estree").Declaration;
export type Declaration = import('estree-jsx').Declaration;
export type MaybeNamedClassDeclaration = import('estree-jsx').MaybeNamedClassDeclaration;
export type MaybeNamedFunctionDeclaration = import('estree-jsx').MaybeNamedFunctionDeclaration;
export type Node = import('estree-jsx').Node;
//# sourceMappingURL=estree-util-is-declaration.d.ts.map