import util from 'util';
import { Logger, LogLevel, ConsoleLogger } from '@slack/logger';
import {
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  Middleware,
  SlackAction,
  SlackActionMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackViewAction,
  SlackViewMiddlewareArgs,
} from './types';

import {
  ActionConstraints,
  ViewConstraints,
} from './App';

import {
  SlackFunctionCompleteError,
  SlackFunctionExecutionError,
  SlackFunctionInitializationError,
} from './errors';

// eslint-disable-next-line
export const manifestUtil = require('./cli/hook-utils/manifest');
// eslint-disable-next-line
export const getManifestDataUtil = require('./cli/hook-utils/get-manifest-data');

/* Types */
export interface SlackFunctionExecutedMiddlewareArgs extends SlackEventMiddlewareArgs<'function_executed'> {
  complete: CompleteFunction
}

export interface CompleteFunction {
  (args: CompleteFunctionArgs): Promise<void>,
}

export interface CompleteFunctionArgs {
  // outputs are set by developer in the manifest file
  outputs?: Record<string, unknown>,
  error?: string,
}

export type AllSlackFunctionExecutedMiddlewareArgs =
SlackFunctionExecutedMiddlewareArgs &
SlackActionMiddlewareArgs &
AllMiddlewareArgs;

interface FunctionInteractivityMiddleware {
  constraints: FunctionInteractivityConstraints,
  handler: Middleware<SlackActionMiddlewareArgs> | Middleware<SlackViewMiddlewareArgs>
}

type FunctionInteractivityConstraints = ActionConstraints | ViewConstraints;
// an array of Action constraints keys as strings
type ActionConstraintsKeys = Extract<(keyof ActionConstraints), string>[];
type ViewConstraintsKeys = Extract<(keyof ViewConstraints), string>[];

interface SlackFnValidateResult { pass: boolean, msg?: string }
export interface ManifestDefinitionResult {
  matchFound: boolean
  fnKeys?: string[]
}

/**
 * *SlackFunction*
 *
 * Configure a SlackFunction's callbackId,
 * and any expected inputs and outputs
 * in your project's manifest file (json or js).
 *
 * Use this class to declare your handling logic:
 *
 * Example:
 * ```
 *    const myFunc = new SlackFunction('fn_callback_id', () => {});
 * ```
 * You can also declare
 * optional handlers for `block_action` and `view` events
 * related to your function.
 *
 * Example:
 * ```
 *    myFunc.action('action_id', () => {})
 *                 .view('view_callback_id', () => {});
 * ```
 * Note: This is not equivalent to app.action() or app.view()
 *
 * *Completing your function*
 *
 * Call the supplied utility `complete` when your function is
 * done executing. This tells Slack it can proceed
 * with any next steps in any workflow this function might
 * be included in.
 *
 * Supply outputs or an error or nothing when your
 * function is done. Note, your outputs should match what you
 * have defined in your in your manifest.
 *
 * Example:
 * ```
 *    const myFunc = new SlackFunction('fn_callback_id', ({ complete }) => {
 *      // do my work here
 *
 *      complete() // or
 *      complete({ outputs: {} }); // or
 *      complete({ error: "error details here" });
 *   });
 * ```
 *
 * Call `complete()` from your main handler or
 * an interactivity handler. Note, once a function is
 * completed (either with outputs or an error), interactions
 * from views generated in the course of function execution
 * will no longer trigger associated handlers, so remember to clean those up.
 * */
export class SlackFunction {
  /**
    * @description The callback_id of the function
    * as defined in your manifest file
    * */
  private callbackId: string;

  /**
   * @description handler to to process corresponding
   * function_executed event
   */
  private handler: Middleware<SlackEventMiddlewareArgs>;

  private interactivityHandlers: FunctionInteractivityMiddleware[];

  private logger: Logger;

  public constructor(callbackId: string, handler: Middleware<SlackEventMiddlewareArgs>) {
    validate(callbackId, handler);

    this.callbackId = callbackId;
    this.handler = handler;
    this.interactivityHandlers = [];

    // set an initial default logging
    const logger = new ConsoleLogger();
    logger.setName(`SlackFunction: [${this.callbackId}]`);
    logger.setLevel(LogLevel.DEBUG);
    this.logger = logger;
  }

