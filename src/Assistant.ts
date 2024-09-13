/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatPostMessageArguments, WebAPICallResult } from '@slack/web-api';
import processMiddleware from './middleware/process';
import { AllMiddlewareArgs, AnyMiddlewareArgs, Context, Middleware, SayFn, SlackEventMiddlewareArgs } from './types';
import { AssistantInitializationError } from './errors';

export type AssistantThreadStartedMiddleware = Middleware<AssistantThreadStartedMiddlewareArgs>;
export type AssistantThreadContextChangedMiddleware = Middleware<AssistantThreadContextChangedMiddlewareArgs>;
export type AssistantUserMessageMiddleware = Middleware<AssistantUserMessageMiddlewareArgs>;

export type AssistantMiddleware =
  | AssistantThreadStartedMiddleware[]
  | AssistantThreadContextChangedMiddleware[]
  | AssistantUserMessageMiddleware[];

export type AssistantMiddlewareArgs =
  | AssistantThreadStartedMiddlewareArgs
  | AssistantThreadContextChangedMiddlewareArgs
  | AssistantUserMessageMiddlewareArgs;

// Configuration object used to instantiate the Assistant
export interface AssistantConfig {
  threadStarted: AssistantThreadStartedMiddleware | AssistantThreadStartedMiddleware[];
  threadContextChanged: AssistantThreadContextChangedMiddleware | AssistantThreadContextChangedMiddleware[];
  userMessage: AssistantUserMessageMiddleware | AssistantUserMessageMiddleware[];
}

// Utility functions
export interface SetStatusFn {
  // (params: SetStatusArguments): Promise<AssistantSetStatusResponse>;
  (params: SetStatusArguments): Promise<WebAPICallResult>;
}

export interface SetStatusArguments {
  status: string;
}

export interface SetSuggestedPromptsFn {
  // (params: SetSuggestedPromptsArguments): Promise<AssistantSetSuggestedPromptsResponse>;
  (params: SetSuggestedPromptsArguments): Promise<WebAPICallResult>;
}

export interface SetSuggestedPromptsArguments {
  prompts: {
    title: string;
    message: string;
  }[];
  title?: string;
}
export interface SetTitleFn {
  // (params: SetTitleArguments): Promise<AssistantSetTitleResponse>;
  (params: SetTitleArguments): Promise<WebAPICallResult>;
}

export interface SetTitleArguments {
  title: string;
}

interface AssistantUtilityArgs {
  say: SayFn;
  setStatus: SetStatusFn;
  setSuggestedPrompts: SetSuggestedPromptsFn;
  setTitle: SetTitleFn;
}

export interface AssistantThreadStartedMiddlewareArgs extends
  Omit<SlackEventMiddlewareArgs<'assistant_thread_started'>, 'say'>, AssistantUtilityArgs {}
export interface AssistantThreadContextChangedMiddlewareArgs extends
  Omit<SlackEventMiddlewareArgs<'assistant_thread_context_changed'>, 'say'>, AssistantUtilityArgs {}
export interface AssistantUserMessageMiddlewareArgs extends
  Omit<SlackEventMiddlewareArgs, 'say'>, AssistantUtilityArgs {}

export type AllAssistantMiddlewareArgs<T extends AssistantMiddlewareArgs = AssistantMiddlewareArgs> =
T & AllMiddlewareArgs;

/** Constants */
const ASSISTANT_PAYLOAD_TYPES = new Set(['assistant_thread_started', 'assistant_thread_context_changed', 'message']);

export class Assistant {
  /** 'assistant_thread_started' */
  private threadStarted: AssistantThreadStartedMiddleware[];

  /** 'assistant_thread_context_changed' */
  private threadContextChanged: AssistantThreadContextChangedMiddleware[];

  /** 'message' */
  private userMessage: AssistantUserMessageMiddleware[];

  public constructor(config: AssistantConfig) {
    validate(config);

    const { threadStarted, threadContextChanged, userMessage } = config;

    this.threadStarted = Array.isArray(threadStarted) ? threadStarted : [threadStarted];
    this.threadContextChanged = Array.isArray(threadContextChanged) ? threadContextChanged : [threadContextChanged];
    this.userMessage = Array.isArray(userMessage) ? userMessage : [userMessage];
  }

  public getMiddleware(): Middleware<AnyMiddlewareArgs> {
    return async (args): Promise<any> => {
      if (isAssistantEvent(args) && matchesConstraints(args)) {
        return this.processEvent(args);
      }
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
      case 'assistant_thread_context_changed':
        return this.threadContextChanged;
      case 'message':
        return this.userMessage;
      default:
        return [];
    }
  }
}

export function isAssistantEvent(args: AnyMiddlewareArgs): boolean {
  return ASSISTANT_PAYLOAD_TYPES.has(args.payload.type);
}

