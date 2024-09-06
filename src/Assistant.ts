/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebAPICallResult } from '@slack/web-api';
import processMiddleware from './middleware/process';
import { AllMiddlewareArgs, AnyMiddlewareArgs, Context, Middleware, SlackEventMiddlewareArgs } from './types';

export type AssistantThreadStartedMiddleware = Middleware<AssistantThreadStartedMiddlewareArgs>;
export type AssistantContextChangedMiddleware = Middleware<AssistantContextChangedMiddlewareArgs>;
// export type AssistantUserMessageMiddleware = Middleware<AssistantUserMessageMiddlewareArgs>;

export type AssistantMiddlewareArgs =
  | AssistantThreadStartedMiddlewareArgs
  | AssistantContextChangedMiddlewareArgs;
  // | AssistantUserMessageMiddlewareArgs;

export type AssistantMiddleware =
  | AssistantThreadStartedMiddleware[]
  | AssistantContextChangedMiddleware[];
  // | AssistantUserMessageMiddleware[];

export interface AssistantThreadStartedMiddlewareArgs extends SlackEventMiddlewareArgs<'assistant_thread_started'> {
  setStatus: SetStatusFn;
  setSuggestedPrompts: SetSuggestedPromptsFn;
  setTitle: SetTitleFn;
}

export interface AssistantContextChangedMiddlewareArgs extends SlackEventMiddlewareArgs<'assistant_thread_context_changed'> {
  setStatus: SetStatusFn;
  setSuggestedPrompts: SetSuggestedPromptsFn;
  setTitle: SetTitleFn;
}

// export interface AssistantUserMessageMiddlewareArgs extends SlackEventMiddlewareArgs<'message'> {
//   setStatus: SetStatusFn;
//   setSuggestedPrompts: SetSuggestedPromptsFn;
//   setTitle: SetTitleFn;
// }

export interface AssistantConfig {
  threadStarted: AssistantThreadStartedMiddleware | AssistantThreadStartedMiddleware[];
  contextChanged: AssistantContextChangedMiddleware | AssistantContextChangedMiddleware[];
  // userMessage: AssistantUserMessageMiddleware | AssistantUserMessageMiddleware[];
}

export type AllAssistantMiddlewareArgs<T extends AssistantMiddlewareArgs = AssistantMiddlewareArgs> =
  T & AllMiddlewareArgs;

export interface SetStatusArguments {
  status: string;
}

export interface SetSuggestedPromptsArguments {
  prompts: {
    title: string;
    message: string;
  }[];
  title?: string;
}

export interface SetTitleArguments {
  title: string;
}

export interface SetStatusFn {
  // (params: SetStatusArguments): Promise<AssistantSetStatusResponse>;
  (params: SetStatusArguments): Promise<WebAPICallResult>;
}
export interface SetSuggestedPromptsFn {
  // (params: SetSuggestedPromptsArguments): Promise<AssistantSetSuggestedPromptsResponse>;
  (params: SetSuggestedPromptsArguments): Promise<WebAPICallResult>;
}
export interface SetTitleFn {
  // (params: SetTitleArguments): Promise<AssistantSetTitleResponse>;
  (params: SetTitleArguments): Promise<WebAPICallResult>;
}
/** Constants */

const VALID_PAYLOAD_TYPES = new Set(['assistant_thread_started', 'assistant_thread_context_changed', 'message']);

export default class Assistant {
  /** 'assistant_thread_started' */
  private threadStarted: AssistantThreadStartedMiddleware[];

  /** 'assistant_thread_context_changed' */
  private contextChanged: AssistantContextChangedMiddleware[];

  /** 'assistant_thread_started' */
  // private userMessage: AssistantUserMessageMiddleware[];

  public constructor(config: AssistantConfig) {
    // validate(config);

    const { threadStarted, contextChanged } = config;

    this.threadStarted = Array.isArray(threadStarted) ? threadStarted : [threadStarted];
    this.contextChanged = Array.isArray(contextChanged) ? contextChanged : [contextChanged];
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
    console.log('in processEvent (args) => ', args);
    const assistantArgs = prepareAssistantArgs(args);
    const assistantMiddleware = this.getAssistantMiddleware(payload);
    return processAssistantMiddleware(assistantArgs, assistantMiddleware);
  }

