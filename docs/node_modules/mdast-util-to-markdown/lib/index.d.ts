/**
 * Turn an mdast syntax tree into markdown.
 *
 * @param {Nodes} tree
 *   Tree to serialize.
 * @param {Options} [options]
 *   Configuration (optional).
 * @returns {string}
 *   Serialized markdown representing `tree`.
 */
export function toMarkdown(tree: Nodes, options?: import("./types.js").Options | undefined): string;
export type Nodes = import('mdast').Nodes;
export type Enter = import('./types.js').Enter;
export type Info = import('./types.js').Info;
export type Join = import('./types.js').Join;
export type FlowParents = import('./types.js').FlowParents;
export type Options = import('./types.js').Options;
export type PhrasingParents = import('./types.js').PhrasingParents;
export type SafeConfig = import('./types.js').SafeConfig;
export type State = import('./types.js').State;
export type TrackFields = import('./types.js').TrackFields;
