/**
 * @param {State} base
 * @param {Options} extension
 * @returns {State}
 */
export function configure(base: State, extension: Options): State;
export type Options = import('./types.js').Options;
export type State = import('./types.js').State;
