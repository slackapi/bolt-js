/* eslint-disable @typescript-eslint/explicit-member-accessibility, @typescript-eslint/strict-boolean-expressions */
import { Agent } from 'http';
import { SecureContextOptions } from 'tls';
import util from 'util';
import { WebClient, ChatPostMessageArguments, addAppMetadata, WebClientOptions } from '@slack/web-api';
import { Logger, LogLevel, ConsoleLogger } from '@slack/logger';
import axios, { AxiosInstance } from 'axios';
import ExpressReceiver, { ExpressReceiverOptions } from './ExpressReceiver';
import {
  ignoreSelf as ignoreSelfMiddleware,
  onlyActions,
  matchConstraints,
  onlyCommands,
  matchCommandName,
  onlyOptions,
  onlyShortcuts,
  onlyEvents,
  matchEventType,
  matchMessage,
  onlyViewActions,
} from './middleware/builtin';
import { processMiddleware } from './middleware/process';
import { ConversationStore, conversationContext, MemoryStore } from './conversation-store';
import { WorkflowStep } from './WorkflowStep';
import {
  Middleware,
  AnyMiddlewareArgs,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackOptionsMiddlewareArgs,
  SlackShortcutMiddlewareArgs,
  SlackViewMiddlewareArgs,
  SlackAction,
  SlackShortcut,
  Context,
  SayFn,
  AckFn,
  RespondFn,
  OptionsSource,
  BlockAction,
  InteractiveMessage,
  SlackViewAction,
  Receiver,
  ReceiverEvent,
  RespondArguments,
} from './types';
import { IncomingEventType, getTypeAndConversation, assertNever } from './helpers';
import { CodedError, asCodedError, AppInitializationError, MultipleListenerError } from './errors';
// eslint-disable-next-line import/order
import allSettled = require('promise.allsettled'); // eslint-disable-line @typescript-eslint/no-require-imports
// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require('../package.json'); // eslint-disable-line @typescript-eslint/no-var-requires

/** App initialization options */
export interface AppOptions {
  signingSecret?: ExpressReceiverOptions['signingSecret'];
  endpoints?: ExpressReceiverOptions['endpoints'];
  processBeforeResponse?: ExpressReceiverOptions['processBeforeResponse'];
  clientId?: ExpressReceiverOptions['clientId'];
  clientSecret?: ExpressReceiverOptions['clientSecret'];
  stateSecret?: ExpressReceiverOptions['stateSecret']; // required when using default stateStore
  installationStore?: ExpressReceiverOptions['installationStore']; // default MemoryInstallationStore
  scopes?: ExpressReceiverOptions['scopes'];
  installerOptions?: ExpressReceiverOptions['installerOptions'];
  agent?: Agent;
  clientTls?: Pick<SecureContextOptions, 'pfx' | 'key' | 'passphrase' | 'cert' | 'ca'>;
  convoStore?: ConversationStore | false;
  token?: AuthorizeResult['botToken']; // either token or authorize
  botId?: AuthorizeResult['botId']; // only used when authorize is not defined, shortcut for fetching
  botUserId?: AuthorizeResult['botUserId']; // only used when authorize is not defined, shortcut for fetching
  authorize?: Authorize; // either token or authorize
  receiver?: Receiver;
  logger?: Logger;
  logLevel?: LogLevel;
  ignoreSelf?: boolean;
  clientOptions?: Pick<WebClientOptions, 'slackApiUrl'>;
}

export { LogLevel, Logger } from '@slack/logger';

/** Authorization function - seeds the middleware processing and listeners with an authorization context */
export interface Authorize {
  (source: AuthorizeSourceData, body?: AnyMiddlewareArgs['body']): Promise<AuthorizeResult>;
}

/** Authorization function inputs - authenticated data about an event for the authorization function */
export interface AuthorizeSourceData {
  teamId: string;
  enterpriseId?: string;
  userId?: string;
  conversationId?: string;
}

