/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatPostMessageArguments, ChatPostMessageResponse } from '@slack/web-api';
import { MessageAttachment } from '@slack/types';

// TODO: need to figure out a way to type this better. how to reuse chat post message arguments? might need to export
// sub-types from web-api and re-assemble here

// The say() utility function binds the message to the same channel as the incoming message that triggered the
// listener. Therefore, specifying the `channel` argument is not required.
// export type SayArguments = Exclude<ChatPostMessageArguments, 'channel'> & {
export interface SayArguments {
  text?: string;
  channel?: string;
  // TODO: type it better below
  blocks?: Record<string, any>[];
  attachments?: MessageAttachment[];
}

export interface SayFn {
  (message: string | ChatPostMessageArguments): Promise<ChatPostMessageResponse>;
}

// export type RespondArguments = Exclude<ChatPostMessageArguments, 'channel' | 'text' | 'blocks' | 'attachments'>
export interface RespondArguments extends SayArguments {
  /** Response URLs can be used to send ephemeral messages or in-channel messages using this argument */
  response_type?: 'in_channel' | 'ephemeral';
  replace_original?: boolean;
  delete_original?: boolean;
}

export interface RespondFn {
  (message: string | RespondArguments): Promise<any>;
}

export interface AckFn<Response> {
  (response?: Response): Promise<void>;
}
