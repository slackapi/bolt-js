/**
 * A plugin to transform an HTML (hast) tree to a JS (estree).
 * `hast-util-to-estree` does all the work for us!
 *
 * @param {Readonly<ProcessorOptions>} options
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export function rehypeRecma(options: Readonly<ProcessorOptions>): (tree: Root) => Program;
export type Program = import('estree-jsx').Program;
export type Root = import('hast').Root;
export type ProcessorOptions = import('../core.js').ProcessorOptions;
//# sourceMappingURL=rehype-recma.d.ts.map