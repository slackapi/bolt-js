import type { FunctionsCompleteErrorResponse, FunctionsCompleteSuccessResponse } from '@slack/web-api';
import { CustomFunctionInitializationError } from './errors';
import { autoAcknowledge, matchEventType, onlyEvents } from './middleware/builtin';
import type {
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  Middleware,
  SlackEventMiddlewareArgs,
  SlackEventMiddlewareArgsOptions,
} from './types';

// TODO: move this type to src/context/create-function-complete.ts
interface FunctionCompleteArguments {
  // biome-ignore lint/suspicious/noExplicitAny: TODO: could probably improve custom function parameter shapes - deno-slack-sdk has a bunch of this stuff we should move to slack/types
  outputs?: Record<string, any>;
}
// TODO: move this type to src/context/create-function-complete.ts
export type FunctionCompleteFn = {
  (params?: FunctionCompleteArguments): Promise<FunctionsCompleteSuccessResponse>;
  /**
   * @description Check if this complete function has been called.
   */
  hasBeenCalled(): boolean;
};

// TODO: move this type to src/context/create-function-fail.ts
interface FunctionFailArguments {
  error: string;
}

// TODO: move this type to src/context/create-function-fail.ts
export type FunctionFailFn = {
  (params: FunctionFailArguments): Promise<FunctionsCompleteErrorResponse>;
  /**
   * @description Check if this fail function has been called.
   */
  hasBeenCalled(): boolean;
};

export type SlackCustomFunctionMiddlewareArgs = SlackEventMiddlewareArgs<'function_executed'>;

/** @deprecated use Middleware<SlackCustomFunctionMiddlewareArgs>[] instead - this may be removed in a minor release */
export type CustomFunctionMiddleware = Middleware<SlackCustomFunctionMiddlewareArgs>[];

/** @deprecated use SlackCustomFunctionMiddlewareArgs & AllMiddlewareArgs instead - this may be removed in a minor release */
export type AllCustomFunctionMiddlewareArgs<
  T extends SlackCustomFunctionMiddlewareArgs = SlackCustomFunctionMiddlewareArgs,
> = T & AllMiddlewareArgs;

/*
 * Middleware that matches a function callback ID
 */
export function matchCallbackId(callbackId: string): Middleware<SlackCustomFunctionMiddlewareArgs> {
  return async ({ payload, next }) => {
    if (payload.function.callback_id === callbackId) {
      await next();
    }
  };
}

/** Class */
export class CustomFunction {
  /** Function callback_id */
  public callbackId: string;

  private listeners: Middleware<SlackCustomFunctionMiddlewareArgs>[];

  private options: SlackEventMiddlewareArgsOptions;

  public constructor(
    callbackId: string,
    listeners: Middleware<SlackCustomFunctionMiddlewareArgs>[],
    options: SlackEventMiddlewareArgsOptions,
  ) {
    validate(callbackId, listeners);

    this.callbackId = callbackId;
    this.listeners = listeners;
    this.options = options;
  }

  public getListeners(): Middleware<AnyMiddlewareArgs>[] {
    if (this.options.autoAcknowledge) {
      return [
        onlyEvents,
        matchEventType('function_executed'),
        matchCallbackId(this.callbackId),
        autoAcknowledge,
        ...this.listeners,
      ] as Middleware<AnyMiddlewareArgs>[];
    }
    return [
      onlyEvents,
      matchEventType('function_executed'),
      matchCallbackId(this.callbackId),
      ...this.listeners,
    ] as Middleware<AnyMiddlewareArgs>[]; // FIXME: workaround for TypeScript 4.7 breaking changes
  }
}

/** Helper Functions */
export function validate(callbackId: string, middleware: Middleware<SlackCustomFunctionMiddlewareArgs>[]): void {
  // Ensure callbackId is valid
  if (typeof callbackId !== 'string') {
    const errorMsg = 'CustomFunction expects a callback_id as the first argument';
    throw new CustomFunctionInitializationError(errorMsg);
  }

  // Ensure middleware argument is either a function or an array
  if (typeof middleware !== 'function' && !Array.isArray(middleware)) {
    const errorMsg = 'CustomFunction expects a function or array of functions as the second argument';
    throw new CustomFunctionInitializationError(errorMsg);
  }

  // Ensure array includes only functions
  if (Array.isArray(middleware)) {
    for (const fn of middleware) {
      if (!(fn instanceof Function)) {
        const errorMsg = 'All CustomFunction middleware must be functions';
        throw new CustomFunctionInitializationError(errorMsg);
      }
    }
  }
}
