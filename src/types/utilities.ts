import { ChatPostMessageArguments } from '@slack/web-api';
import { KnownKeys } from './helpers';

// The say() utility function binds the message to the same channel as the incoming message that triggered the
// listener. Therefore, specifying the `channel` argument is not required.
export type SayArguments = Pick<ChatPostMessageArguments, Exclude<KnownKeys<ChatPostMessageArguments>, 'channel'>> & {
  channel?: string;
};

export interface SayFn {
  (message: string | SayArguments): void;
}

export type RespondArguments = SayArguments & {
  /** Response URLs can be used to send ephemeral messages or in-channel messages using this argument */
  response_type?: 'in_channel' | 'ephemeral';
  replace_original?: boolean;
  delete_original?: boolean;
};

export interface RespondFn {
  (message: string | RespondArguments): void;
}

export interface AckFn<Response> {
  (response?: Response): void;
}

export interface ReactFn {
  (reaction: string): void;
}