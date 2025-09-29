/**
 * @param {ReadonlyArray<Readonly<ExportSpecifier> | Readonly<ImportDefaultSpecifier> | Readonly<ImportNamespaceSpecifier> | Readonly<ImportSpecifier>>} specifiers
 *   Specifiers.
 * @param {Readonly<Expression>} init
 *   Initializer.
 * @returns {Array<VariableDeclarator>}
 *   Declarations.
 */
export function specifiersToDeclarations(specifiers: ReadonlyArray<Readonly<ExportSpecifier> | Readonly<ImportDefaultSpecifier> | Readonly<ImportNamespaceSpecifier> | Readonly<ImportSpecifier>>, init: Readonly<Expression>): Array<VariableDeclarator>;
export type AssignmentProperty = import('estree-jsx').AssignmentProperty;
export type ExportSpecifier = import('estree-jsx').ExportSpecifier;
export type Expression = import('estree-jsx').Expression;
export type Identifier = import('estree-jsx').Identifier;
export type ImportDefaultSpecifier = import('estree-jsx').ImportDefaultSpecifier;
export type ImportNamespaceSpecifier = import('estree-jsx').ImportNamespaceSpecifier;
export type ImportSpecifier = import('estree-jsx').ImportSpecifier;
export type VariableDeclarator = import('estree-jsx').VariableDeclarator;
//# sourceMappingURL=estree-util-specifiers-to-declarations.d.ts.map