/** Authorization function outputs - data that will be available as part of event processing */
export interface AuthorizeResult {
  // one of either botToken or userToken are required
  botToken?: string; // used by `say` (preferred over userToken)
  userToken?: string; // used by `say` (overridden by botToken)
  botId?: string; // required for `ignoreSelf` global middleware
  botUserId?: string; // optional but allows `ignoreSelf` global middleware be more filter more than just message events
  [key: string]: any;
}

export interface ActionConstraints<A extends SlackAction = SlackAction> {
  type?: A['type'];
  block_id?: A extends BlockAction ? string | RegExp : never;
  action_id?: A extends BlockAction ? string | RegExp : never;
  callback_id?: Extract<A, { callback_id?: string }> extends any ? string | RegExp : never;
}

export interface ShortcutConstraints<S extends SlackShortcut = SlackShortcut> {
  type?: S['type'];
  callback_id?: string | RegExp;
}

export interface ViewConstraints {
  callback_id?: string | RegExp;
  type?: 'view_closed' | 'view_submission';
}

export interface ErrorHandler {
  (error: CodedError): Promise<void>;
}

class WebClientPool {
  private pool: { [token: string]: WebClient } = {};

  public getOrCreate(token: string, clientOptions: WebClientOptions): WebClient {
    const cachedClient = this.pool[token];
    if (typeof cachedClient !== 'undefined') {
      return cachedClient;
    }
    const client = new WebClient(token, clientOptions);
    this.pool[token] = client;
    return client;
  }
}

/**
 * A Slack App
 */
export default class App {
  /** Slack Web API client */
  public client: WebClient;

  private clientOptions: WebClientOptions;

  private clients: { [teamId: string]: WebClientPool } = {};

  /** Receiver - ingests events from the Slack platform */
  private receiver: Receiver;

  /** Logger */
  private logger: Logger;

  /** Authorize */
  private authorize!: Authorize;

  /** Global middleware chain */
  private middleware: Middleware<AnyMiddlewareArgs>[];

  /** Listener middleware chains */
  private listeners: Middleware<AnyMiddlewareArgs>[][];

  private errorHandler: ErrorHandler;

  private axios: AxiosInstance;

  private installerOptions: ExpressReceiverOptions['installerOptions'];