  private getAssistantMiddleware(payload: AllAssistantMiddlewareArgs['payload']): AssistantMiddleware {
    switch (payload.type) {
      case 'assistant_thread_started':
        return this.threadStarted;
      case 'assistant_thread_context_changed':
        return this.contextChanged;
      // case 'message':
      //   return this.userMessage;
      default:
        return [];
    }
  }
}

export function isAssistantEvent(args: AnyMiddlewareArgs): args is AllAssistantMiddlewareArgs {
  return VALID_PAYLOAD_TYPES.has(args.payload.type);
}

// function matchesConstraints(): boolean {
// function matchesConstraints(args: AssistantMiddlewareArgs): boolean {
//   if (args.payload.type === 'message') {
//     return (args.payload.channel_type === 'im') &&
//     (!args.payload.subtype || args.payload.subtype === 'file_share');
//   }
//   return false;
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
      preparedArgs.thread = assistantArgs.assistant_thread;
      preparedArgs.setTitle = createSetTitle(preparedArgs);
      preparedArgs.setSuggestedPrompts = createSetSuggestedPrompts(preparedArgs);
      preparedArgs.setStatus = createSetStatus(preparedArgs);
      break;
    case 'assistant_thread_context_changed':
      preparedArgs.thread = assistantArgs.assistant_thread;
      preparedArgs.setTitle = createSetTitle(preparedArgs);
      preparedArgs.setSuggestedPrompts = createSetSuggestedPrompts(preparedArgs);
      preparedArgs.setStatus = createSetStatus(preparedArgs);
      break;
    // case 'message':
    //   break;
    default:
      break;
  }

  return preparedArgs;
}

/**
 * `processAssistantMiddleware()` invokes each callback for lifecycle event
 * @param args assistant_thread_started, assistant_thread_context_changed events
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

function selectToken(context: Context): string | undefined {
  return context.botToken !== undefined ? context.botToken : context.userToken;
}

/**
 * Factory for `setStatus()` utility
 * @param args assistant_thread_started, assistant_thread_context_changed events
 */
function createSetStatus(args: AllAssistantMiddlewareArgs): SetStatusFn {
  const {
    context,
    client,
    payload: {
      assistant_thread: { channel_id, thread_ts },
    },
  } = args;
  const token = selectToken(context);

  return (params: Parameters<SetStatusFn>[0]) => {
    const { status } = params;
    return client.assistant.threads.setStatus({
      token,
      channel_id,
      status,
      thread_ts,
    });
  };
}

/**
 * Factory for `setSuggestedPrompts()` utility
 * @param args assistant_thread_started, assistant_thread_context_changed events
 */
function createSetSuggestedPrompts(args: AllAssistantMiddlewareArgs): SetSuggestedPromptsFn {
  const {
    context,
    client,
    payload: {
      assistant_thread: { user_id, thread_ts },
    },
  } = args;
  const token = selectToken(context);

  return (params: Parameters<SetSuggestedPromptsFn>[0]) => {
    const { prompts, title = '' } = params; // TODO :: conditionally pass title
    return client.assistant.threads.setSuggestedPrompts({
      token,
      channel_id: user_id,
      prompts,
      title,
      thread_ts,
    });
  };
}

/**
 * Factory for `setTitle()` utility
 * @param args assistant_thread_started, assistant_thread_context_changed events
 */
function createSetTitle(args: AllAssistantMiddlewareArgs): SetTitleFn {
  const {
    context,
    client,
    payload: {
      assistant_thread: { channel_id, thread_ts },
    },
  } = args;
  const token = selectToken(context);

  return (params: Parameters<SetTitleFn>[0]) => {
    const { title } = params;
    return client.assistant.threads.setTitle({
      token,
      channel_id,
      title,
      thread_ts,
    });
  };
}
