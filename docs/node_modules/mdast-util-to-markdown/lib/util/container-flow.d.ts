/**
 * @typedef {import('../types.js').FlowParents} FlowParents
 * @typedef {import('../types.js').FlowChildren} FlowChildren
 * @typedef {import('../types.js').State} State
 * @typedef {import('../types.js').TrackFields} TrackFields
 */
/**
 * @param {FlowParents} parent
 *   Parent of flow nodes.
 * @param {State} state
 *   Info passed around about the current state.
 * @param {TrackFields} info
 *   Info on where we are in the document we are generating.
 * @returns {string}
 *   Serialized children, joined by (blank) lines.
 */
export function containerFlow(parent: FlowParents, state: State, info: TrackFields): string;
export type FlowParents = import('../types.js').FlowParents;
export type FlowChildren = import('../types.js').FlowChildren;
export type State = import('../types.js').State;
export type TrackFields = import('../types.js').TrackFields;
