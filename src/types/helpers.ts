/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: breaking change: remove, unnecessary abstraction, just use Record directly
/**
 * Extend this interface to build a type that is treated as an open set of properties, where each key is a string.
 */
export type StringIndexed = Record<string, any>;

/**
 * Type function which allows either types `T` or `U`, but not both.
 */
export type XOR<T, U> = T | U extends Record<string, unknown>
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
