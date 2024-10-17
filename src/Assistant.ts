import type {
  AssistantThreadsSetStatusResponse,
  AssistantThreadsSetSuggestedPromptsResponse,
  AssistantThreadsSetTitleResponse,
  ChatPostMessageArguments,
} from '@slack/web-api';
import {
  type AssistantThreadContext,
  type AssistantThreadContextStore,
  DefaultThreadContextStore,
  type GetThreadContextFn,
  type SaveThreadContextFn,
} from './AssistantThreadContextStore';
import { AssistantInitializationError, AssistantMissingPropertyError } from './errors';
import processMiddleware from './middleware/process';
import type { AllMiddlewareArgs, AnyMiddlewareArgs, Middleware, SayFn, SlackEventMiddlewareArgs } from './types';

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

type SetStatusFn = (status: string) => Promise<AssistantThreadsSetStatusResponse>;

type SetSuggestedPromptsFn = (
  params: SetSuggestedPromptsArguments,
) => Promise<AssistantThreadsSetSuggestedPromptsResponse>;

interface SetSuggestedPromptsArguments {
  prompts: [AssistantPrompt, ...AssistantPrompt[]];
}

interface AssistantPrompt {
  title: string;
  message: string;
}

type SetTitleFn = (title: string) => Promise<AssistantThreadsSetTitleResponse>;

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

// TODO: revisit Omit of `say`, as it's added on as part of the enrichment step
export interface AssistantThreadStartedMiddlewareArgs
  extends Omit<SlackEventMiddlewareArgs<'assistant_thread_started'>, 'say'>,
  AssistantUtilityArgs { }
export interface AssistantThreadContextChangedMiddlewareArgs
  extends Omit<SlackEventMiddlewareArgs<'assistant_thread_context_changed'>, 'say'>,
  AssistantUtilityArgs { }
// TODO: extending from SlackEventMiddlewareArgs<'message'> likely insufficient as not all message event payloads contain thread_ts - whereas assistant user message events do. Likely need to narrow this down further.
export interface AssistantUserMessageMiddlewareArgs
  extends Omit<SlackEventMiddlewareArgs<'message'>, 'say'>,
  AssistantUtilityArgs { }

export type AllAssistantMiddlewareArgs<T extends AssistantMiddlewareArgs = AssistantMiddlewareArgs> = T &
  AllMiddlewareArgs;

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
      // When `threadContextChanged` method is not provided, fallback to
      // AssistantContextStore's save method. If a custom store has also not
      // been provided, the default save context-via-metadata approach is used.
      // See DefaultThreadContextStore for details of this implementation.
      threadContextChanged = (args) => threadContextStore.save(args),
      userMessage,
    } = config;

    this.threadContextStore = threadContextStore;
    this.threadStarted = Array.isArray(threadStarted) ? threadStarted : [threadStarted];
    this.threadContextChanged = Array.isArray(threadContextChanged) ? threadContextChanged : [threadContextChanged];
    this.userMessage = Array.isArray(userMessage) ? userMessage : [userMessage];
  }

  public getMiddleware(): Middleware<AnyMiddlewareArgs> {
    return async (args): Promise<void> => {
      if (isAssistantEvent(args) && matchesConstraints(args)) {
        return this.processEvent(args);
      }
      return args.next();
    };
  }

  private async processEvent(args: AllAssistantMiddlewareArgs): Promise<void> {
    const { payload } = args;
    const assistantArgs = enrichAssistantArgs(this.threadContextStore, args);
    const assistantMiddleware = this.getAssistantMiddleware(payload);
    return processAssistantMiddleware(assistantArgs, assistantMiddleware);
  }

  /**
   * `getAssistantMiddleware()` returns the Assistant instance's middleware
   */
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

/**
 * `enrichAssistantArgs()` takes the event arguments and:
 *  1. Removes the next() passed in from App-level middleware processing, thus preventing
 *  events from continuing down the global middleware chain to subsequent listeners
 *  2. Adds assistant-specific utilities (i.e., helper methods)
 * */