  /**
   * Attach a block_actions interactivity handler to your SlackFunction
   *
   * ```
   * Example:
   * const actionHandler = async () => {};
   * const actionHandler1 = async () => {};
   * myFunc.action("id", actionHandler).action("id1", actionHandler1);
   * ```
   *
   * @param actionIdOrConstraints Provide an action_id string
   * corresponding to the value supplied in your blocks or a
   * constraint object of type ActionConstraints<SlackAction>
   *
   * ```
   * Example:
   * myFunc.action({ type: "action_submission" });
   * myFunc.action({ action_id: "id" }, actionHandler);
   * ```
   * @param handler Provide a handler function
   * @returns SlackFunction instance
   */
  public action<
    Action extends SlackAction = SlackAction,
    Constraints extends ActionConstraints<Action> = ActionConstraints<Action>,
  >(
    actionIdOrConstraints: string | RegExp | Constraints,
    handler: Middleware<SlackActionMiddlewareArgs>,
  ): this {
    // normalize constraints
    const constraints: ActionConstraints = (
      typeof actionIdOrConstraints === 'string' ||
      util.types.isRegExp(actionIdOrConstraints)
    ) ?
      { action_id: actionIdOrConstraints } :
      actionIdOrConstraints;

    // declare our valid constraints keys
    const validConstraintsKeys: ActionConstraintsKeys = ['action_id', 'block_id', 'callback_id', 'type'];
    // cast to string array for convenience
    const validConstraintsKeysAsStrings = validConstraintsKeys as string[];

    errorIfInvalidConstraintKeys(constraints, validConstraintsKeysAsStrings, handler);

    this.interactivityHandlers.push({ constraints, handler });
    return this;
  }

  /**
   * Attach a view_submission or view_closed interactivity handler
   * to your SlackFunction
   *
   * ```
   * Example:
   * const viewHandler = async () => {};
   * const viewHandler1 = async () => {};
   * myFunc.view("id", viewHandler).view("id1", viewHandler1)
   * ```
   *
   * @param callbackIdOrConstraints Provide a `callback_id` string
   * a constraint object of type ViewConstraints
   *
   * ```
   * Example:
   * myFunc.view({ type: "view_submission" });
   * myFunc.view({ callback_id: "id", }, viewHandler)
   * ```
   *
   * @param handler Provide a handler function
   * @returns SlackFunction instance
   */
  public view(
    callbackIdOrConstraints: string | RegExp | ViewConstraints,
    handler: Middleware<SlackViewMiddlewareArgs<SlackViewAction>>,
  ): this {
    // normalize constraints
    const constraints: ViewConstraints = (
      typeof callbackIdOrConstraints === 'string' ||
      util.types.isRegExp(callbackIdOrConstraints)
    ) ?
      { callback_id: callbackIdOrConstraints, type: 'view_submission' } :
      callbackIdOrConstraints;

    // declare our valid constraints keys
    const validConstraintsKeys: ViewConstraintsKeys = ['callback_id', 'type'];
    // cast to string array for convenience
    const validConstraintsKeysAsStrings = validConstraintsKeys as string[];

    errorIfInvalidConstraintKeys(constraints, validConstraintsKeysAsStrings, handler);

    this.interactivityHandlers.push({ constraints, handler });
    return this;
  }

  private matchesFuncConstraints(args: AnyMiddlewareArgs): boolean {
    if ('function' in args.payload) {
      return this.callbackId === args.payload.function.callback_id;
    }
    return false;
  }

  /**
   * Returns a a single middleware to global
   * middleware chain. Responsible for returning
   * handlers required for either function execution
   * or function interactivity event handlering to
   * the global event processing chain.
  */
  public getMiddleware(): Middleware<AnyMiddlewareArgs> {
    return (args): Promise<void> => {
      // handle function executed event
      if ((isFunctionExecutedEvent(args) && this.matchesFuncConstraints(args))) {
        return this.runHandler(args);
      }
      // handle function interactivity events
      if (isFunctionInteractivityEvent(args)) {
        return this.runInteractivityHandlers(args);
      }
      // call the next middleware in the global middleware chain
      return args.next();
    };
  }

  public runHandler = async (args: AnyMiddlewareArgs & AllMiddlewareArgs): Promise<void> => {
    this.logger.debug('🚀 Executing my main handler:', this.handler);
    try {
      const handlerArgs = this.prepareFnArgs(args);
      await this.handler(handlerArgs);
    } catch (err) {
      this.logger.error('⚠️ Something went wrong executing:', this.handler, '\n⚠️ Error Details:', err);
    }
  };

