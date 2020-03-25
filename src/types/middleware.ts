import { StringIndexed } from './helpers';
import { SlackEventMiddlewareArgs } from './events';
import { SlackActionMiddlewareArgs } from './actions';
import { SlackCommandMiddlewareArgs } from './command';
import { SlackOptionsMiddlewareArgs } from './options';
import { SlackViewMiddlewareArgs } from './view';
import { WebClient } from '@slack/web-api';
import { Logger } from '@slack/logger';

export type AnyMiddlewareArgs =
  SlackEventMiddlewareArgs | SlackActionMiddlewareArgs | SlackCommandMiddlewareArgs |
  SlackOptionsMiddlewareArgs | SlackViewMiddlewareArgs;

export interface Context extends StringIndexed {
}

// export type ProcessMiddlewareContext<Args> = Args & {
//   next?: NextMiddleware, context: Context,
//   logger: Logger,
//   client: WebClient,
// };

// export type MiddlewareContext<Args> = ProcessMiddlewareContext<Args> & {
//   next: NextMiddleware,
// };

// NOTE: Args should extend AnyMiddlewareArgs, but because of contravariance for function types, including that as a
// constraint would mess up the interface of App#event(), App#message(), etc.
export interface Middleware<Args> {
  // TODO: is there something nice we can do to get context's property types to flow from one middleware to the next?
  // (ctx: MiddlewareContext<Args>): Promise<unknown>;
  (args: Args & {
    next?: NextMiddleware,
    context: Context,
    logger: Logger,
    client: WebClient,
  }): Promise<void>;
}

export type NextMiddleware = () => Promise<void>;
