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

export interface Context extends StringIndexed {}

export type NextFn = () => Promise<void>;
