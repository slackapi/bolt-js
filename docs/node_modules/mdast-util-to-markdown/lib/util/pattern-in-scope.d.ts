/**
 * @typedef {import('../types.js').ConstructName} ConstructName
 * @typedef {import('../types.js').Unsafe} Unsafe
 */
/**
 * @param {Array<ConstructName>} stack
 * @param {Unsafe} pattern
 * @returns {boolean}
 */
export function patternInScope(stack: Array<ConstructName>, pattern: Unsafe): boolean;
export type ConstructName = import('../types.js').ConstructName;
export type Unsafe = import('../types.js').Unsafe;
