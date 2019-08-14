import { StringIndexed } from './helpers';
import { SlackEventMiddlewareArgs } from './events';
import { SlackActionMiddlewareArgs } from './actions';
import { SlackCommandMiddlewareArgs } from './command';
import { SlackOptionsMiddlewareArgs } from './options';
import { CodedError, ErrorCode } from '../errors';

export type AnyMiddlewareArgs =
  SlackEventMiddlewareArgs | SlackActionMiddlewareArgs | SlackCommandMiddlewareArgs | SlackOptionsMiddlewareArgs;

export interface PostProcessFn {
  (error: Error | undefined, done: (error?: Error) => Promise<void>): Promise<void>;
}

export interface Context extends StringIndexed {
}

// NOTE: Args should extend AnyMiddlewareArgs, but because of contravariance for function types, including that as a
// constraint would mess up the interface of App#event(), App#message(), etc.
export interface Middleware<Args> {
  // TODO: is there something nice we can do to get context's property types to flow from one middleware to the next?
  (args: Args & { next: NextMiddleware, context: Context }): Promise<void>;
}

export interface NextMiddleware {
  (error: Error): Promise<void>;
  (postProcess: PostProcessFn): Promise<void>;
  (): Promise<void>;
}

export interface ContextMissingPropertyError extends CodedError {
  code: ErrorCode.ContextMissingPropertyError;
  missingProperty: string;
}
