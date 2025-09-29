/**
 * Transform a hast tree to preact, react, solid, svelte, vue, etc.,
 * with an automatic JSX runtime.
 *
 * @param {Nodes} tree
 *   Tree to transform.
 * @param {Options} options
 *   Configuration (required).
 * @returns {JSX.Element}
 *   JSX element.
 */
export function toJsxRuntime(tree: Nodes, options: Options): JSX.Element;
export type Identifier = import('estree').Identifier;
export type Literal = import('estree').Literal;
export type MemberExpression = import('estree').MemberExpression;
export type Expression = import('estree').Expression;
export type Program = import('estree').Program;
export type Element = import('hast').Element;
export type Nodes = import('hast').Nodes;
export type Parents = import('hast').Parents;
export type Root = import('hast').Root;
export type Text = import('hast').Text;
export type MdxFlowExpression = import('mdast-util-mdx-expression').MdxFlowExpressionHast;
export type MdxTextExpression = import('mdast-util-mdx-expression').MdxTextExpressionHast;
export type MdxJsxFlowElement = import('mdast-util-mdx-jsx').MdxJsxFlowElementHast;
export type MdxJsxTextElement = import('mdast-util-mdx-jsx').MdxJsxTextElementHast;
export type MdxjsEsm = import('mdast-util-mdxjs-esm').MdxjsEsmHast;
export type Schema = import('property-information').Schema;
export type Position = import('unist').Position;
export type Components = import('./components.js').Components;
/**
 * Child.
 */
export type Child = JSX.Element | string | null | undefined;
/**
 * Create something in development or production.
 */
export type Create = (node: Nodes, type: unknown, props: Props, key: string | undefined) => JSX.Element;
/**
 * Create an evaluator that turns ESTree ASTs from embedded MDX into values.
 */
export type CreateEvaluater = () => Evaluater;
/**
 * Casing to use for attribute names.
 *
 * HTML casing is for example `class`, `stroke-linecap`, `xml:lang`.
 * React casing is for example `className`, `strokeLinecap`, `xmlLang`.
 */
export type ElementAttributeNameCase = 'html' | 'react';
/**
 * Turn an MDX expression into a value.
 */
export type EvaluateExpression = (expression: Expression) => unknown;
/**
 * Turn an MDX program (export/import statements) into a value.
 */
export type EvaluateProgram = (expression: Program) => unknown;
/**
 * Evaluator that turns ESTree ASTs from embedded MDX into values.
 */
export type Evaluater = {
    /**
     *   Evaluate an expression.
     */
    evaluateExpression: EvaluateExpression;
    /**
     *   Evaluate a program.
     */
    evaluateProgram: EvaluateProgram;
};
/**
 * Property field.
 */
export type Field = [string, Value];
/**
 * Represent the children, typically a symbol.
 */
export type Fragment = unknown;
/**
 * Create a production element.
 */
export type Jsx = (type: unknown, props: Props, key?: string | undefined) => JSX.Element;
/**
 * Create a development element.
 */
export type JsxDev = (type: unknown, props: Props, key: string | undefined, isStaticChildren: boolean, source: Source, self: undefined) => JSX.Element;
/**
 * Properties and children.
 */
export type Props = {
    [prop: string]: string | number | boolean | import("hast").Element | import("mdast-util-mdx-jsx").MdxJsxTextElementHast | import("mdast-util-mdx-jsx").MdxJsxFlowElementHast | JSX.Element | Style | Child[] | null | undefined;
    children?: Array<Child> | Child;
    node?: Element | MdxJsxFlowElement | MdxJsxTextElement | undefined;
};
/**
 * Configuration.
 */
export type RegularFields = {
    /**
     * Components to use (optional).
     */
    components?: Partial<Components> | null | undefined;
    /**
     * Create an evaluator that turns ESTree ASTs into values (optional).
     */
    createEvaluater?: CreateEvaluater | null | undefined;
    /**
     * Specify casing to use for attribute names (default: `'react'`).
     */
    elementAttributeNameCase?: ElementAttributeNameCase | null | undefined;
    /**
     * File path to the original source file (optional).
     *
     * Passed in source info to `jsxDEV` when using the automatic runtime with
     * `development: true`.
     */
    filePath?: string | null | undefined;
    /**
     * Ignore invalid CSS in `style` props (default: `false`);
     * the default behavior is to throw an error.
     */
    ignoreInvalidStyle?: boolean | null | undefined;
    /**
     * Generate keys to optimize frameworks that support them (default: `true`).
     *
     * > 👉 **Note**: Solid currently fails if keys are passed.
     */
    passKeys?: boolean | null | undefined;
    /**
     * Pass the hast element node to components (default: `false`).
     */
    passNode?: boolean | null | undefined;
    /**
     * Whether `tree` is in the `'html'` or `'svg'` space (default: `'html'`).
     *
     * When an `<svg>` element is found in the HTML space, this package already
     * automatically switches to and from the SVG space when entering and exiting
     * it.
     */
    space?: Space | null | undefined;
    /**
     * Specify casing to use for property names in `style` objects (default:
     * `'dom'`).
     */
    stylePropertyNameCase?: StylePropertyNameCase | null | undefined;
    /**
     * Turn obsolete `align` props on `td` and `th` into CSS `style` props
     * (default: `true`).
     */
    tableCellAlignToStyle?: boolean | null | undefined;
};
/**
 * Runtime fields when development is on.
 */
