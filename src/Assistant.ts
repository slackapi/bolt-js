import {
  AssistantThreadsSetStatusResponse,
  AssistantThreadsSetSuggestedPromptsResponse,
  AssistantThreadsSetTitleResponse,
  ChatPostMessageArguments,
} from '@slack/web-api';
import processMiddleware from './middleware/process';
import {
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  Context,
  Middleware,
  SayFn,
  SlackEventMiddlewareArgs,
} from './types';
import { AssistantInitializationError, AssistantMissingPropertyError } from './errors';
import { AssistantThreadContext, AssistantThreadContextStore, DefaultThreadContextStore } from './AssistantThreadContextStore';

/**
 * Configuration object used to instantiate the Assistant
 */
export interface AssistantConfig {
  threadContextStore?: AssistantThreadContextStore;
  threadStarted: AssistantThreadStartedMiddleware | AssistantThreadStartedMiddleware[];
  threadContextChanged?: AssistantThreadContextChangedMiddleware | AssistantThreadContextChangedMiddleware[];
  userMessage: AssistantUserMessageMiddleware | AssistantUserMessageMiddleware[];
}

/**
 * Callback utilities
 */
interface AssistantUtilityArgs {
  getThreadContext: GetThreadContextFn;
  saveThreadContext: SaveThreadContextFn;
  say: SayFn;
  setStatus: SetStatusFn;
  setSuggestedPrompts: SetSuggestedPromptsFn;
  setTitle: SetTitleFn;
}

export interface GetThreadContextFn {
  (args: AllAssistantMiddlewareArgs): Promise<AssistantThreadContext>;
}

export interface SaveThreadContextFn {
  (args: AllAssistantMiddlewareArgs): Promise<void>;
}

export interface SetStatusFn {
  (status: string): Promise<AssistantThreadsSetStatusResponse>;
}

export interface SetSuggestedPromptsFn {
  (params: SetSuggestedPromptsArguments): Promise<AssistantThreadsSetSuggestedPromptsResponse>;
}

export interface SetSuggestedPromptsArguments {
  prompts: [AssistantPrompt, ...AssistantPrompt[]];
}

interface AssistantPrompt {
  title: string;
  message: string;
}

export interface SetTitleFn {
  (title: string): Promise<AssistantThreadsSetTitleResponse>;
}

/**
 * Middleware
 */
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
  private threadContextStore: AssistantThreadContextStore;

  /** 'assistant_thread_started' */
  private threadStarted: AssistantThreadStartedMiddleware[];

  /** 'assistant_thread_context_changed' */
  private threadContextChanged: AssistantThreadContextChangedMiddleware[];

  /** 'message' */
  private userMessage: AssistantUserMessageMiddleware[];

  public constructor(config: AssistantConfig) {
    validate(config);

    const {
      threadContextStore = new DefaultThreadContextStore(),
      threadStarted,
      threadContextChanged = threadContextStore.save,
      userMessage,
    } = config;

    this.threadContextStore = threadContextStore;
    this.threadStarted = Array.isArray(threadStarted) ? threadStarted : [threadStarted];
    this.threadContextChanged = Array.isArray(threadContextChanged) ? threadContextChanged : [threadContextChanged];
    this.userMessage = Array.isArray(userMessage) ? userMessage : [userMessage];
  }

  public getMiddleware(): Middleware<AnyMiddlewareArgs> {
    return async (args): Promise<any> => {
      if (isAssistantEvent(args) && matchesConstraints(args)) return this.processEvent(args);
      return args.next();
    };
  }

  private async processEvent(args: AllAssistantMiddlewareArgs): Promise<void> {
    const { payload } = args;
    const assistantArgs = this.prepareAssistantArgs(args);
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

  /**
 * `prepareAssistantArgs()` takes in an assistant's args and:
 *  1. removes the next() passed in from App-level middleware processing
 *    - events will *not* continue down global middleware chain to subsequent listeners
 *  2. augments args with assistant-specific properties/utilities
 * */
  private prepareAssistantArgs(args: any): AllAssistantMiddlewareArgs {
    const { next: _next, ...assistantArgs } = args;
    const preparedArgs: AllAssistantMiddlewareArgs = { ...assistantArgs };

    preparedArgs.getThreadContext = () => this.threadContextStore.get(preparedArgs);
    preparedArgs.saveThreadContext = () => this.threadContextStore.save(preparedArgs);
    preparedArgs.say = createSay(preparedArgs);
    preparedArgs.setStatus = createSetStatus(preparedArgs);
    preparedArgs.setSuggestedPrompts = createSetSuggestedPrompts(preparedArgs);
    preparedArgs.setTitle = createSetTitle(preparedArgs);

    return preparedArgs;
  }
}