  public runInteractivityHandlers = async (args: AnyMiddlewareArgs & AllMiddlewareArgs): Promise<void> => {
    const jobs: Promise<void>[] = [];
    for (let i = 0; i < this.interactivityHandlers.length; i += 1) {
      const { constraints, handler } = this.interactivityHandlers[i];
      if (passInteractivityConstraints(constraints, args)) {
        const handlerArgs = this.prepareFnArgs(args);

        // helpful logging
        this.logger.debug('🚀 Executing my interactive handler:', handler);
        this.logger.debug('🚀 Registered with constraints:', constraints);

        jobs.push(handler(handlerArgs));
      }
    }

    return new Promise<void>((resolve, reject) => {
      Promise.all(jobs).then((_) => resolve()).catch((error) => {
        const msg = `⚠️ A SlackFunction handler promise rejected. Error details: ${error}`;
        const err = new SlackFunctionExecutionError(msg);
        reject(err);
      });
    });
  };

  /**
   * Ensure that SlackFunction `complete()` utility callback is provided
   * as args to all function and interactivity handlers registered on
   * SlackFunction instance
   * @param args middleware arguments
   */
  private prepareFnArgs(args: AnyMiddlewareArgs & AllMiddlewareArgs): AllSlackFunctionExecutedMiddlewareArgs {
    const { next: _next, ...subArgs } = args;
    // eslint-disable-next-line
    const preparedArgs: any = { ...subArgs };
    // ensure all handlers have complete utility
    preparedArgs.complete = preparedArgs.complete ?? this.createComplete(preparedArgs);
    return preparedArgs;
  }

  /**
   * Creates a `complete()` utility function
   *
   * @param args
   * @returns A `complete()` utility callback
   * which can be accessed from any SlackFunction
   * handler and used to to complete your SlackFunction.
   *
   * ```
   * Example:
   * const handler = async ({ complete }) => { complete() };
   * const myFunc = new SlackFunction("id", handler);
   * ```
   */
  // eslint-disable-next-line
  private createComplete(args: any): CompleteFunction {
    const { payload, body, client } = args;

    // gets the function execution id from a function executed event
    let { function_execution_id } = payload;

    // gets the function execution id from the function data in a function interactivity event
    if (function_execution_id === undefined && body !== undefined && 'function_data' in body) {
      function_execution_id = body.function_data.execution_id;
    }

    // if stil undefined, error
    if (function_execution_id === undefined) {
      const msg = '⚠️ Cannot generate required complete utility without a function_execution_id';
      throw new SlackFunctionCompleteError(msg);
    }

    // return the utility callback
    return ({ outputs, error }: CompleteFunctionArgs = {}) => {
      // Slack API requires functions complete with either outputs or error, not both
      if (outputs && error) {
        throw new SlackFunctionCompleteError('⚠️ Cannot complete with outputs and error message supplied');
      }
      // if user has supplied outputs OR has supplied neither outputs nor error
      if (outputs !== undefined || (outputs === undefined && error === undefined)) {
        // helpful logging
        this.logger.debug('🚀 Attempting to complete with outputs:', outputs);
        return client.apiCall('functions.completeSuccess', {
          outputs: outputs ?? {},
          function_execution_id,
        });
      } if (error !== undefined) {
        this.logger.debug('🚀 Attempting to complete with error:', error);
        return client.apiCall('functions.completeError', {
          error,
          function_execution_id,
        });
      }
      return null;
    };
  }
}

/* Event handling validation */

export function isFunctionExecutedEvent(args: AnyMiddlewareArgs): boolean {
  if (args.payload === undefined || args.payload === null) {
    return false;
  }
  return (args.payload.type === 'function_executed');
}

export function isFunctionInteractivityEvent(args: AnyMiddlewareArgs & AllMiddlewareArgs): boolean {
  const allowedInteractivityTypes = [
    'block_actions', 'view_submission', 'view_closed'];
  if (args.body === undefined || args.body === null) return false;
  return (
    allowedInteractivityTypes.includes(args.body.type) &&
    ('function_data' in args.body)
  );
}

function passInteractivityConstraints(
  constraints: FunctionInteractivityConstraints,
  args: AnyMiddlewareArgs & AllMiddlewareArgs,
): boolean {
  const { payload, body } = args;

  if (!passConstraint('type', constraints, body)) return false;
  if (!passConstraint('block_id', constraints, payload)) return false;
  if (!passConstraint('action_id', constraints, payload)) return false;

  if ('callback_id' in constraints) {
    if ('view' in body) {
      if (!passConstraint('callback_id', constraints, body.view)) return false;
    } else {
      return false;
    }
  }
  return true;
}

