import { Option } from '@slack/types';
import { StringIndexed, XOR } from '../helpers';
import { AckFn } from '../utilities';
import { ViewOutput } from '../view/index';
import { FunctionContext } from '../functions';

/**
 * Arguments which listeners and middleware receive to process a Block Suggestions request from Slack
 */
export interface SlackBlockSuggestionsMiddlewareArgs<Source extends BlockSuggestionsSource = BlockSuggestionsSource> {
  payload: BlockSuggestionsPayloadFromType<Source>;
  body: this['payload'];
  options: this['payload'];
  ack: BlockSuggestionsAckFn;
}

/**
 * The source that comprises of Block Suggestions Requests.
 */
export type BlockSuggestionsSource = 'block_suggestion';

export type SlackBlockSuggestion = BlockSuggestionPayload;

export interface BasicBlockSuggestionsPayload<Type extends string = string> {
  type: Type;
  value: string;
}

export type BlockSuggestionsPayloadFromType<T extends string> = KnownBlockSuggestionsPayloadFromType<T> extends never
  ? BasicBlockSuggestionsPayload<T>
  : KnownBlockSuggestionsPayloadFromType<T>;

export type KnownBlockSuggestionsPayloadFromType<T extends string> = Extract<SlackBlockSuggestion, { type: T }>;

/**
 * Block Suggestion payload model for next-gen interactivity
 */
export interface BlockSuggestionPayload extends FunctionContext {
  api_app_id: string;
  channel?: {
    id: string;
    name: string;
  };
  enterprise: {
    id: string;
    name: string;
  } | null;
  message?: {
    app_id: string;
    blocks: {
      block_id: string;
      type: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }[];
    bot_id: string;
    is_locked?: boolean;
    latest_reply?: string;
    metadata?: {
      event_type: string;
      event_payload: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      };
    };
    reply_count?: number;
    reply_users?: string[];
    reply_users_count?: number;
    team: string;
    text: string;
    thread_ts?: string;
    ts: string;
    type: 'message';
    user: string;
  };
  team: {
    domain: string;
    id: string;
  } | null;
  user: {
    id: string;
    name: string;
    team_id: string;
  };
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  container: StringIndexed;
  // exists for blocks in either a modal or a home tab
  view?: ViewOutput;
}

/**
 * Type function which given a Block Suggestion `Source` returns a corresponding type for the `ack()` function. The
 * function is used to fulfill the options request from a listener or middleware.
 */
type BlockSuggestionsAckFn = AckFn<XOR<BlockSuggestionOptions, BlockSuggestionOptionGroups<BlockSuggestionOptions>>>;

export interface BlockSuggestionOptions {
  options: Option[];
}

export interface BlockSuggestionOptionGroups<Options> {
  option_groups: ({
    label: string;
  } & Options)[];
}