export function isAssistantEvent(args: AnyMiddlewareArgs): boolean {
  return ASSISTANT_PAYLOAD_TYPES.has(args.payload.type);
}

export function matchesConstraints(args: AnyMiddlewareArgs): args is AllAssistantMiddlewareArgs {
  return args.payload.type === 'message' ? isAssistantMessage(args.payload) : true;
}

export function isAssistantMessage(payload: AnyMiddlewareArgs['payload']): boolean {
  const isThreadMessage = 'channel' in payload && 'thread_ts' in payload;
  const inAssistantContainer = ('channel_type' in payload && payload.channel_type === 'im') &&
  (!('subtype' in payload) || payload.subtype === 'file_share');
  return isThreadMessage && inAssistantContainer;
}

export function validate(config: AssistantConfig): void {
  // Ensure assistant config object is passed in
  if (typeof config !== 'object') {
    const errorMsg = 'Assistant expects a configuration object as the argument';
    throw new AssistantInitializationError(errorMsg);
  }

  // Check for missing required keys
  const requiredKeys: (keyof AssistantConfig)[] = ['threadStarted', 'userMessage'];
  const missingKeys: (keyof AssistantConfig)[] = [];
  requiredKeys.forEach((key) => { if (config[key] === undefined) missingKeys.push(key); });

  if (missingKeys.length > 0) {
    const errorMsg = `Assistant is missing required keys: ${missingKeys.join(', ')}`;
    throw new AssistantInitializationError(errorMsg);
  }

  // Ensure a callback or an array of callbacks is present
  const requiredFns: (keyof AssistantConfig)[] = ['threadStarted', 'userMessage'];
  requiredFns.forEach((fn) => {
    if (typeof config[fn] !== 'function' && !Array.isArray(config[fn])) {
      const errorMsg = `Assistant ${fn} property must be a function or an array of functions`;
      throw new AssistantInitializationError(errorMsg);
    }
  });
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

/**
 * Utility functions
 */

// Factory for `say()` utility
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

// Factory for `setStatus()` utility
function createSetStatus(args: AllAssistantMiddlewareArgs): SetStatusFn {
  const {
    context,
    client,
    payload,
  } = args;
  const token = selectToken(context);
  const { channelId: channel_id, threadTs: thread_ts } = extractThreadInfo(payload);

  return (status: Parameters<SetStatusFn>[0]) => client.assistant.threads.setStatus({
    token,
    channel_id,
    thread_ts,
    status,
  });
}

// Factory for `setSuggestedPrompts()` utility
function createSetSuggestedPrompts(args: AllAssistantMiddlewareArgs): SetSuggestedPromptsFn {
  const {
    context,
    client,
    payload,
  } = args;
  const token = selectToken(context);
  const { channelId: channel_id, threadTs: thread_ts } = extractThreadInfo(payload);

  return (params: Parameters<SetSuggestedPromptsFn>[0]) => {
    const { prompts } = params;
    return client.assistant.threads.setSuggestedPrompts({
      token,
      channel_id,
      thread_ts,
      prompts,
    });
  };
}

// Factory for `setTitle()` utility
function createSetTitle(args: AllAssistantMiddlewareArgs): SetTitleFn {
  const {
    context,
    client,
    payload,
  } = args;
  const token = selectToken(context);
  const { channelId: channel_id, threadTs: thread_ts } = extractThreadInfo(payload);

  return (title: Parameters<SetTitleFn>[0]) => client.assistant.threads.setTitle({
    token,
    channel_id,
    thread_ts,
    title,
  });
}

export function extractThreadInfo(payload: AllAssistantMiddlewareArgs['payload']): { channelId: string, threadTs: string, context: AssistantThreadContext } {
  let channelId: string = '';
  let threadTs: string = '';
  let context: AssistantThreadContext = {};

  // assistant_thread_started, asssistant_thread_context_changed
  if ('assistant_thread' in payload) {
    channelId = payload.assistant_thread.channel_id;
    threadTs = payload.assistant_thread.thread_ts;
    context = payload.assistant_thread.context;
  }

  // user message in thread
  if ('channel' in payload && 'thread_ts' in payload && payload.thread_ts !== undefined) {
    channelId = payload.channel;
    threadTs = payload.thread_ts;
  }

  // throw error if `channel` or `thread_ts` are missing
  if (!channelId || !threadTs) {
    const missingProps: string[] = [];
    [channelId, threadTs].forEach((key) => { if (key) missingProps.push(key); });
    if (missingProps.length > 0) {
      const errorMsg = `Assistant message event is missing required properties: ${missingProps.join(', ')}`;
      throw new AssistantMissingPropertyError(errorMsg);
    }
  }

  return { channelId, threadTs, context };
}
