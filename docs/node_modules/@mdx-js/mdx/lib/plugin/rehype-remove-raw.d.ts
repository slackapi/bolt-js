/**
 * A tiny plugin that removes raw HTML.
 *
 * This is needed if the format is `md` and `rehype-raw` was not used to parse
 * dangerous HTML into nodes.
 *
 * @returns
 *   Transform.
 */
export function rehypeRemoveRaw(): (tree: Root) => undefined;
export type Root = import('hast').Root;
//# sourceMappingURL=rehype-remove-raw.d.ts.map