/**
 * Handle an MDX ESM node.
 *
 * @param {MdxjsEsm} node
 *   hast node to transform.
 * @param {State} state
 *   Info passed around about the current state.
 * @returns {undefined}
 *   Nothing.
 */
export function mdxjsEsm(node: MdxjsEsm, state: State): undefined;
export type MdxjsEsm = import('mdast-util-mdxjs-esm').MdxjsEsmHast;
export type State = import('../state.js').State;