export function enrichAssistantArgs(
  threadContextStore: AssistantThreadContextStore,
  args: AllAssistantMiddlewareArgs<AssistantMiddlewareArgs>, // TODO: the type here states that these args already have the assistant utilities present? the type here needs likely changing.
): AllAssistantMiddlewareArgs {
  const { next: _next, ...assistantArgs } = args;
  const preparedArgs = { ...(assistantArgs as Exclude<AllAssistantMiddlewareArgs<AssistantMiddlewareArgs>, 'next'>) };

  // Do not pass preparedArgs (ie, do not add utilities to get/save)
  preparedArgs.getThreadContext = () => threadContextStore.get(args);
  preparedArgs.saveThreadContext = () => threadContextStore.save(args);

  preparedArgs.say = createSay(preparedArgs);
  preparedArgs.setStatus = createSetStatus(preparedArgs);
  preparedArgs.setSuggestedPrompts = createSetSuggestedPrompts(preparedArgs);
  preparedArgs.setTitle = createSetTitle(preparedArgs);
  return preparedArgs;
}

/**
 * `isAssistantEvent()` determines if incoming event is a supported
 * Assistant event type.
 */
export function isAssistantEvent(args: AnyMiddlewareArgs): args is AllAssistantMiddlewareArgs {
  return ASSISTANT_PAYLOAD_TYPES.has(args.payload.type);
}

/**
 * `matchesConstraints()` determines if the incoming event payload
 * is related to the Assistant.
 */
export function matchesConstraints(args: AssistantMiddlewareArgs): args is AssistantMiddlewareArgs {
  return args.payload.type === 'message' ? isAssistantMessage(args.payload) : true;
}

/**
 * `isAssistantMessage()` evaluates if the message payload is associated
 * with the Assistant container.
 */
export function isAssistantMessage(payload: AnyMiddlewareArgs['payload']): boolean {
  const isThreadMessage = 'channel' in payload && 'thread_ts' in payload;
  const inAssistantContainer =
    'channel_type' in payload &&
    payload.channel_type === 'im' &&
    (!('subtype' in payload) || payload.subtype === 'file_share' || payload.subtype === undefined); // TODO: undefined subtype is a limitation of message event, needs fixing (see https://github.com/slackapi/node-slack-sdk/issues/1904)
  return isThreadMessage && inAssistantContainer;
}

/**
 * `validate()` determines if the provided AssistantConfig is a valid configuration.
 */
export function validate(config: AssistantConfig): void {
  // Ensure assistant config object is passed in
  if (typeof config !== 'object') {
    const errorMsg = 'Assistant expects a configuration object as the argument';
    throw new AssistantInitializationError(errorMsg);
  }

  // Check for missing required keys
  const requiredKeys: (keyof AssistantConfig)[] = ['threadStarted', 'userMessage'];
  const missingKeys: (keyof AssistantConfig)[] = [];
  for (const key of requiredKeys) {
    if (config[key] === undefined) missingKeys.push(key);
  }

  if (missingKeys.length > 0) {
    const errorMsg = `Assistant is missing required keys: ${missingKeys.join(', ')}`;
    throw new AssistantInitializationError(errorMsg);
  }

  // Ensure a callback or an array of callbacks is present
  const requiredFns: (keyof AssistantConfig)[] = ['threadStarted', 'userMessage'];
  if ('threadContextChanged' in config) requiredFns.push('threadContextChanged');
  for (const fn of requiredFns) {
    if (typeof config[fn] !== 'function' && !Array.isArray(config[fn])) {
      const errorMsg = `Assistant ${fn} property must be a function or an array of functions`;
      throw new AssistantInitializationError(errorMsg);
    }
  }

  // Validate threadContextStore
  if (config.threadContextStore) {
    // Ensure assistant config object is passed in
    if (typeof config.threadContextStore !== 'object') {
      const errorMsg = 'Assistant expects threadContextStore to be a configuration object';
      throw new AssistantInitializationError(errorMsg);
    }

    // Check for missing required keys
    const requiredContextKeys: (keyof AssistantThreadContextStore)[] = ['get', 'save'];
    const missingContextKeys: (keyof AssistantThreadContextStore)[] = [];
    for (const k of requiredContextKeys) {
      if (config.threadContextStore && config.threadContextStore[k] === undefined) {
        missingContextKeys.push(k);
      }
    }

    if (missingContextKeys.length > 0) {
      const errorMsg = `threadContextStore is missing required keys: ${missingContextKeys.join(', ')}`;
      throw new AssistantInitializationError(errorMsg);
    }

    // Ensure properties of context store are functions
    const requiredStoreFns: (keyof AssistantThreadContextStore)[] = ['get', 'save'];
    for (const fn of requiredStoreFns) {
      if (config.threadContextStore && typeof config.threadContextStore[fn] !== 'function') {
        const errorMsg = `threadContextStore ${fn} property must be a function`;
        throw new AssistantInitializationError(errorMsg);
      }
    }
  }
}