function matchesConstraints(args: AnyMiddlewareArgs): args is AllAssistantMiddlewareArgs {
  if (args.payload.type === 'message') {
    const isThreadMessage = 'channel' in args.payload && 'thread_ts' in args.payload;
    const inAssistantContainer = ('channel_type' in args.payload && args.payload.channel_type === 'im') &&
    (!('subtype' in args.payload) || args.payload.subtype === 'file_share');
    return isThreadMessage && inAssistantContainer;
  }
  return true;
}

export function validate(config: AssistantConfig): void {
  // Ensure assistant config object is passed in
  if (typeof config !== 'object') {
    const errorMsg = 'Assistant expects a configuration object as the argument';
    throw new AssistantInitializationError(errorMsg);
  }

  // Check for missing required keys
  const requiredKeys: (keyof AssistantConfig)[] = ['threadStarted', 'threadContextChanged', 'userMessage'];
  const missingKeys: (keyof AssistantConfig)[] = [];
  requiredKeys.forEach((key) => { if (config[key] === undefined) missingKeys.push(key); });

  if (missingKeys.length > 0) {
    const errorMsg = `Assistant is missing required keys: ${missingKeys.join(', ')}`;
    throw new AssistantInitializationError(errorMsg);
  }

  // Ensure a callback or an array of callbacks is present
  const requiredFns: (keyof AssistantConfig)[] = ['threadStarted', 'threadContextChanged', 'userMessage'];
  requiredFns.forEach((fn) => {
    if (typeof config[fn] !== 'function' && !Array.isArray(config[fn])) {
      const errorMsg = `Assistant ${fn} property must be a function or an array of functions`;
      throw new AssistantInitializationError(errorMsg);
    }
  });
}

/**
 * `prepareAssistantArgs()` takes in an assistant's args and:
 *  1. removes the next() passed in from App-level middleware processing
 *    - events will *not* continue down global middleware chain to subsequent listeners
 *  2. augments args with assistant-specific properties/utilities
 * */
export function prepareAssistantArgs(args: any): AllAssistantMiddlewareArgs {
  const { next: _next, ...assistantArgs } = args;
  const preparedArgs: AllAssistantMiddlewareArgs = { ...assistantArgs };

  preparedArgs.say = createSay(preparedArgs);
  preparedArgs.setStatus = createSetStatus(preparedArgs);
  preparedArgs.setSuggestedPrompts = createSetSuggestedPrompts(preparedArgs);
  preparedArgs.setTitle = createSetTitle(preparedArgs);

  return preparedArgs;
}

/**
 * `processAssistantMiddleware()` invokes each callback for event
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

// Utility functions

/**
 * Factory for `say()` utility
 */
function createSay(args: AllAssistantMiddlewareArgs): SayFn {
  const {
    context,
    client,
    payload,
  } = args;
  const token = selectToken(context);
  const { channelId: channel, threadTs: thread_ts } = extractThreadInfo(payload);

  return (message: Parameters<SayFn>[0]) => {
    const postMessageArgument: ChatPostMessageArguments = typeof message === 'string' ?
      { token, text: message, channel, thread_ts } :
      { ...message, token, channel, thread_ts };

    return client.chat.postMessage(postMessageArgument);
  };
}

/**
 * Factory for `setStatus()` utility
 */
function createSetStatus(args: AllAssistantMiddlewareArgs): SetStatusFn {
  const {
    context,
    client,
    payload,
  } = args;
  const token = selectToken(context);
  const { channelId: channel_id, threadTs: thread_ts } = extractThreadInfo(payload);

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
 */
function createSetSuggestedPrompts(args: AllAssistantMiddlewareArgs): SetSuggestedPromptsFn {
  const {
    context,
    client,
    payload,
  } = args;
  const token = selectToken(context);
  const { channelId: channel_id, threadTs: thread_ts } = extractThreadInfo(payload);

  return (params: Parameters<SetSuggestedPromptsFn>[0]) => {
    const { prompts, title = '' } = params; // TODO :: conditionally pass title
    return client.assistant.threads.setSuggestedPrompts({
      token,
      channel_id,
      prompts,
      title,
      thread_ts,
    });
  };
}

/**
 * Factory for `setTitle()` utility
 */
function createSetTitle(args: AllAssistantMiddlewareArgs): SetTitleFn {
  const {
    context,
    client,
    payload,
  } = args;
  const token = selectToken(context);
  const { channelId: channel_id, threadTs: thread_ts } = extractThreadInfo(payload);

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

function extractThreadInfo(payload: AllAssistantMiddlewareArgs['payload']) {
  let channelId: string;
  let threadTs: string;

  if ('assistant_thread' in payload) {
    channelId = payload.assistant_thread.channel_id;
    threadTs = payload.assistant_thread.thread_ts;
  } else { // message
    channelId = payload.channel;
    threadTs = payload.thread_ts;
  }

  return { channelId, threadTs };
}
