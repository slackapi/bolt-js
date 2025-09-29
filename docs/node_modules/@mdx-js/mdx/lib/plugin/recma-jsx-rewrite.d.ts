/**
 * A plugin that rewrites JSX in functions to accept components as
 * `props.components` (when the function is called `_createMdxContent`), or from
 * a provider (if there is one).
 * It also makes sure that any undefined components are defined: either from
 * received components or as a function that throws an error.
 *
 * @param {Readonly<ProcessorOptions>} options
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export function recmaJsxRewrite(options: Readonly<ProcessorOptions>): (tree: Program, file: VFile) => undefined;
export type Expression = import('estree-jsx').Expression;
export type EstreeFunction = import('estree-jsx').Function;
export type Identifier = import('estree-jsx').Identifier;
export type ImportSpecifier = import('estree-jsx').ImportSpecifier;
export type JSXElement = import('estree-jsx').JSXElement;
export type ModuleDeclaration = import('estree-jsx').ModuleDeclaration;
export type Node = import('estree-jsx').Node;
export type ObjectPattern = import('estree-jsx').ObjectPattern;
export type Program = import('estree-jsx').Program;
export type Property = import('estree-jsx').Property;
export type SpreadElement = import('estree-jsx').SpreadElement;
export type Statement = import('estree-jsx').Statement;
export type VariableDeclarator = import('estree-jsx').VariableDeclarator;
export type PeriscopicScope = import('periscopic').Scope;
export type VFile = import('vfile').VFile;
export type ProcessorOptions = import('../core.js').ProcessorOptions;
/**
 * Scope (with a `node`).
 */
export type Scope = PeriscopicScope & {
    node: Node;
};
/**
 * Entry.
 */
export type StackEntry = {
    /**
     *   Used components.
     */
    components: Array<string>;
    /**
     *   Map of JSX identifiers which cannot be used as JS identifiers, to valid JS identifiers.
     */
    idToInvalidComponentName: Map<string, string>;
    /**
     *   Function.
     */
    node: Readonly<EstreeFunction>;
    /**
     *   Identifiers of used objects (such as `x` in `x.y`).
     */
    objects: Array<string>;
    /**
     *   Map of JSX identifiers for components and objects, to where they were first used.
     */
    references: Record<string, {
        node: Readonly<JSXElement>;
        component: boolean;
    }>;
    /**
     *   Tag names.
     */
    tags: Array<string>;
};
//# sourceMappingURL=recma-jsx-rewrite.d.ts.map