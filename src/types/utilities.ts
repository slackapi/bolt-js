import type { ChatPostMessageArguments, ChatPostMessageResponse } from '@slack/web-api';
// TODO: breaking change: remove, unnecessary abstraction, just use Record directly
/**
 * Extend this interface to build a type that is treated as an open set of properties, where each key is a string.
 */
// biome-ignore lint/suspicious/noExplicitAny: we're being quite explicit here
export type StringIndexed = Record<string, any>;

// TODO: unclear if this is helpful or just complicates further
/**
 * Type function which allows either types `T` or `U`, but not both.
 */
export type XOR<T, U> = T | U extends Record<string, unknown> ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

/** Type predicate for use with `Promise.allSettled` for filtering for resolved results. */
export const isFulfilled = <T>(p: PromiseSettledResult<T>): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';
/** Type predicate for use with `Promise.allSettled` for filtering for rejected results. */
export const isRejected = <T>(p: PromiseSettledResult<T>): p is PromiseRejectedResult => p.status === 'rejected';

/** Using type parameter T (generic), can distribute the Omit over a union set. */
// biome-ignore lint/suspicious/noExplicitAny: any is the opposite of never
type DistributiveOmit<T, K extends PropertyKey> = T extends any ? Omit<T, K> : never;

// The say() utility function binds the message to the same channel as the incoming message that triggered the
// listener. Therefore, specifying the `channel` argument is not required.
export type SayArguments = DistributiveOmit<ChatPostMessageArguments, 'channel'> & {
  // TODO: This will be overwritten in the `createSay` factory method in App.ts anyways, so why include it?
  channel?: string;
};
export type SayFn = (message: string | SayArguments) => Promise<ChatPostMessageResponse>;

export type RespondArguments = DistributiveOmit<ChatPostMessageArguments, 'channel' | 'text'> & {
  /** Response URLs can be used to send ephemeral messages or in-channel messages using this argument */
  response_type?: 'in_channel' | 'ephemeral';
  replace_original?: boolean;
  delete_original?: boolean;
  text?: string;
};

// biome-ignore lint/suspicious/noExplicitAny: TODO: check if we can type this more strictly than any
export type RespondFn = (message: string | RespondArguments) => Promise<any>;

export type AckFn<Response> = (response?: Response) => Promise<void>;