  constructor({
    signingSecret = undefined,
    endpoints = undefined,
    agent = undefined,
    clientTls = undefined,
    receiver = undefined,
    convoStore = undefined,
    token = undefined,
    botId = undefined,
    botUserId = undefined,
    authorize = undefined,
    logger = undefined,
    logLevel = undefined,
    ignoreSelf = true,
    clientOptions = undefined,
    processBeforeResponse = false,
    clientId = undefined,
    clientSecret = undefined,
    stateSecret = undefined,
    installationStore = undefined,
    scopes = undefined,
    installerOptions = undefined,
  }: AppOptions = {}) {
    if (typeof logger === 'undefined') {
      // Initialize with the default logger
      const consoleLogger = new ConsoleLogger();
      consoleLogger.setName('bolt-app');
      this.logger = consoleLogger;
    } else {
      this.logger = logger;
    }
    if (typeof logLevel !== 'undefined' && this.logger.getLevel() !== logLevel) {
      this.logger.setLevel(logLevel);
    }
    this.errorHandler = defaultErrorHandler(this.logger);
    this.clientOptions = {
      agent,
      // App propagates only the log level to WebClient as WebClient has its own logger
      logLevel: this.logger.getLevel(),
      tls: clientTls,
      slackApiUrl: clientOptions !== undefined ? clientOptions.slackApiUrl : undefined,
    };
    /*
        @christiaankruger
        FORK ALERT! Token wasn't passed through here, but this lead to some client calls breaking.
    */
    this.client = new WebClient(token, this.clientOptions);

    this.axios = axios.create({
      httpAgent: agent,
      httpsAgent: agent,
      ...clientTls,
    });

    this.middleware = [];
    this.listeners = [];

    // Add clientOptions to InstallerOptions to pass them to @slack/oauth
    this.installerOptions = {
      clientOptions: this.clientOptions,
      ...installerOptions,
    };

    // Check for required arguments of ExpressReceiver
    if (receiver !== undefined) {
      this.receiver = receiver;
    } else if (signingSecret === undefined) {
      // No custom receiver
      throw new AppInitializationError(
        'Signing secret not found, so could not initialize the default receiver. Set a signing secret or use a ' +
          'custom receiver.',
      );
    } else {
      // Create default ExpressReceiver
      this.receiver = new ExpressReceiver({
        signingSecret,
        endpoints,
        processBeforeResponse,
        clientId,
        clientSecret,
        stateSecret,
        installationStore,
        scopes,
        installerOptions: this.installerOptions,
        logger: this.logger,
      });
    }

    let usingOauth = false;
    if (
      (this.receiver as ExpressReceiver).installer !== undefined &&
      (this.receiver as ExpressReceiver).installer!.authorize !== undefined
    ) {
      // This supports using the built in ExpressReceiver, declaring your own ExpressReceiver
      // and theoretically, doing a fully custom (non express) receiver that implements OAuth
      usingOauth = true;
    }

    if (token !== undefined) {
      if (authorize !== undefined || usingOauth) {
        throw new AppInitializationError(
          `token as well as authorize options or oauth installer options were provided. ${tokenUsage}`,
        );
      }
      this.authorize = singleTeamAuthorization(this.client, { botId, botUserId, botToken: token });
    } else if (authorize === undefined && !usingOauth) {
      throw new AppInitializationError(
        `No token, no authorize options, and no oauth installer options provided. ${tokenUsage}`,
      );
    } else if (authorize !== undefined && usingOauth) {
      throw new AppInitializationError(`Both authorize options and oauth installer options provided. ${tokenUsage}`);
    } else if (authorize === undefined && usingOauth) {
      this.authorize = (this.receiver as ExpressReceiver).installer!.authorize as Authorize;
    } else if (authorize !== undefined && !usingOauth) {
      this.authorize = authorize;
    } else {
      this.logger.error('Never should have reached this point, please report to the team');
      assertNever();
    }

    // Conditionally use a global middleware that ignores events (including messages) that are sent from this app
    if (ignoreSelf) {
      this.use(ignoreSelfMiddleware());
    }

    // Use conversation state global middleware
    if (convoStore !== false) {
      // Use the memory store by default, or another store if provided
      const store: ConversationStore = convoStore === undefined ? new MemoryStore() : convoStore;
      this.use(conversationContext(store));
    }

    // Should be last to avoid exposing partially initialized app
    this.receiver.init(this);
  }

  /**
   * Register a new middleware, processed in the order registered.
   *
   * @param m global middleware function
   */
  public use(m: Middleware<AnyMiddlewareArgs>): this {
    this.middleware.push(m);
    return this;
  }

  /**
   * Register WorkflowStep middleware
   *
   * @param workflowStep global workflow step middleware function
   */
  public step(workflowStep: WorkflowStep): this {
    const m = workflowStep.getMiddleware();
    this.middleware.push(m);
    return this;
  }

  /**
   * Convenience method to call start on the receiver
   *
   * TODO: args could be defined using a generic constraint from the receiver type
   *
   * @param args receiver-specific start arguments
   */
  public start(...args: any[]): Promise<unknown> {
    return this.receiver.start(...args);
  }

  public stop(...args: any[]): Promise<unknown> {
    return this.receiver.stop(...args);
  }

  public event<EventType extends string = string>(
    eventName: EventType,
    ...listeners: Middleware<SlackEventMiddlewareArgs<EventType>>[]
  ): void {
    this.listeners.push([onlyEvents, matchEventType(eventName), ...listeners] as Middleware<AnyMiddlewareArgs>[]);
  }

