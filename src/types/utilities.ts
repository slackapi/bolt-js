import { ChatPostMessageArguments, WebAPICallResult } from '@slack/web-api';
import { KnownKeys } from './helpers';

// The say() utility function binds the message to the same channel as the incoming message that triggered the
// listener. Therefore, specifying the `channel` argument is not required.
export type SayArguments = Pick<ChatPostMessageArguments, Exclude<KnownKeys<ChatPostMessageArguments>, 'channel'>> & {
  channel?: string;
};

export interface SayFn {
  (message: string | SayArguments): Promise<WebAPICallResult>;
}

export type RespondArguments = Pick<
  ChatPostMessageArguments,
  Exclude<KnownKeys<ChatPostMessageArguments>, 'channel' | 'text'>
> & {
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
