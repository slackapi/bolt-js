import { WebClient } from '@slack/web-api';
import { Logger } from '@slack/logger';
import { StringIndexed } from './helpers';
import { SlackEventMiddlewareArgs } from './events';
import { SlackActionMiddlewareArgs } from './actions';
import { SlackCommandMiddlewareArgs } from './command';
import { SlackOptionsMiddlewareArgs } from './options';
import { SlackShortcutMiddlewareArgs } from './shortcuts';
import { SlackViewMiddlewareArgs } from './view';

// TODO: rename this to AnyListenerArgs, and all the constituent types
export type AnyMiddlewareArgs =
  | SlackEventMiddlewareArgs
  | SlackActionMiddlewareArgs
  | SlackCommandMiddlewareArgs
  | SlackOptionsMiddlewareArgs
  | SlackViewMiddlewareArgs
  | SlackShortcutMiddlewareArgs;

export interface AllMiddlewareArgs {
  context: Context;
  logger: Logger;
  client: WebClient;
  // TODO: figure out how to make next non-optional
  next?: NextFn;
}

// NOTE: Args should extend AnyMiddlewareArgs, but because of contravariance for function types, including that as a
// constraint would mess up the interface of App#event(), App#message(), etc.
export interface Middleware<Args> {
  (args: Args & AllMiddlewareArgs): Promise<void>;
}

/**
 * Context object, which provides contextual information associated with an incoming requests.
 * You can set any other custom attributes in global middleware as long as the key does not conflict with others.
 */
export interface Context extends StringIndexed {
  /**
   * A bot token, which starts with `xoxb-`.
   * This value can be used by `say` (preferred over userToken),
   */
  botToken?: string;
  /**
   * A bot token, which starts with `xoxp-`.
   * This value can be used by `say` (overridden by botToken),
   */
  userToken?: string;
  /**
   * This app's bot ID in the installed workspace.
   * This is required for `ignoreSelf` global middleware.
   * see also: https://github.com/slackapi/bolt-js/issues/874
   */
  botId?: string;
  /**
   * This app's bot user ID in the installed workspace.
   * This value is optional but allows `ignoreSelf` global middleware be more filter more than just message events.
   */
  botUserId?: string;
  /**
   * Workspace ID.
   */
  teamId?: string;
  /**
   * Enterprise Grid Organization ID.
   */
  enterpriseId?: string;
}

export type NextFn = () => Promise<void>;