  // TODO: just make a type alias for Middleware<SlackEventMiddlewareArgs<'message'>>
  // TODO: maybe remove the first two overloads
  public message(...listeners: Middleware<SlackEventMiddlewareArgs<'message'>>[]): void;
  public message(pattern: string | RegExp, ...listeners: Middleware<SlackEventMiddlewareArgs<'message'>>[]): void;
  public message(...patternsOrMiddleware: (string | RegExp | Middleware<SlackEventMiddlewareArgs<'message'>>)[]): void {
    const messageMiddleware = patternsOrMiddleware.map((patternOrMiddleware) => {
      if (typeof patternOrMiddleware === 'string' || util.types.isRegExp(patternOrMiddleware)) {
        return matchMessage(patternOrMiddleware);
      }
      return patternOrMiddleware;
    });

    this.listeners.push([onlyEvents, matchEventType('message'), ...messageMiddleware] as Middleware<
      AnyMiddlewareArgs
    >[]);
  }

  public shortcut<Shortcut extends SlackShortcut = SlackShortcut>(
    callbackId: string | RegExp,
    ...listeners: Middleware<SlackShortcutMiddlewareArgs<Shortcut>>[]
  ): void;
  public shortcut<
    Shortcut extends SlackShortcut = SlackShortcut,
    Constraints extends ShortcutConstraints<Shortcut> = ShortcutConstraints<Shortcut>
  >(
    constraints: Constraints,
    ...listeners: Middleware<SlackShortcutMiddlewareArgs<Extract<Shortcut, { type: Constraints['type'] }>>>[]
  ): void;
  public shortcut<
    Shortcut extends SlackShortcut = SlackShortcut,
    Constraints extends ShortcutConstraints<Shortcut> = ShortcutConstraints<Shortcut>
  >(
    callbackIdOrConstraints: string | RegExp | Constraints,
    ...listeners: Middleware<SlackShortcutMiddlewareArgs<Extract<Shortcut, { type: Constraints['type'] }>>>[]
  ): void {
    const constraints: ShortcutConstraints =
      typeof callbackIdOrConstraints === 'string' || util.types.isRegExp(callbackIdOrConstraints)
        ? { callback_id: callbackIdOrConstraints }
        : callbackIdOrConstraints;

    // Fail early if the constraints contain invalid keys
    const unknownConstraintKeys = Object.keys(constraints).filter((k) => k !== 'callback_id' && k !== 'type');
    if (unknownConstraintKeys.length > 0) {
      this.logger.error(
        `Slack listener cannot be attached using unknown constraint keys: ${unknownConstraintKeys.join(', ')}`,
      );
      return;
    }

    this.listeners.push([onlyShortcuts, matchConstraints(constraints), ...listeners] as Middleware<
      AnyMiddlewareArgs
    >[]);
  }

  // NOTE: this is what's called a convenience generic, so that types flow more easily without casting.
  // https://basarat.gitbooks.io/typescript/docs/types/generics.html#design-pattern-convenience-generic
  public action<Action extends SlackAction = SlackAction>(
    actionId: string | RegExp,
    ...listeners: Middleware<SlackActionMiddlewareArgs<Action>>[]
  ): void;
  public action<
    Action extends SlackAction = SlackAction,
    Constraints extends ActionConstraints<Action> = ActionConstraints<Action>
  >(
    constraints: Constraints,
    // NOTE: Extract<> is able to return the whole union when type: undefined. Why?
    ...listeners: Middleware<SlackActionMiddlewareArgs<Extract<Action, { type: Constraints['type'] }>>>[]
  ): void;
  public action<
    Action extends SlackAction = SlackAction,
    Constraints extends ActionConstraints<Action> = ActionConstraints<Action>
  >(
    actionIdOrConstraints: string | RegExp | Constraints,
    ...listeners: Middleware<SlackActionMiddlewareArgs<Extract<Action, { type: Constraints['type'] }>>>[]
  ): void {
    // Normalize Constraints
    const constraints: ActionConstraints =
      typeof actionIdOrConstraints === 'string' || util.types.isRegExp(actionIdOrConstraints)
        ? { action_id: actionIdOrConstraints }
        : actionIdOrConstraints;

    // Fail early if the constraints contain invalid keys
    const unknownConstraintKeys = Object.keys(constraints).filter(
      (k) => k !== 'action_id' && k !== 'block_id' && k !== 'callback_id' && k !== 'type',
    );
    if (unknownConstraintKeys.length > 0) {
      this.logger.error(
        `Action listener cannot be attached using unknown constraint keys: ${unknownConstraintKeys.join(', ')}`,
      );
      return;
    }

    this.listeners.push([onlyActions, matchConstraints(constraints), ...listeners] as Middleware<AnyMiddlewareArgs>[]);
  }

