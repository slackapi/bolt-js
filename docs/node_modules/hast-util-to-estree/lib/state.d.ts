/**
 * Create a state from options.
 *
 * @param {Options} options
 *   Configuration.
 * @returns {State}
 *   Info passed around about the current state.
 */
export function createState(options: Options): State;
export type Comment = import('estree').Comment;
export type Directive = import('estree').Directive;
export type ModuleDeclaration = import('estree').ModuleDeclaration;
export type EstreeNode = import('estree').Node;
export type Statement = import('estree').Statement;
export type JsxAttribute = import('estree-jsx').JSXAttribute;
export type JsxElement = import('estree-jsx').JSXElement;
export type JsxIdentifier = import('estree-jsx').JSXIdentifier;
export type JsxMemberExpression = import('estree-jsx').JSXMemberExpression;
export type JsxNamespacedName = import('estree-jsx').JSXNamespacedName;
export type MdxJsxAttribute = import('mdast-util-mdx-jsx').MdxJsxAttribute;
export type MdxJsxAttributeValueExpression = import('mdast-util-mdx-jsx').MdxJsxAttributeValueExpression;
export type MdxJsxExpressionAttribute = import('mdast-util-mdx-jsx').MdxJsxExpressionAttribute;
export type HastNodes = import('hast').Nodes;
export type HastParents = import('hast').Parents;
export type Schema = import('property-information').Schema;
export type JsxElementName = JsxElement['openingElement']['name'];
export type JsxAttributeName = JsxAttribute['name'];
export type JsxChild = JsxElement['children'][number];
/**
 * Specify casing to use for attribute names.
 *
 * HTML casing is for example `class`, `stroke-linecap`, `xml:lang`.
 * React casing is for example `className`, `strokeLinecap`, `xmlLang`.
 */
export type ElementAttributeNameCase = 'html' | 'react';
/**
 * Turn a hast node into an estree node.
 */
export type Handle = (node: any, state: State) => JsxChild | null | undefined;
/**
 * Configuration.
 */
export type Options = {
    /**
     * Specify casing to use for attribute names (default: `'react'`).
     *
     * This casing is used for hast elements, not for embedded MDX JSX nodes
     * (components that someone authored manually).
     */
    elementAttributeNameCase?: ElementAttributeNameCase | null | undefined;
    /**
     * Custom handlers (optional).
     */
    handlers?: Record<string, Handle | null | undefined> | null | undefined;
    /**
     * Which space the document is in (default: `'html'`).
     *
     * When an `<svg>` element is found in the HTML space, this package already
     * automatically switches to and from the SVG space when entering and exiting
     * it.
     */
    space?: Space | null | undefined;
    /**
     * Specify casing to use for property names in `style` objects (default: `'dom'`).
     *
     * This casing is used for hast elements, not for embedded MDX JSX nodes
     * (components that someone authored manually).
     */
    stylePropertyNameCase?: StylePropertyNameCase | null | undefined;
    /**
     * Turn obsolete `align` props on `td` and `th` into CSS `style` props
     * (default: `true`).
     */
    tableCellAlignToStyle?: boolean | null | undefined;
};
/**
 * Namespace.
 */
export type Space = 'html' | 'svg';
/**
 * Casing to use for property names in `style` objects.
 *
 * CSS casing is for example `background-color` and `-webkit-line-clamp`.
 * DOM casing is for example `backgroundColor` and `WebkitLineClamp`.
 */
export type StylePropertyNameCase = 'css' | 'dom';
/**
 * Info passed around about the current state.
 */
export type State = {
    /**
     *   Transform children of a hast parent to estree.
     */
    all: (parent: HastParents) => Array<JsxChild>;
    /**
     *   List of estree comments.
     */
    comments: Array<Comment>;
    /**
     *   Create a JSX attribute name.
     */
    createJsxAttributeName: (name: string) => JsxAttributeName;
    /**
     *   Create a JSX element name.
     */
    createJsxElementName: (name: string) => JsxElementName;
    /**
     *   Casing to use for attribute names.
     */
    elementAttributeNameCase: ElementAttributeNameCase;
    /**
     *   List of top-level estree nodes.
     */
    esm: Array<Directive | ModuleDeclaration | Statement>;
    /**
     *   Transform a hast node to estree.
     */
    handle: (node: any) => JsxChild | null | undefined;
    /**
     *   Take positional info and data from `from` (use `patch` if you don’t want data).
     */
    inherit: (from: HastNodes | MdxJsxAttribute | MdxJsxAttributeValueExpression | MdxJsxExpressionAttribute, to: Comment | EstreeNode) => undefined;
    /**
     *   Take positional info from `from` (use `inherit` if you also want data).
     */
    patch: (from: HastNodes, to: Comment | EstreeNode) => undefined;
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