export type RuntimeDevelopment = {
    /**
     *   Fragment.
     */
    Fragment: Fragment;
    /**
     *   Whether to use `jsxDEV` (when on) or `jsx` and `jsxs` (when off).
     */
    development: true;
    /**
     * Dynamic JSX (optional).
     */
    jsx?: Jsx | null | undefined;
    /**
     *   Development JSX.
     */
    jsxDEV: JsxDev;
    /**
     * Static JSX (optional).
     */
    jsxs?: Jsx | null | undefined;
};
/**
 * Runtime fields when development is off.
 */
export type RuntimeProduction = {
    /**
     *   Fragment.
     */
    Fragment: Fragment;
    /**
     * Whether to use `jsxDEV` (when on) or `jsx` and `jsxs` (when off) (optional).
     */
    development?: false | null | undefined;
    /**
     *   Dynamic JSX.
     */
    jsx: Jsx;
    /**
     * Development JSX (optional).
     */
    jsxDEV?: JsxDev | null | undefined;
    /**
     *   Static JSX.
     */
    jsxs: Jsx;
};
/**
 * Runtime fields when development might be on or off.
 */
export type RuntimeUnknown = {
    /**
     *   Fragment.
     */
    Fragment: Fragment;
    /**
     *   Whether to use `jsxDEV` (when on) or `jsx` and `jsxs` (when off).
     */
    development: boolean;
    /**
     * Dynamic JSX (optional).
     */
    jsx?: Jsx | null | undefined;
    /**
     * Development JSX (optional).
     */
    jsxDEV?: JsxDev | null | undefined;
    /**
     * Static JSX (optional).
     */
    jsxs?: Jsx | null | undefined;
};
/**
 * Info about source.
 */
export type Source = {
    /**
     *   Column where thing starts (0-indexed).
     */
    columnNumber: number | undefined;
    /**
     *   Name of source file.
     */
    fileName: string | undefined;
    /**
     *   Line where thing starts (1-indexed).
     */
    lineNumber: number | undefined;
};
/**
 * Namespace.
 *
 * > 👉 **Note**: hast is not XML.
 * > It supports SVG as embedded in HTML.
 * > It does not support the features available in XML.
 * > Passing SVG might break but fragments of modern SVG should be fine.
 * > Use `xast` if you need to support SVG as XML.
 */
export type Space = 'html' | 'svg';
/**
 * Info passed around.
 */
export type State = {
    /**
     *   Fragment symbol.
     */
    Fragment: unknown;
    /**
     *   Stack of parents.
     */
    ancestors: Array<Parents>;
    /**
     *   Components to swap.
     */
    components: Partial<Components>;
    /**
     *   Create something in development or production.
     */
    create: Create;
    /**
     *   Casing to use for attribute names.
     */
    elementAttributeNameCase: ElementAttributeNameCase;
    /**
     *   Evaluator that turns ESTree ASTs into values.
     */
    evaluater: Evaluater | undefined;
    /**
     *   File path.
     */
    filePath: string | undefined;
    /**
     *   Ignore invalid CSS in `style` props.
     */
    ignoreInvalidStyle: boolean;
    /**
     *   Generate keys to optimize frameworks that support them.
     */
    passKeys: boolean;
    /**
     *   Pass `node` to components.
     */
    passNode: boolean;
    /**
     *   Current schema.
     */
    schema: Schema;
    /**
     *   Casing to use for property names in `style` objects.
     */
    stylePropertyNameCase: StylePropertyNameCase;
    /**
     *   Turn obsolete `align` props on `td` and `th` into CSS `style` props.
     */
    tableCellAlignToStyle: boolean;
};
/**
 * Style map.
 */
export type Style = Record<string, string>;
/**
 * Casing to use for property names in `style` objects.
 *
 * CSS casing is for example `background-color` and `-webkit-line-clamp`.
 * DOM casing is for example `backgroundColor` and `WebkitLineClamp`.
 */
export type StylePropertyNameCase = 'css' | 'dom';
/**
 * Primitive property value and `Style` map.
 */
export type Value = Style | boolean | number | string;
/**
 * Configuration (development).
 */
export type Development = RuntimeDevelopment & RegularFields;
/**
 * Configuration.
 */
export type Options = Development | Production | Unknown;
/**
 * Configuration (production).
 */
export type Production = RegularFields & RuntimeProduction;
/**
 * Configuration (production or development).
 */
export type Unknown = RegularFields & RuntimeUnknown;