  // TODO: should command names also be regex?
  public command(commandName: string, ...listeners: Middleware<SlackCommandMiddlewareArgs>[]): void {
    this.listeners.push([onlyCommands, matchCommandName(commandName), ...listeners] as Middleware<AnyMiddlewareArgs>[]);
  }

  public options<Source extends OptionsSource = OptionsSource>(
    actionId: string | RegExp,
    ...listeners: Middleware<SlackOptionsMiddlewareArgs<Source>>[]
  ): void;
  public options<Source extends OptionsSource = OptionsSource>(
    constraints: ActionConstraints,
    ...listeners: Middleware<SlackOptionsMiddlewareArgs<Source>>[]
  ): void;
  public options<Source extends OptionsSource = OptionsSource>(
    actionIdOrConstraints: string | RegExp | ActionConstraints,
    ...listeners: Middleware<SlackOptionsMiddlewareArgs<Source>>[]
  ): void {
    const constraints: ActionConstraints =
      typeof actionIdOrConstraints === 'string' || util.types.isRegExp(actionIdOrConstraints)
        ? { action_id: actionIdOrConstraints }
        : actionIdOrConstraints;

    this.listeners.push([onlyOptions, matchConstraints(constraints), ...listeners] as Middleware<AnyMiddlewareArgs>[]);
  }

  public view<ViewActionType extends SlackViewAction = SlackViewAction>(
    callbackId: string | RegExp,
    ...listeners: Middleware<SlackViewMiddlewareArgs<ViewActionType>>[]
  ): void;
  public view<ViewActionType extends SlackViewAction = SlackViewAction>(
    constraints: ViewConstraints,
    ...listeners: Middleware<SlackViewMiddlewareArgs<ViewActionType>>[]
  ): void;
  public view<ViewActionType extends SlackViewAction = SlackViewAction>(
    callbackIdOrConstraints: string | RegExp | ViewConstraints,
    ...listeners: Middleware<SlackViewMiddlewareArgs<ViewActionType>>[]
  ): void {
    const constraints: ViewConstraints =
      typeof callbackIdOrConstraints === 'string' || util.types.isRegExp(callbackIdOrConstraints)
        ? { callback_id: callbackIdOrConstraints, type: 'view_submission' }
        : callbackIdOrConstraints;
    // Fail early if the constraints contain invalid keys
    const unknownConstraintKeys = Object.keys(constraints).filter((k) => k !== 'callback_id' && k !== 'type');
    if (unknownConstraintKeys.length > 0) {
      this.logger.error(
        `View listener cannot be attached using unknown constraint keys: ${unknownConstraintKeys.join(', ')}`,
      );
      return;
    }

    if (constraints.type !== undefined && !validViewTypes.includes(constraints.type)) {
      this.logger.error(`View listener cannot be attached using unknown view event type: ${constraints.type}`);
      return;
    }

    this.listeners.push([onlyViewActions, matchConstraints(constraints), ...listeners] as Middleware<
      AnyMiddlewareArgs
    >[]);
  }

  public error(errorHandler: ErrorHandler): void {
    this.errorHandler = errorHandler;
  }