/**
 * `processAssistantMiddleware()` invokes each callback for the given event
 */
export async function processAssistantMiddleware(
  args: AllAssistantMiddlewareArgs,
  middleware: AssistantMiddleware,
): Promise<void> {
  const { context, client, logger } = args;
  const callbacks = [...middleware] as Middleware<AnyMiddlewareArgs>[];
  const lastCallback = callbacks.pop();

  if (lastCallback !== undefined) {
    await processMiddleware(callbacks, args, context, client, logger, async () =>
      lastCallback({ ...args, context, client, logger }),
    );
  }
}

/**
 * Utility functions
 */

/**
 * Creates utility `say()` to easily respond to wherever the message
 * was received. Alias for `postMessage()`.
 * https://api.slack.com/methods/chat.postMessage
 */
function createSay(args: AllAssistantMiddlewareArgs): SayFn {
  const { client, payload } = args;
  const { channelId: channel, threadTs: thread_ts } = extractThreadInfo(payload);

  return (message: Parameters<SayFn>[0]) => {
    const postMessageArgument: ChatPostMessageArguments =
      typeof message === 'string' ? { text: message, channel, thread_ts } : { ...message, channel, thread_ts };

    return client.chat.postMessage(postMessageArgument);
  };
}

/**
 * Creates utility `setStatus()` to set the status and indicate active processing.
 * https://api.slack.com/methods/assistant.threads.setStatus
 */
function createSetStatus(args: AllAssistantMiddlewareArgs): SetStatusFn {
  const { client, payload } = args;
  const { channelId: channel_id, threadTs: thread_ts } = extractThreadInfo(payload);

  return (status: Parameters<SetStatusFn>[0]) =>
    client.assistant.threads.setStatus({
      channel_id,
      thread_ts,
      status,
    });
}

/**
 * Creates utility `setSuggestedPrompts()` to provides prompts for the user to select from.
 * https://api.slack.com/methods/assistant.threads.setSuggestedPrompts
 */
function createSetSuggestedPrompts(args: AllAssistantMiddlewareArgs): SetSuggestedPromptsFn {
  const { client, payload } = args;
  const { channelId: channel_id, threadTs: thread_ts } = extractThreadInfo(payload);

  return (params: Parameters<SetSuggestedPromptsFn>[0]) => {
    const { prompts } = params;
    return client.assistant.threads.setSuggestedPrompts({
      channel_id,
      thread_ts,
      prompts,
    });
  };
}

/**
 * Creates utility `setTitle()` to set the title of the Assistant thread
 * https://api.slack.com/methods/assistant.threads.setTitle
 */
function createSetTitle(args: AllAssistantMiddlewareArgs): SetTitleFn {
  const { client, payload } = args;
  const { channelId: channel_id, threadTs: thread_ts } = extractThreadInfo(payload);

  return (title: Parameters<SetTitleFn>[0]) =>
    client.assistant.threads.setTitle({
      channel_id,
      thread_ts,
      title,
    });
}

/**
 * `extractThreadInfo()` parses an incoming payload and returns relevant
 * details about the thread
 */
export function extractThreadInfo(payload: AllAssistantMiddlewareArgs['payload']): {
  channelId: string;
  threadTs: string;
  context: AssistantThreadContext;
} {
  let channelId = '';
  let threadTs = '';
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
    if (!channelId) missingProps.push('channel_id');
    if (!threadTs) missingProps.push('thread_ts');
    if (missingProps.length > 0) {
      const errorMsg = `Assistant message event is missing required properties: ${missingProps.join(', ')}`;
      throw new AssistantMissingPropertyError(errorMsg);
    }
  }

  return { channelId, threadTs, context };
}
