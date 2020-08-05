/**
 * Extend this interface to build a type that is treated as an open set of properties, where each key is a string.
 */
export type StringIndexed = Record<string, any>;

/**
 * Type function which removes the index signature for the type `T`
 */
export type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer U }
  ? U
  : never;

/**
 * Type function which allows either types `T` or `U`, but not both.
 */
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
