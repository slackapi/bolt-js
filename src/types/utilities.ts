/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatPostMessageArguments, ChatPostMessageResponse } from '@slack/web-api';

/** Type predicate for use with `Promise.allSettled` for filtering for resolved results. */
export const isFulfilled = <T>(p:PromiseSettledResult<T>): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';
/** Type predicate for use with `Promise.allSettled` for filtering for rejected results. */
export const isRejected = <T>(p:PromiseSettledResult<T>): p is PromiseRejectedResult => p.status === 'rejected';

// TODO: consider moving the following types closer to relevant code
// The say() utility function binds the message to the same channel as the incoming message that triggered the
// listener. Therefore, specifying the `channel` argument is not required.
export type SayArguments = Omit<ChatPostMessageArguments, 'channel'> & {
  // TODO: This will be overwritten in the `createSay` factory method in App.ts anyways, so why include it?
  channel?: string;
};

export interface SayFn {
  (message: string | SayArguments): Promise<ChatPostMessageResponse>;
}

export type RespondArguments = Omit<ChatPostMessageArguments, 'channel' | 'text'>
& {
  /** Response URLs can be used to send ephemeral messages or in-channel messages using this argument */
  response_type?: 'in_channel' | 'ephemeral';
  replace_original?: boolean;
  delete_original?: boolean;
  text?: string;
};

export interface RespondFn {
  (message: string | RespondArguments): Promise<any>;
}

export interface AckFn<Response> {
  (response?: Response): Promise<void>;
}
