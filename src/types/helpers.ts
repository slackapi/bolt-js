/**
 * Extend this interface to build a type that is treated as an open set of properties, where each key is a string.
 */
export type StringIndexed = Record<string, any>;

/**
 * @deprecated No longer works in TypeScript 4.3
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type KnownKeys<T> = never;

/**
 * Type function which allows either types `T` or `U`, but not both.
 */
export type XOR<T, U> = T | U extends Record<string, unknown> ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
