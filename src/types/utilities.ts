import { ChatPostMessageArguments, ChatPostMessageResponse } from '@slack/web-api';

// (issue#951) KnownKeys<ChatPostMessageArguments> no longer works in TypeScript 4.3
type ChatPostMessageArgumentsKnownKeys =
  | 'token'
  | 'channel'
  | 'text'
  | 'as_user'
  | 'attachments'
  | 'blocks'
  | 'icon_emoji'
  | 'icon_url'
  | 'link_names'
  | 'mrkdwn'
  | 'parse'
  | 'reply_broadcast'
  | 'thread_ts'
  | 'unfurl_links'
  | 'unfurl_media'
  | 'username';

// The say() utility function binds the message to the same channel as the incoming message that triggered the
// listener. Therefore, specifying the `channel` argument is not required.
export type SayArguments = Pick<ChatPostMessageArguments, Exclude<ChatPostMessageArgumentsKnownKeys, 'channel'>> & {
  channel?: string;
};

export interface SayFn {
  (message: string | SayArguments): Promise<ChatPostMessageResponse>;
}

export type RespondArguments = Pick<ChatPostMessageArguments, Exclude<ChatPostMessageArgumentsKnownKeys, 'channel' | 'text'>
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
