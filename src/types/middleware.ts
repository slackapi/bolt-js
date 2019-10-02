import { StringIndexed } from './helpers';
import { SlackEventMiddlewareArgs } from './events';
import { SlackActionMiddlewareArgs } from './actions';
import { SlackCommandMiddlewareArgs } from './command';
import { SlackOptionsMiddlewareArgs } from './options';
import { SlackViewMiddlewareArgs } from './view';
import { CodedError, ErrorCode } from '../errors';

export type AnyMiddlewareArgs =
  SlackEventMiddlewareArgs | SlackActionMiddlewareArgs | SlackCommandMiddlewareArgs |
  SlackOptionsMiddlewareArgs | SlackViewMiddlewareArgs;

export interface PostProcessFn {
  (error: Error | undefined, done: (error?: Error) => void): unknown;
}

export interface Context {
}
export interface StringIndexedContext extends Context, StringIndexed {
}

// NOTE: Args should extend AnyMiddlewareArgs, but because of contravariance for function types, including that as a
// constraint would mess up the interface of App#event(), App#message(), etc.
export interface Middleware<Args, CurrentContext extends Context = StringIndexedContext> {
  // TODO: is there something nice we can do to get context's property types to flow from one middleware to the next?
  (args: Args & { next: NextMiddleware, context: CurrentContext }): unknown;
}

export interface NextMiddleware {
  (error: Error): void;
  (postProcess: PostProcessFn): void;
  (): void;
}

export interface ContextMissingPropertyError extends CodedError {
  code: ErrorCode.ContextMissingPropertyError;
  missingProperty: string;
}