  /**
   * Handles events from the receiver
   */
  public async processEvent(event: ReceiverEvent): Promise<void> {
    const { body, ack } = event;
    // TODO: when generating errors (such as in the say utility) it may become useful to capture the current context,
    // or even all of the args, as properties of the error. This would give error handling code some ability to deal
    // with "finally" type error situations.
    // Introspect the body to determine what type of incoming event is being handled, and any channel context
    const { type, conversationId } = getTypeAndConversation(body);
    // If the type could not be determined, warn and exit
    if (type === undefined) {
      this.logger.warn('Could not determine the type of an incoming event. No listeners will be called.');
      return;
    }

    // From this point on, we assume that body is not just a key-value map, but one of the types of bodies we expect
    const bodyArg = body as AnyMiddlewareArgs['body'];

    // Initialize context (shallow copy to enforce object identity separation)
    const source = buildSource(type, conversationId, bodyArg);
    let authorizeResult;

    try {
      authorizeResult = await this.authorize(source, bodyArg);
    } catch (error) {
      this.logger.warn('Authorization of incoming event did not succeed. No listeners will be called.');
      return this.handleError(error);
    }

    const context: Context = { ...authorizeResult };

    // Factory for say() utility
    const createSay = (channelId: string): SayFn => {
      const token = selectToken(context);
      return (message: Parameters<SayFn>[0]) => {
        const postMessageArguments: ChatPostMessageArguments =
          typeof message === 'string'
            ? { token, text: message, channel: channelId }
            : { ...message, token, channel: channelId };

        return this.client.chat.postMessage(postMessageArguments);
      };
    };

    // Set body and payload (this value will eventually conform to AnyMiddlewareArgs)
    // NOTE: the following doesn't work because... distributive?
    // const listenerArgs: Partial<AnyMiddlewareArgs> = {
    const listenerArgs: Pick<AnyMiddlewareArgs, 'body' | 'payload'> & {
      /** Say function might be set below */
      say?: SayFn;
      /** Respond function might be set below */
      respond?: RespondFn;
      /** Ack function might be set below */
      ack?: AckFn<any>;
    } = {
      body: bodyArg,
      payload:
        type === IncomingEventType.Event
          ? (bodyArg as SlackEventMiddlewareArgs['body']).event
          : type === IncomingEventType.ViewAction
          ? (bodyArg as SlackViewMiddlewareArgs['body']).view
          : type === IncomingEventType.Shortcut
          ? (bodyArg as SlackShortcutMiddlewareArgs['body'])
          : type === IncomingEventType.Action &&
            isBlockActionOrInteractiveMessageBody(bodyArg as SlackActionMiddlewareArgs['body'])
          ? (bodyArg as SlackActionMiddlewareArgs<BlockAction | InteractiveMessage>['body']).actions[0]
          : (bodyArg as (
              | Exclude<
                  AnyMiddlewareArgs,
                  SlackEventMiddlewareArgs | SlackActionMiddlewareArgs | SlackViewMiddlewareArgs
                >
              | SlackActionMiddlewareArgs<Exclude<SlackAction, BlockAction | InteractiveMessage>>
            )['body']),
    };

    // Set aliases
    if (type === IncomingEventType.Event) {
      const eventListenerArgs = listenerArgs as SlackEventMiddlewareArgs;
      eventListenerArgs.event = eventListenerArgs.payload;
      if (eventListenerArgs.event.type === 'message') {
        const messageEventListenerArgs = eventListenerArgs as SlackEventMiddlewareArgs<'message'>;
        messageEventListenerArgs.message = messageEventListenerArgs.payload;
      }
    } else if (type === IncomingEventType.Action) {
      const actionListenerArgs = listenerArgs as SlackActionMiddlewareArgs;
      actionListenerArgs.action = actionListenerArgs.payload;
    } else if (type === IncomingEventType.Command) {
      const commandListenerArgs = listenerArgs as SlackCommandMiddlewareArgs;
      commandListenerArgs.command = commandListenerArgs.payload;
    } else if (type === IncomingEventType.Options) {
      const optionListenerArgs = listenerArgs as SlackOptionsMiddlewareArgs<OptionsSource>;
      optionListenerArgs.options = optionListenerArgs.payload;
    } else if (type === IncomingEventType.ViewAction) {
      const viewListenerArgs = listenerArgs as SlackViewMiddlewareArgs;
      viewListenerArgs.view = viewListenerArgs.payload;
    } else if (type === IncomingEventType.Shortcut) {
      const shortcutListenerArgs = listenerArgs as SlackShortcutMiddlewareArgs;
      shortcutListenerArgs.shortcut = shortcutListenerArgs.payload;
    }

    // Set say() utility
    if (conversationId !== undefined && type !== IncomingEventType.Options) {
      listenerArgs.say = createSay(conversationId);
    }

    // Set respond() utility
    if (body.response_url) {
      listenerArgs.respond = (response: string | RespondArguments): Promise<any> => {
        const validResponse: RespondArguments = typeof response === 'string' ? { text: response } : response;

        return this.axios.post(body.response_url, validResponse);
      };
    }

    // Set ack() utility
    if (type !== IncomingEventType.Event) {
      listenerArgs.ack = ack;
    } else {
      // Events API requests are acknowledged right away, since there's no data expected
      await ack();
    }

    // Get the client arg
    let { client } = this;
    const token = selectToken(context);
    if (token !== undefined) {
      let pool = this.clients[source.teamId];
      if (pool === undefined) {
        // eslint-disable-next-line no-multi-assign
        pool = this.clients[source.teamId] = new WebClientPool();
      }
      client = pool.getOrCreate(token, this.clientOptions);
    }

    // Dispatch event through the global middleware chain
    try {
      await processMiddleware(
        this.middleware,
        listenerArgs as AnyMiddlewareArgs,
        context,
        client,
        this.logger,
        async () => {
          // Dispatch the event through the listener middleware chains and aggregate their results
          // TODO: change the name of this.middleware and this.listeners to help this make more sense
          const listenerResults = this.listeners.map(async (origListenerMiddleware) => {
            // Copy the array so modifications don't affect the original
            const listenerMiddleware = [...origListenerMiddleware];

            // Don't process the last item in the listenerMiddleware array - it shouldn't get a next fn
            const listener = listenerMiddleware.pop();

            if (listener !== undefined) {
              return processMiddleware(
                listenerMiddleware,
                listenerArgs as AnyMiddlewareArgs,
                context,
                client,
                this.logger,
                async () =>
                  // When the listener middleware chain is done processing, call the listener without a next fn
                  listener({ ...(listenerArgs as AnyMiddlewareArgs), context, client, logger: this.logger }),
              );
            }
          });

          const settledListenerResults = await allSettled(listenerResults);
          const rejectedListenerResults = settledListenerResults.filter(
            (lr) => lr.status === 'rejected',
          ) as allSettled.PromiseRejection<Error>[];
          if (rejectedListenerResults.length === 1) {
            throw rejectedListenerResults[0].reason;
          } else if (rejectedListenerResults.length > 1) {
            throw new MultipleListenerError(rejectedListenerResults.map((rlr) => rlr.reason));
          }
        },
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Global error handler. The final destination for all errors (hopefully).
   */
  private handleError(error: Error): Promise<void> {
    return this.errorHandler(asCodedError(error));
  }
}

const tokenUsage =
  'Apps used in one workspace should be initialized with a token. Apps used in many workspaces ' +
  'should be initialized with oauth installer or authorize.';

const validViewTypes = ['view_closed', 'view_submission'];

/**
 * Helper which builds the data structure the authorize hook uses to provide tokens for the context.
 */
function buildSource(
  type: IncomingEventType,
  channelId: string | undefined,
  body: AnyMiddlewareArgs['body'],
): AuthorizeSourceData {
  // NOTE: potentially something that can be optimized, so that each of these conditions isn't evaluated more than once.
  // if this makes it prettier, great! but we should probably check perf before committing to any specific optimization.

  // tslint:disable:max-line-length
  const source: AuthorizeSourceData = {
    teamId:
      type === IncomingEventType.Event || type === IncomingEventType.Command
        ? ((body as (SlackEventMiddlewareArgs | SlackCommandMiddlewareArgs)['body']).team_id as string)
        : type === IncomingEventType.Action ||
          type === IncomingEventType.Options ||
          type === IncomingEventType.ViewAction ||
          type === IncomingEventType.Shortcut
        ? ((body as (
            | SlackActionMiddlewareArgs
            | SlackOptionsMiddlewareArgs
            | SlackViewMiddlewareArgs
            | SlackShortcutMiddlewareArgs
          )['body']).team.id as string)
        : assertNever(type),
    enterpriseId:
      type === IncomingEventType.Event || type === IncomingEventType.Command
        ? ((body as (SlackEventMiddlewareArgs | SlackCommandMiddlewareArgs)['body']).enterprise_id as string)
        : type === IncomingEventType.Action ||
          type === IncomingEventType.Options ||
          type === IncomingEventType.ViewAction ||
          type === IncomingEventType.Shortcut
        ? ((body as (
            | SlackActionMiddlewareArgs
            | SlackOptionsMiddlewareArgs
            | SlackViewMiddlewareArgs
            | SlackShortcutMiddlewareArgs
          )['body']).team.enterprise_id as string)
        : undefined,
    userId:
      type === IncomingEventType.Event
        ? typeof (body as SlackEventMiddlewareArgs['body']).event.user === 'string'
          ? ((body as SlackEventMiddlewareArgs['body']).event.user as string)
          : typeof (body as SlackEventMiddlewareArgs['body']).event.user === 'object'
          ? ((body as SlackEventMiddlewareArgs['body']).event.user.id as string)
          : (body as SlackEventMiddlewareArgs['body']).event.channel !== undefined &&
            (body as SlackEventMiddlewareArgs['body']).event.channel.creator !== undefined
          ? ((body as SlackEventMiddlewareArgs['body']).event.channel.creator as string)
          : (body as SlackEventMiddlewareArgs['body']).event.subteam !== undefined &&
            (body as SlackEventMiddlewareArgs['body']).event.subteam.created_by !== undefined
          ? ((body as SlackEventMiddlewareArgs['body']).event.subteam.created_by as string)
          : undefined
        : type === IncomingEventType.Action ||
          type === IncomingEventType.Options ||
          type === IncomingEventType.ViewAction ||
          type === IncomingEventType.Shortcut
        ? ((body as (SlackActionMiddlewareArgs | SlackOptionsMiddlewareArgs | SlackViewMiddlewareArgs)['body']).user
            .id as string)
        : type === IncomingEventType.Command
        ? ((body as SlackCommandMiddlewareArgs['body']).user_id as string)
        : undefined,
    conversationId: channelId,
  };
  // tslint:enable:max-line-length

  return source;
}

function isBlockActionOrInteractiveMessageBody(
  body: SlackActionMiddlewareArgs['body'],
): body is SlackActionMiddlewareArgs<BlockAction | InteractiveMessage>['body'] {
  return (body as SlackActionMiddlewareArgs<BlockAction | InteractiveMessage>['body']).actions !== undefined;
}

function defaultErrorHandler(logger: Logger): ErrorHandler {
  return (error) => {
    logger.error(error);

    return Promise.reject(error);
  };
}

function singleTeamAuthorization(
  client: WebClient,
  authorization: Partial<AuthorizeResult> & { botToken: Required<AuthorizeResult>['botToken'] },
): Authorize {
  // TODO: warn when something needed isn't found
  const identifiers: Promise<{ botUserId: string; botId: string }> =
    authorization.botUserId !== undefined && authorization.botId !== undefined
      ? Promise.resolve({ botUserId: authorization.botUserId, botId: authorization.botId })
      : client.auth.test({ token: authorization.botToken }).then((result) => {
          return {
            botUserId: result.user_id as string,
            botId: result.bot_id as string,
          };
        });

  return async () => {
    return { botToken: authorization.botToken, ...(await identifiers) };
  };
}

function selectToken(context: Context): string | undefined {
  return context.botToken !== undefined ? context.botToken : context.userToken;
}

/* Instrumentation */
addAppMetadata({ name: packageJson.name, version: packageJson.version });
