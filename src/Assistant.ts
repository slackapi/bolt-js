/* eslint-disable @typescript-eslint/no-explicit-any */
import processMiddleware from './middleware/process';
import { AllMiddlewareArgs, AnyMiddlewareArgs, Middleware, SlackEventMiddlewareArgs } from './types';

export type AssistantThreadStartedMiddleware = Middleware<AssistantThreadStartedMiddlewareArgs>;
// export type AssistantContextChangedMiddleware = Middleware<AssistantContextChangedMiddlewareArgs>;
// export type AssistantUserMessageMiddleware = Middleware<AssistantUserMessageMiddlewareArgs>;

export type AssistantMiddlewareArgs =
  | AssistantThreadStartedMiddlewareArgs;
  // | AssistantContextChangedMiddlewareArgs
  // | AssistantUserMessageMiddlewareArgs;

export type AssistantMiddleware =
  | AssistantThreadStartedMiddleware[];
  // | AssistantContextChangedMiddleware[]
  // | AssistantUserMessageMiddleware[];

export interface AssistantThreadStartedMiddlewareArgs extends SlackEventMiddlewareArgs<'assistant_thread_started'> {
  assistant: Assistant;
}

// export interface AssistantContextChangedMiddlewareArgs extends SlackEventMiddlewareArgs<'assistant_context_changed'> {
//   assistant: Assistant;
// }

// export interface AssistantUserMessageMiddlewareArgs extends ?? {
//   assistant: Assistant;
// }

export interface AssistantConfig {
  threadStarted: AssistantThreadStartedMiddleware | AssistantThreadStartedMiddleware[];
  // contextChanged: AssistantContextChangedMiddleware | AssistantContextChangedMiddleware[];
  // userMessage: AssistantUserMessageMiddleware | AssistantUserMessageMiddleware[];
}

export type AllAssistantMiddlewareArgs<T extends AssistantMiddlewareArgs = AssistantMiddlewareArgs> =
  T & AllMiddlewareArgs;

/** Constants */

// TODO :: find missing payload type for user message with subtype
const VALID_PAYLOAD_TYPES = new Set(['assistant_thread_started', 'assistant_thread_context_changed', 'message']);

export default class Assistant {
  /** 'assistant_thread_started' */
  private threadStarted: AssistantThreadStartedMiddleware[];

  /** 'assistant_thread_context_changed' */
  // private contextChanged: AssistantContextChangedMiddleware[];

  /** 'assistant_thread_started' */
  // private userMessage: AssistantUserMessageMiddleware[];

  public constructor(config: AssistantConfig) {
    // validate(config);

    const { threadStarted } = config;

    this.threadStarted = Array.isArray(threadStarted) ? threadStarted : [threadStarted];
    // this.contextChanged = Array.isArray(contextChanged) ? contextChanged : [contextChanged];
    // this.userMessage = Array.isArray(userMessage) ? userMessage : [userMessage];
  }

  public getMiddleware(): Middleware<AnyMiddlewareArgs> {
    return async (args): Promise<any> => {
      if (isAssistantEvent(args)) return this.processEvent(args);
      return args.next();
    };
  }

  private async processEvent(args: AllAssistantMiddlewareArgs): Promise<void> {
    const { payload } = args;
    const assistantArgs = prepareAssistantArgs(args);
    const assistantMiddleware = this.getAssistantMiddleware(payload);
    return processAssistantMiddleware(assistantArgs, assistantMiddleware);
  }

  private getAssistantMiddleware(payload: AllAssistantMiddlewareArgs['payload']): AssistantMiddleware {
    switch (payload.type) {
      case 'assistant_thread_started':
        return this.threadStarted;
      // case 'assistant_thread_context_changed':
      //   return this.contextChanged;
      default:
        return [];
    }
  }
}

export function isAssistantEvent(args: AnyMiddlewareArgs): args is AllAssistantMiddlewareArgs {
  return VALID_PAYLOAD_TYPES.has(args.payload.type);
}

// function matchesConstraints(args: AssistantMiddlewareArgs): boolean {
//   if (args.payload.type === 'message') {}
// }

/**
 * `prepareAssistantArgs()` takes in a step's args and:
 *  1. removes the next() passed in from App-level middleware processing
 *    - events will *not* continue down global middleware chain to subsequent listeners
 *  2. augments args with step lifecycle-specific properties/utilities
 * */
export function prepareAssistantArgs(args: any): AllAssistantMiddlewareArgs {
  const { next: _next, ...assistantArgs } = args;
  const preparedArgs: any = { ...assistantArgs };

  switch (preparedArgs.payload.type) {
    case 'assistant_thread_started':
      preparedArgs.assistant = {
        ...assistantArgs.assistant,
        setStatus: async () => { console.log('setStatus called'); },
        setSuggestedPrompts: async () => { console.log('setSuggestedPrompts called'); },
        setTitle: async () => { console.log('setTitle called'); },
      };
      break;
    // case 'assistant_thread_context_changed':
    //   preparedArgs.assistant = {}
    //   break;
    // case 'message':
    //   preparedArgs.assistant = {}
    //   break;
    default:
      break;
  }

  return preparedArgs;
}

/**
 * `processAssistantMiddleware()` invokes each callback for lifecycle event
 * @param args workflow_step_edit action
 */
export async function processAssistantMiddleware(
  args: AllAssistantMiddlewareArgs,
  middleware: AssistantMiddleware,
): Promise<void> {
  const { context, client, logger } = args;
  const callbacks = [...middleware] as Middleware<AnyMiddlewareArgs>[];
  const lastCallback = callbacks.pop();

  if (lastCallback !== undefined) {
    await processMiddleware(
      callbacks, args, context, client, logger,
      async () => lastCallback({ ...args, context, client, logger }),
    );
  }
}