export function passConstraint(
  constraintKey: Extract<(keyof ActionConstraints), string> | Extract<(keyof ViewConstraints), string>,
  constraints: FunctionInteractivityConstraints,
  // eslint-disable-next-line
  payload: any,
): boolean {
  let regExpMatches: RegExpMatchArray | null;
  let pass: boolean = true;

  // user provided constraint key, e.g. action_id
  if (constraintKey in constraints) {
    // event payload contains constraint key
    if (constraintKey in payload) {
      // eslint-disable-next-line
      // @ts-ignore - we ensure constraintKey exists in constraints above
      const constraintVal = constraints[constraintKey];
      if (typeof constraintVal === 'string') {
        if (constraintVal !== payload[constraintKey]) {
          pass = false;
        }
      } else {
        // treat constraintKey as regular expression and check payload for matches
        regExpMatches = payload[constraintKey].match(constraintVal);
        if (regExpMatches === null) {
          pass = false;
        }
      }
    } else {
      // user provided constraint, but payload doesn't contain key value
      pass = false;
    }
  }
  return pass;
}

// all tests to run
const validations = [hasCallbackId, hasMatchingManifestDefinition, hasHandler];

/* Initialization validators */
export function validate(callbackId: string, handler: Middleware<SlackEventMiddlewareArgs>): void {
  validations.forEach((test) => {
    const res = test(callbackId, handler);
    if (!res.pass) {
      throw new SlackFunctionInitializationError(res.msg);
    }
  });
}

export function errorIfInvalidConstraintKeys(
  constraints: FunctionInteractivityConstraints,
  validKeys: string[],
  handler: Middleware<SlackActionMiddlewareArgs> | Middleware<SlackViewMiddlewareArgs<SlackViewAction>>,
): void {
  const invalidKeys = Object.keys(constraints).filter(
    (key) => !validKeys.includes(key),
  );
  if (invalidKeys.length > 0) {
    const msg = `⚠️ You supplied invalid constraints: ${invalidKeys} for handler: ${handler}`;
    throw new SlackFunctionInitializationError(msg);
  }
}

export function hasCallbackId(callbackId: string, _?: Middleware<SlackEventMiddlewareArgs>): SlackFnValidateResult {
  const res: SlackFnValidateResult = { pass: true, msg: '' };
  if (
    callbackId === undefined ||
      typeof callbackId !== 'string' ||
      callbackId === ''
  ) {
    res.pass = false;
    res.msg = 'SlackFunction expects a callback_id string as its first argument';
  }
  return res;
}

export function hasMatchingManifestDefinition(
  callbackId: string,
  _?: Middleware<SlackEventMiddlewareArgs>,
): SlackFnValidateResult {
  const res: SlackFnValidateResult = { pass: true, msg: '' };
  const { matchFound, fnKeys } = findMatchingManifestDefinition(callbackId);
  if (!matchFound) {
    res.pass = false;
    res.msg = `Provided SlackFunction callback_id: "${callbackId}" does not have a matching manifest ` +
                'definition. Please check your manifest file.\n' +
                `Definitions we were able to find: ${fnKeys}`;
  }
  return res;
}

export function findMatchingManifestDefinition(callbackId: string): ManifestDefinitionResult {
  const result: ManifestDefinitionResult = { matchFound: false, fnKeys: [] };
  // call the hook to get the manifest
  const manifest = getManifestDataUtil.getManifestData(process.cwd());

  // manifest file must exist in the project
  if (!('functions' in manifest)) {
    const msg = '⚠️ Could not find functions in your project manifest.';
    throw new SlackFunctionInitializationError(msg);
  }

  try {
    // set the keys
    result.fnKeys = Object.keys(manifest.functions);
    result.matchFound = result.fnKeys.includes(callbackId);
  } catch (error) {
    throw new SlackFunctionInitializationError('Something went wrong when trying to read your manifest function definitions');
  }
  return result;
}

export function hasHandler(_: string, handler: Middleware<SlackEventMiddlewareArgs>): SlackFnValidateResult {
  const res: SlackFnValidateResult = { pass: true, msg: '' };
  if (handler === undefined) {
    res.pass = false;
    res.msg = 'You must provide a SlackFunction handler';
  }
  return res;
}
