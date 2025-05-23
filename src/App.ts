import type { Agent } from 'node:http';
import type { SecureContextOptions } from 'node:tls';
import util from 'node:util';
import { ConsoleLogger, LogLevel, type Logger } from '@slack/logger';
import { type ChatPostMessageArguments, WebClient, type WebClientOptions, addAppMetadata } from '@slack/web-api';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { Assistant } from './Assistant';
import {
  CustomFunction,
  type FunctionCompleteFn,
  type FunctionFailFn,
  type SlackCustomFunctionMiddlewareArgs,
  createFunctionComplete,
  createFunctionFail,
} from './CustomFunction';
import type { WorkflowStep } from './WorkflowStep';
import { type ConversationStore, MemoryStore, conversationContext } from './conversation-store';
import {
  AppInitializationError,
  type CodedError,
  ErrorCode,
  InvalidCustomPropertyError,
  MultipleListenerError,
  asCodedError,
} from './errors';
import {
  IncomingEventType,
  assertNever,
  getTypeAndConversation,
  isBodyWithTypeEnterpriseInstall,
  isEventTypeToSkipAuthorize,
} from './helpers';
import {
  ignoreSelf as ignoreSelfMiddleware,
  isSlackEventMiddlewareArgsOptions,
  matchCommandName,
  matchConstraints,
  matchEventType,
  matchMessage,
  onlyActions,
  onlyCommands,
  onlyEvents,
  onlyOptions,
  onlyShortcuts,
  onlyViewActions,
} from './middleware/builtin';
import processMiddleware from './middleware/process';
import HTTPReceiver, { type HTTPReceiverOptions } from './receivers/HTTPReceiver';
import SocketModeReceiver from './receivers/SocketModeReceiver';
import type {
  AckFn,
  ActionConstraints,
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  BlockAction,
  BlockElementAction,
  Context,
  DialogSubmitAction,
  EventTypePattern,
  FunctionInputs,
  InteractiveAction,
  InteractiveMessage,
  KnownEventFromType,
  KnownOptionsPayloadFromType,
  Middleware,
  OptionsConstraints,
  OptionsSource,
  Receiver,
  ReceiverEvent,
  RespondArguments,
  RespondFn,
  SayFn,
  ShortcutConstraints,
  SlackAction,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackEventMiddlewareArgsOptions,
  SlackOptionsMiddlewareArgs,
  SlackShortcut,
  SlackShortcutMiddlewareArgs,
  SlackViewAction,
  SlackViewMiddlewareArgs,
  SlashCommand,
  ViewConstraints,
  ViewOutput,
  WorkflowStepEdit,
} from './types';
import { contextBuiltinKeys } from './types';
import { type StringIndexed, isRejected } from './types/utilities';
const packageJson = require('../package.json');

export type { ActionConstraints, OptionsConstraints, ShortcutConstraints, ViewConstraints } from './types';

// ----------------------------
// For listener registration methods
// TODO: we have types for this... consolidate
const validViewTypes = ['view_closed', 'view_submission'];

// ----------------------------
// For the constructor

const tokenUsage =
  'Apps used in a single workspace can be initialized with a token. Apps used in many workspaces ' +
  'should be initialized with oauth installer options or authorize.';

/** App initialization options */
export interface AppOptions {
  signingSecret?: HTTPReceiverOptions['signingSecret'];
  endpoints?: HTTPReceiverOptions['endpoints'];
  port?: HTTPReceiverOptions['port'];
  customRoutes?: HTTPReceiverOptions['customRoutes'];
  processBeforeResponse?: HTTPReceiverOptions['processBeforeResponse'];
  signatureVerification?: HTTPReceiverOptions['signatureVerification'];
  clientId?: HTTPReceiverOptions['clientId'];
  clientSecret?: HTTPReceiverOptions['clientSecret'];
  stateSecret?: HTTPReceiverOptions['stateSecret']; // required when using default stateStore
  redirectUri?: HTTPReceiverOptions['redirectUri'];
  installationStore?: HTTPReceiverOptions['installationStore']; // default MemoryInstallationStore
  scopes?: HTTPReceiverOptions['scopes'];
  installerOptions?: HTTPReceiverOptions['installerOptions'];
  agent?: Agent;
  clientTls?: Pick<SecureContextOptions, 'pfx' | 'key' | 'passphrase' | 'cert' | 'ca'>;
  convoStore?: ConversationStore | false;
  token?: AuthorizeResult['botToken']; // either token or authorize
  appToken?: string; // TODO should this be included in AuthorizeResult
  botId?: AuthorizeResult['botId']; // only used when authorize is not defined, shortcut for fetching
  botUserId?: AuthorizeResult['botUserId']; // only used when authorize is not defined, shortcut for fetching
  authorize?: Authorize<boolean>; // either token or authorize
  receiver?: Receiver;
  logger?: Logger;
  logLevel?: LogLevel;
  ignoreSelf?: boolean;
  /**
   * Configurations for the web client used to send Slack API method requests.
   *
   * See {@link https://tools.slack.dev/node-slack-sdk/reference/web-api/interfaces/WebClientOptions} for more information.
   */
  clientOptions?: WebClientOptions;
  socketMode?: boolean;
  developerMode?: boolean;
  tokenVerificationEnabled?: boolean;
  deferInitialization?: boolean;
  extendedErrorHandler?: boolean;
  attachFunctionToken?: boolean;
}

export { LogLevel, Logger } from '@slack/logger';

/** Authorization function - seeds the middleware processing and listeners with an authorization context */
export type Authorize<IsEnterpriseInstall extends boolean = false> = (
  source: AuthorizeSourceData<IsEnterpriseInstall>,
  body?: AnyMiddlewareArgs['body'],
) => Promise<AuthorizeResult>;

/** Authorization function inputs - authenticated data about an event for the authorization function */
export interface AuthorizeSourceData<IsEnterpriseInstall extends boolean = false> {
  teamId: IsEnterpriseInstall extends true ? string | undefined : string;
  enterpriseId: IsEnterpriseInstall extends true ? string : string | undefined;
  userId?: string;
  conversationId?: string;
  isEnterpriseInstall: IsEnterpriseInstall;
}

/** Authorization function outputs - data that will be available as part of event processing */
export interface AuthorizeResult {
  // one of either botToken or userToken are required
  botToken?: string; // used by `say` (preferred over userToken)
  userToken?: string; // used by `say` (overridden by botToken)
  botId?: string; // required for `ignoreSelf` global middleware
  botUserId?: string; // optional but allows `ignoreSelf` global middleware be more filter more than just message events
  userId?: string;
  teamId?: string;
  enterpriseId?: string;
  // biome-ignore lint/suspicious/noExplicitAny: TODO: for better type safety, we may want to revisit this
  [key: string]: any;
}

// Passed internally to the handleError method
interface AllErrorHandlerArgs {
  error: Error; // Error is not necessarily a CodedError
  logger: Logger;
  body: AnyMiddlewareArgs['body'];
  context: Context;
}

// Passed into the error handler when extendedErrorHandler is true
export interface ExtendedErrorHandlerArgs extends AllErrorHandlerArgs {
  error: CodedError; // asCodedError has been called
}

export type ErrorHandler = (error: CodedError) => Promise<void>;

export type ExtendedErrorHandler = (args: ExtendedErrorHandlerArgs) => Promise<void>;

export interface AnyErrorHandler extends ErrorHandler, ExtendedErrorHandler {}

// Used only in this file
type MessageEventMiddleware<CustomContext extends StringIndexed = StringIndexed> = Middleware<
  SlackEventMiddlewareArgs<'message'>,
  CustomContext
>;

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
export default class App<AppCustomContext extends StringIndexed = StringIndexed> {
  /** Slack Web API client */
  public client: WebClient;

  private clientOptions: WebClientOptions;

  // Some payloads don't have teamId anymore. So we use EnterpriseId in those scenarios
  private clients: { [teamOrEnterpriseId: string]: WebClientPool } = {};

  /** Receiver - ingests events from the Slack platform */
  private receiver: Receiver;

  /** Logger */
  public logger: Logger;

  /** Log Level */
  private logLevel: LogLevel;

  /** Authorize */
  private authorize!: Authorize<boolean>;

  /** Global middleware chain */
  private middleware: Middleware<AnyMiddlewareArgs>[];

  /** Listener middleware chains */
  private listeners: Middleware<AnyMiddlewareArgs>[][];

  private errorHandler: AnyErrorHandler;

  private axios: AxiosInstance;

  private installerOptions: HTTPReceiverOptions['installerOptions'];

  private socketMode: boolean;

  private developerMode: boolean;

  private extendedErrorHandler: boolean;

  private hasCustomErrorHandler: boolean;

  // used when deferInitialization is true
  private argToken?: string;

  // used when deferInitialization is true
  private argAuthorize?: Authorize;

  // used when deferInitialization is true
  private argAuthorization?: Authorization;

  private tokenVerificationEnabled: boolean;

  private initialized: boolean;

  private attachFunctionToken: boolean;

  public constructor({
    signingSecret = undefined,
    endpoints = undefined,
    port = undefined,
    customRoutes = undefined,
    agent = undefined,
    clientTls = undefined,
    receiver = undefined,
    convoStore = undefined,
    token = undefined,
    appToken = undefined,
    botId = undefined,
    botUserId = undefined,
    authorize = undefined,
    logger = undefined,
    logLevel = undefined,
    ignoreSelf = true,
    clientOptions = undefined,
    processBeforeResponse = false,
    signatureVerification = true,
    clientId = undefined,
    clientSecret = undefined,
    stateSecret = undefined,
    redirectUri = undefined,
    installationStore = undefined,
    scopes = undefined,
    installerOptions = undefined,
    socketMode = undefined,
    developerMode = false,
    tokenVerificationEnabled = true,
    extendedErrorHandler = false,
    deferInitialization = false,
    attachFunctionToken = true,
  }: AppOptions = {}) {
    /* ------------------------ Developer mode ----------------------------- */
    this.developerMode = developerMode;
    if (developerMode) {
      // Set logLevel to Debug in Developer Mode if one wasn't passed in
      this.logLevel = logLevel ?? LogLevel.DEBUG;
      // Set SocketMode to true if one wasn't passed in
      this.socketMode = socketMode ?? true;
    } else {
      // If devs aren't using Developer Mode or Socket Mode, set it to false
      this.socketMode = socketMode ?? false;
      // Set logLevel to Info if one wasn't passed in
      this.logLevel = logLevel ?? LogLevel.INFO;
    }

    /* ------------------------ Set logger ----------------------------- */
    if (typeof logger === 'undefined') {
      // Initialize with the default logger
      const consoleLogger = new ConsoleLogger();
      consoleLogger.setName('bolt-app');
      this.logger = consoleLogger;
    } else {
      this.logger = logger;
    }
    if (typeof this.logLevel !== 'undefined' && this.logger.getLevel() !== this.logLevel) {
      this.logger.setLevel(this.logLevel);
    }
    // Error-related properties used to later determine args passed into the error handler
    this.hasCustomErrorHandler = false;
    this.errorHandler = defaultErrorHandler(this.logger) as AnyErrorHandler;
    this.extendedErrorHandler = extendedErrorHandler;

    // Override token with functionBotAccessToken in function-related handlers
    this.attachFunctionToken = attachFunctionToken;

    /* ------------------------ Set client options ------------------------*/
    this.clientOptions = clientOptions !== undefined ? clientOptions : {};
    if (agent !== undefined && this.clientOptions.agent === undefined) {
      this.clientOptions.agent = agent;
    }
    if (clientTls !== undefined && this.clientOptions.tls === undefined) {
      this.clientOptions.tls = clientTls;
    }
    if (logLevel !== undefined && logger === undefined) {
      // only logLevel is passed
      this.clientOptions.logLevel = logLevel;
    } else {
      // Since v3.4, WebClient starts sharing logger with App
      this.clientOptions.logger = this.logger;
    }
    // The public WebClient instance (app.client)
    // Since v3.4, it can have the passed token in the case of single workspace installation.
    this.client = new WebClient(token, this.clientOptions);

    this.axios = axios.create({
      httpAgent: agent,
      httpsAgent: agent,
      // disabling axios' automatic proxy support:
      // axios would read from env vars to configure a proxy automatically, but it doesn't support TLS destinations.
      // for compatibility with https://api.slack.com, and for a larger set of possible proxies (SOCKS or other
      // protocols), users of this package should use the `agent` option to configure a proxy.
      proxy: false,
      ...clientTls,
    });

    this.middleware = [];
    this.listeners = [];

    // Add clientOptions to InstallerOptions to pass them to @slack/oauth
    this.installerOptions = {
      clientOptions: this.clientOptions,
      ...installerOptions,
    };
    if (socketMode && port !== undefined && this.installerOptions.port === undefined) {
      // SocketModeReceiver only uses a custom port number  when listening for the OAuth flow.
      // Therefore, only installerOptions.port is available in the constructor arguments.
      this.installerOptions.port = port;
    }

    if (
      this.developerMode &&
      this.installerOptions &&
      (typeof this.installerOptions.callbackOptions === 'undefined' ||
        (typeof this.installerOptions.callbackOptions !== 'undefined' &&
          typeof this.installerOptions.callbackOptions.failure === 'undefined'))
    ) {
      // add a custom failure callback for Developer Mode in case they are using OAuth
      this.logger.debug('adding Developer Mode custom OAuth failure handler');
      this.installerOptions.callbackOptions = {
        failure: (error, _installOptions, _req, res) => {
          this.logger.debug(error);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>OAuth failed!</h1><div>${escapeHtml(error.code)}</div></body></html>`);
        },
      };
    }

    this.receiver = this.initReceiver(
      receiver,
      signingSecret,
      endpoints,
      port,
      customRoutes,
      processBeforeResponse,
      signatureVerification,
      clientId,
      clientSecret,
      stateSecret,
      redirectUri,
      installationStore,
      scopes,
      appToken,
      logger,
    );

    /* ------------------------ Set authorize ----------------------------- */
    this.tokenVerificationEnabled = tokenVerificationEnabled;
    let argAuthorization: Authorization | undefined;
    if (token !== undefined) {
      argAuthorization = {
        botId,
        botUserId,
        botToken: token,
      };
    }
    if (deferInitialization) {
      this.argToken = token;
      this.argAuthorize = authorize;
      this.argAuthorization = argAuthorization;
      this.initialized = false;
      // You need to run `await app.init();` on your own
    } else {
      this.authorize = this.initAuthorizeInConstructor(token, authorize, argAuthorization);
      this.initialized = true;
    }

    // Conditionally use a global middleware that ignores events (including messages) that are sent from this app
    if (ignoreSelf) {
      this.use(ignoreSelfMiddleware);
    }

    // Use conversation state global middleware
    if (convoStore !== false) {
      // Use the memory store by default, or another store if provided
      const store: ConversationStore = convoStore === undefined ? new MemoryStore() : convoStore;
      this.use(conversationContext(store));
    }

    /* ------------------------ Initialize receiver ------------------------ */
    // Should be last to avoid exposing partially initialized app
    this.receiver.init(this);
  }

  public async init(): Promise<void> {
    this.initialized = true;
    try {
      const initializedAuthorize = this.initAuthorizeIfNoTokenIsGiven(this.argToken, this.argAuthorize);
      if (initializedAuthorize !== undefined) {
        this.authorize = initializedAuthorize;
        return;
      }
      if (this.argToken !== undefined && this.argAuthorization !== undefined) {
        let authorization = this.argAuthorization;
        if (this.tokenVerificationEnabled) {
          const authTestResult = await this.client.auth.test({ token: this.argToken });
          if (authTestResult.ok) {
            authorization = {
              botUserId: authTestResult.user_id as string,
              botId: authTestResult.bot_id as string,
              botToken: this.argToken,
            };
          }
        }
        this.authorize = singleAuthorization(this.client, authorization, this.tokenVerificationEnabled);
        this.initialized = true;
      } else {
        this.logger.error(
          'Something has gone wrong. Please report this issue to the maintainers. https://github.com/slackapi/bolt-js/issues',
        );
        assertNever();
      }
    } catch (e) {
      // Revert the flag change as the initialization failed
      this.initialized = false;
      throw e;
    }
  }

  public get webClientOptions(): WebClientOptions {
    return this.clientOptions;
  }

  /**
   * Register a new middleware, processed in the order registered.
   *
   * @param m global middleware function
   */
  public use<MiddlewareCustomContext extends StringIndexed = StringIndexed>(
    m: Middleware<AnyMiddlewareArgs, AppCustomContext & MiddlewareCustomContext>,
  ): this {
    this.middleware.push(m as Middleware<AnyMiddlewareArgs>);
    return this;
  }

  /**
   * Register Assistant middleware
   *
   * @param assistant global assistant middleware function
   */
  public assistant(assistant: Assistant): this {
    const m = assistant.getMiddleware();
    this.middleware.push(m);
    return this;
  }

  /**
   * Register WorkflowStep middleware
   *
   * @param workflowStep global workflow step middleware function
   * @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
   * version.
   */
  public step(workflowStep: WorkflowStep): this {
    const m = workflowStep.getMiddleware();
    this.middleware.push(m);
    return this;
  }

  /**
   * Register middleware for a workflow step.
   * @param callbackId Unique callback ID of a step.
   * @param [options] Configurations for the listener.
   * @param listeners Middleware handlers to call.
   * @see {@link https://tools.slack.dev/bolt-js/concepts/custom-steps}
   * @see {@link https://docs.slack.dev/workflows/creating-custom-steps-dynamic-options}
   */
  public function(
    callbackId: string,
    options: SlackEventMiddlewareArgsOptions,
    ...listeners: Middleware<SlackCustomFunctionMiddlewareArgs>[]
  ): this;
  public function(callbackId: string, ...listeners: Middleware<SlackCustomFunctionMiddlewareArgs>[]): this;
  public function(
    callbackId: string,
    ...optionOrListeners: (SlackEventMiddlewareArgsOptions | Middleware<SlackCustomFunctionMiddlewareArgs>)[]
  ): this {
    const options = isSlackEventMiddlewareArgsOptions(optionOrListeners[0])
      ? optionOrListeners[0]
      : { autoAcknowledge: true };
    const listeners = optionOrListeners.filter(
      (optionOrListener): optionOrListener is Middleware<SlackCustomFunctionMiddlewareArgs> => {
        return !isSlackEventMiddlewareArgsOptions(optionOrListener);
      },
    );

    const fn = new CustomFunction(callbackId, listeners, options);
    this.listeners.push(fn.getListeners());
    return this;
  }

  /**
   * Convenience method to call start on the receiver
   *
   * TODO: should replace HTTPReceiver in type definition with a generic that is constrained to Receiver
   *
   * @param args receiver-specific start arguments
   */
  public start(
    ...args: Parameters<HTTPReceiver['start'] | SocketModeReceiver['start']>
  ): ReturnType<HTTPReceiver['start']> {
    if (!this.initialized) {
      throw new AppInitializationError(
        'This App instance is not yet initialized. Call `await App#init()` before starting the app.',
      );
    }
    // TODO: HTTPReceiver['start'] should be the actual receiver's return type
    return this.receiver.start(...args) as ReturnType<HTTPReceiver['start']>;
  }

  // biome-ignore lint/suspicious/noExplicitAny: receivers could accept anything as arguments for stop
  public stop(...args: any[]): Promise<unknown> {
    return this.receiver.stop(...args);
  }

  // TODO: can constrain EventType here to the set of available slack event types to help autocomplete event names
  public event<EventType extends string = string, MiddlewareCustomContext extends StringIndexed = StringIndexed>(
    eventName: EventType,
    ...listeners: Middleware<SlackEventMiddlewareArgs<EventType>, AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  public event<EventType extends RegExp = RegExp, MiddlewareCustomContext extends StringIndexed = StringIndexed>(
    eventName: EventType,
    ...listeners: Middleware<SlackEventMiddlewareArgs<string>, AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  public event<
    EventType extends EventTypePattern = EventTypePattern,
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    eventNameOrPattern: EventType,
    ...listeners: Middleware<SlackEventMiddlewareArgs<string>, AppCustomContext & MiddlewareCustomContext>[]
  ): void {
    let invalidEventName = false;
    if (typeof eventNameOrPattern === 'string') {
      const name = eventNameOrPattern;
      invalidEventName = name.startsWith('message.');
    } else if (eventNameOrPattern instanceof RegExp) {
      const name = eventNameOrPattern.source;
      invalidEventName = name.startsWith('message\\.');
    }
    if (invalidEventName) {
      throw new AppInitializationError(
        `Although the document mentions "${eventNameOrPattern}", it is not a valid event type. Use "message" instead. If you want to filter message events, you can use event.channel_type for it.`,
      );
    }
    // biome-ignore lint/suspicious/noExplicitAny: FIXME: workaround for TypeScript 4.7 breaking changes
    const _listeners = listeners as any;
    this.listeners.push([
      onlyEvents,
      matchEventType(eventNameOrPattern),
      ..._listeners,
    ] as Middleware<AnyMiddlewareArgs>[]);
  }

  /**
   *
   * @param listeners Middlewares that process and react to a message event
   */
  public message<MiddlewareCustomContext extends StringIndexed = StringIndexed>(
    ...listeners: MessageEventMiddleware<AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  /**
   *
   * @param pattern Used for filtering out messages that don't match.
   * Strings match via {@link String.prototype.includes}.
   * @param listeners Middlewares that process and react to the message events that matched the provided patterns.
   */
  public message<MiddlewareCustomContext extends StringIndexed = StringIndexed>(
    pattern: string | RegExp,
    ...listeners: MessageEventMiddleware<AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  /**
   *
   * @param filter Middleware that can filter out messages. Generally this is done by returning before
   * calling {@link AllMiddlewareArgs.next} if there is no match. See {@link directMention} for an example.
   * @param pattern Used for filtering out messages that don't match the pattern. Strings match
   * via {@link String.prototype.includes}.
   * @param listeners Middlewares that process and react to the message events that matched the provided pattern.
   */
  public message<MiddlewareCustomContext extends StringIndexed = StringIndexed>(
    filter: MessageEventMiddleware<AppCustomContext & MiddlewareCustomContext>,
    pattern: string | RegExp,
    ...listeners: MessageEventMiddleware<AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  /**
   *
   * @param filter Middleware that can filter out messages. Generally this is done by returning before calling
   * {@link AllMiddlewareArgs.next} if there is no match. See {@link directMention} for an example.
   * @param listeners Middlewares that process and react to the message events that matched the provided patterns.
   */
  public message<MiddlewareCustomContext extends StringIndexed = StringIndexed>(
    filter: MessageEventMiddleware, // TODO: why do we need this override? shouldnt ...listeners capture this too?
    ...listeners: MessageEventMiddleware<AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  /**
   * This allows for further control of the filtering and response logic. Patterns and middlewares are processed in
   * the order provided. If any patterns do not match, or a middleware does not call {@link AllMiddlewareArgs.next},
   * all remaining patterns and middlewares will be skipped.
   * @param patternsOrMiddleware A mix of patterns and/or middlewares.
   */
  public message<MiddlewareCustomContext extends StringIndexed = StringIndexed>(
    ...patternsOrMiddleware: (string | RegExp | MessageEventMiddleware<AppCustomContext & MiddlewareCustomContext>)[]
  ): void;
  // TODO: expose a type parameter for overriding the MessageEvent type (just like shortcut() and action() does) https://github.com/slackapi/bolt-js/issues/796
  public message<MiddlewareCustomContext extends StringIndexed = StringIndexed>(
    ...patternsOrMiddleware: (string | RegExp | MessageEventMiddleware<AppCustomContext & MiddlewareCustomContext>)[]
  ): void {
    const messageMiddleware = patternsOrMiddleware.map((patternOrMiddleware) => {
      if (typeof patternOrMiddleware === 'string' || util.types.isRegExp(patternOrMiddleware)) {
        return matchMessage(patternOrMiddleware);
      }
      return patternOrMiddleware;
      // biome-ignore lint/suspicious/noExplicitAny: FIXME: workaround for TypeScript 4.7 breaking changes
    }) as any;

    this.listeners.push([
      onlyEvents,
      matchEventType('message'),
      ...messageMiddleware,
    ] as Middleware<AnyMiddlewareArgs>[]);
  }

  public shortcut<
    Shortcut extends SlackShortcut = SlackShortcut,
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    callbackId: string | RegExp,
    ...listeners: Middleware<SlackShortcutMiddlewareArgs<Shortcut>, AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  public shortcut<
    Shortcut extends SlackShortcut = SlackShortcut,
    Constraints extends ShortcutConstraints<Shortcut> = ShortcutConstraints<Shortcut>,
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    constraints: Constraints,
    ...listeners: Middleware<
      SlackShortcutMiddlewareArgs<Extract<Shortcut, { type: Constraints['type'] }>>,
      AppCustomContext & MiddlewareCustomContext
    >[]
  ): void;
  public shortcut<
    Shortcut extends SlackShortcut = SlackShortcut,
    Constraints extends ShortcutConstraints<Shortcut> = ShortcutConstraints<Shortcut>,
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    callbackIdOrConstraints: string | RegExp | Constraints,
    ...listeners: Middleware<
      SlackShortcutMiddlewareArgs<Extract<Shortcut, { type: Constraints['type'] }>>,
      AppCustomContext & MiddlewareCustomContext
    >[]
  ): void {
    const constraints: ShortcutConstraints =
      typeof callbackIdOrConstraints === 'string' || util.types.isRegExp(callbackIdOrConstraints)
        ? { callback_id: callbackIdOrConstraints }
        : callbackIdOrConstraints;

    // Fail early if the constraints contain invalid keys
    const unknownConstraintKeys = Object.keys(constraints).filter((k) => k !== 'callback_id' && k !== 'type');
    if (unknownConstraintKeys.length > 0) {
      // TODO:event() will throw an error if you provide an invalid event name; we should align this behaviour.
      this.logger.error(
        `Slack listener cannot be attached using unknown constraint keys: ${unknownConstraintKeys.join(', ')}`,
      );
      return;
    }

    // biome-ignore lint/suspicious/noExplicitAny: FIXME: workaround for TypeScript 4.7 breaking changes
    const _listeners = listeners as any;
    this.listeners.push([
      onlyShortcuts,
      matchConstraints(constraints),
      ..._listeners,
    ] as Middleware<AnyMiddlewareArgs>[]);
  }

  public action<
    Action extends SlackAction = SlackAction,
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    actionId: string | RegExp,
    ...listeners: Middleware<SlackActionMiddlewareArgs<Action>, AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  public action<
    Action extends SlackAction = SlackAction,
    Constraints extends ActionConstraints<Action> = ActionConstraints<Action>,
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    constraints: Constraints,
    // NOTE: Extract<> is able to return the whole union when type: undefined. Why?
    ...listeners: Middleware<
      SlackActionMiddlewareArgs<Extract<Action, { type: Constraints['type'] }>>,
      AppCustomContext & MiddlewareCustomContext
    >[]
  ): void;
  public action<
    Action extends SlackAction = SlackAction,
    Constraints extends ActionConstraints<Action> = ActionConstraints<Action>,
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    actionIdOrConstraints: string | RegExp | Constraints,
    ...listeners: Middleware<
      SlackActionMiddlewareArgs<Extract<Action, { type: Constraints['type'] }>>,
      AppCustomContext & MiddlewareCustomContext
    >[]
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
      // TODO:event() will throw an error if you provide an invalid event name; we should align this behaviour.
      this.logger.error(
        `Action listener cannot be attached using unknown constraint keys: ${unknownConstraintKeys.join(', ')}`,
      );
      return;
    }

    // biome-ignore lint/suspicious/noExplicitAny: FIXME: workaround for TypeScript 4.7 breaking changes
    const _listeners = listeners as any;
    this.listeners.push([onlyActions, matchConstraints(constraints), ..._listeners] as Middleware<AnyMiddlewareArgs>[]);
  }

  public command<MiddlewareCustomContext extends StringIndexed = StringIndexed>(
    commandName: string | RegExp,
    ...listeners: Middleware<SlackCommandMiddlewareArgs, AppCustomContext & MiddlewareCustomContext>[]
  ): void {
    // biome-ignore lint/suspicious/noExplicitAny: FIXME: workaround for TypeScript 4.7 breaking changes
    const _listeners = listeners as any;
    this.listeners.push([
      onlyCommands,
      matchCommandName(commandName),
      ..._listeners,
    ] as Middleware<AnyMiddlewareArgs>[]);
  }

  public options<
    Source extends OptionsSource = 'block_suggestion', // TODO: here, similarly to `message()`, the generic is the string `type` of the payload. in others, like `action()`, it's the entire payload. could we make this consistent?
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    actionId: string | RegExp,
    ...listeners: Middleware<SlackOptionsMiddlewareArgs<Source>, AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  // TODO: reflect the type in constraints to Source (this relates to the above TODO, too)
  public options<
    Source extends OptionsSource = OptionsSource,
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    constraints: OptionsConstraints, // TODO: to be able to 'link' listener arguments to the constrains, should pass the Source type in as a generic here
    ...listeners: Middleware<SlackOptionsMiddlewareArgs<Source>, AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  // TODO: reflect the type in constraints to Source
  public options<
    Source extends OptionsSource = OptionsSource,
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    actionIdOrConstraints: string | RegExp | OptionsConstraints,
    ...listeners: Middleware<SlackOptionsMiddlewareArgs<Source>, AppCustomContext & MiddlewareCustomContext>[]
  ): void {
    const constraints: OptionsConstraints =
      typeof actionIdOrConstraints === 'string' || util.types.isRegExp(actionIdOrConstraints)
        ? { action_id: actionIdOrConstraints }
        : actionIdOrConstraints;

    // biome-ignore lint/suspicious/noExplicitAny: FIXME: workaround for TypeScript 4.7 breaking changes
    const _listeners = listeners as any;
    this.listeners.push([onlyOptions, matchConstraints(constraints), ..._listeners] as Middleware<AnyMiddlewareArgs>[]);
  }

  public view<
    ViewActionType extends SlackViewAction = SlackViewAction,
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    callbackId: string | RegExp,
    ...listeners: Middleware<SlackViewMiddlewareArgs<ViewActionType>, AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  public view<
    ViewActionType extends SlackViewAction = SlackViewAction,
    // TODO: add a type parameter for view constraints; this way we can constrain the handler view arguments based on the type of the constraint, similar to what action() does
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    constraints: ViewConstraints,
    ...listeners: Middleware<SlackViewMiddlewareArgs<ViewActionType>, AppCustomContext & MiddlewareCustomContext>[]
  ): void;
  public view<
    ViewActionType extends SlackViewAction = SlackViewAction,
    MiddlewareCustomContext extends StringIndexed = StringIndexed,
  >(
    callbackIdOrConstraints: string | RegExp | ViewConstraints,
    ...listeners: Middleware<SlackViewMiddlewareArgs<ViewActionType>, AppCustomContext & MiddlewareCustomContext>[]
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

    // biome-ignore lint/suspicious/noExplicitAny: FIXME: workaround for TypeScript 4.7 breaking changes
    const _listeners = listeners as any;
    this.listeners.push([
      onlyViewActions,
      matchConstraints(constraints),
      ..._listeners,
    ] as Middleware<AnyMiddlewareArgs>[]);
  }

  // Error handler args dependent on extendedErrorHandler property
  public error(errorHandler: ErrorHandler): void;
  public error(errorHandler: ExtendedErrorHandler): void;
  public error(errorHandler: AnyErrorHandler): void {
    this.errorHandler = errorHandler;
    this.hasCustomErrorHandler = true;
  }

  /**
   * Handles events from the receiver
   */
  public async processEvent(event: ReceiverEvent): Promise<void> {
    const { body, ack } = event;

    if (this.developerMode) {
      // log the body of the event
      // this may contain sensitive info like tokens
      this.logger.debug(JSON.stringify(body));
    }

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

    // Check if type event with the authorizations object or if it has a top level is_enterprise_install property
    const isEnterpriseInstall = isBodyWithTypeEnterpriseInstall(bodyArg, type);
    const source = buildSource(type, conversationId, bodyArg, isEnterpriseInstall);

    let authorizeResult: AuthorizeResult;
    if (type === IncomingEventType.Event && isEventTypeToSkipAuthorize(event)) {
      authorizeResult = {
        enterpriseId: source.enterpriseId,
        teamId: source.teamId,
      };
    } else {
      try {
        authorizeResult = await this.authorize(source, bodyArg);
      } catch (error) {
        // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
        const e = error as any;
        this.logger.warn('Authorization of incoming event did not succeed. No listeners will be called.');
        e.code = ErrorCode.AuthorizationError;
        return this.handleError({
          error: e,
          logger: this.logger,
          body: bodyArg,
          context: {
            isEnterpriseInstall,
          },
        });
      }
    }

    // Try to set userId from AuthorizeResult before using one from source
    if (authorizeResult.userId === undefined && source.userId !== undefined) {
      authorizeResult.userId = source.userId;
    }

    // Try to set teamId from AuthorizeResult before using one from source
    if (authorizeResult.teamId === undefined && source.teamId !== undefined) {
      authorizeResult.teamId = source.teamId;
    }

    // Try to set enterpriseId from AuthorizeResult before using one from source
    if (authorizeResult.enterpriseId === undefined && source.enterpriseId !== undefined) {
      authorizeResult.enterpriseId = source.enterpriseId;
    }

    if (typeof event.customProperties !== 'undefined') {
      const customProps: StringIndexed = event.customProperties;
      const builtinKeyDetected = contextBuiltinKeys.find((key) => key in customProps);
      if (typeof builtinKeyDetected !== 'undefined') {
        throw new InvalidCustomPropertyError('customProperties cannot have the same names with the built-in ones');
      }
    }

    const context: Context = {
      ...authorizeResult,
      ...event.customProperties,
      isEnterpriseInstall,
      retryNum: event.retryNum,
      retryReason: event.retryReason,
    };

    // Extract function-related information and augment context
    const { functionExecutionId, functionBotAccessToken, functionInputs } = extractFunctionContext(body);
    if (functionExecutionId) {
      context.functionExecutionId = functionExecutionId;
      if (functionInputs) {
        context.functionInputs = functionInputs;
      }
      if (functionBotAccessToken) {
        context.functionBotAccessToken = functionBotAccessToken;
      }
    }

    // Factory for say() utility
    // TODO: could this be move out of processEvent, use the same token from below or perhaps even a client from the pool
    const createSay = (channelId: string): SayFn => {
      const token = selectToken(context, this.attachFunctionToken);
      return (message) => {
        let postMessageArguments: ChatPostMessageArguments;
        if (typeof message === 'string') {
          postMessageArguments = { token, text: message, channel: channelId };
        } else {
          postMessageArguments = { ...message, token, channel: channelId };
        }

        return this.client.chat.postMessage(postMessageArguments);
      };
    };

    // Set body and payload
    // TODO: this value should eventually conform to AnyMiddlewareArgs
    // TODO: remove workflow step stuff in bolt v5
    // TODO: can we instead use type predicates in these switch cases to allow for narrowing of the body simultaneously? we have isEvent, isView, isShortcut, isAction already in types/utilities / helpers
    let payload:
      | DialogSubmitAction
      | WorkflowStepEdit
      | SlackShortcut
      | KnownEventFromType<string>
      | SlashCommand
      | KnownOptionsPayloadFromType<string>
      | BlockElementAction
      | ViewOutput
      | InteractiveAction;
    switch (type) {
      case IncomingEventType.Event:
        payload = (bodyArg as SlackEventMiddlewareArgs['body']).event;
        break;
      case IncomingEventType.ViewAction:
        payload = (bodyArg as SlackViewMiddlewareArgs['body']).view;
        break;
      case IncomingEventType.Shortcut:
        payload = bodyArg as SlackShortcutMiddlewareArgs['body'];
        break;
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: usually not great, but we do it here
      case IncomingEventType.Action:
        if (isBlockActionOrInteractiveMessageBody(bodyArg as SlackActionMiddlewareArgs['body'])) {
          const { actions } = bodyArg as SlackActionMiddlewareArgs<BlockAction | InteractiveMessage>['body'];
          [payload] = actions;
          break;
        }
      // If above conditional does not hit, fall through to fallback payload in default block below
      default:
        payload = bodyArg as (
          | Exclude<AnyMiddlewareArgs, SlackEventMiddlewareArgs | SlackActionMiddlewareArgs | SlackViewMiddlewareArgs>
          | SlackActionMiddlewareArgs<Exclude<SlackAction, BlockAction | InteractiveMessage>>
        )['body'];
        break;
    }
    // NOTE: the following doesn't work because... distributive?
    // const listenerArgs: Partial<AnyMiddlewareArgs> = {
    const listenerArgs: Pick<AnyMiddlewareArgs, 'body' | 'payload'> & {
      /** Say function might be set below */
      say?: SayFn;
      /** Respond function might be set below */
      respond?: RespondFn;
      /** Ack function might be set below */
      // biome-ignore lint/suspicious/noExplicitAny: different kinds of acks accept different arguments, TODO: revisit this to see if we can type better
      ack?: AckFn<any>;
      complete?: FunctionCompleteFn;
      fail?: FunctionFailFn;
      inputs?: FunctionInputs;
    } = {
      body: bodyArg,
      payload,
    };

    // Get the client arg
    let { client } = this;

    const token = selectToken(context, this.attachFunctionToken);

    // TODO: this logic should be isolated and tested according to the expected behavior
    if (token !== undefined) {
      let pool: WebClientPool | undefined = undefined;
      const clientOptionsCopy = { ...this.clientOptions };
      if (authorizeResult.teamId !== undefined) {
        pool = this.clients[authorizeResult.teamId];
        if (pool === undefined) {
          pool = this.clients[authorizeResult.teamId] = new WebClientPool();
        }
        // Add teamId to clientOptions so it can be automatically added to web-api calls
        clientOptionsCopy.teamId = authorizeResult.teamId;
      } else if (authorizeResult.enterpriseId !== undefined) {
        pool = this.clients[authorizeResult.enterpriseId];
        if (pool === undefined) {
          pool = this.clients[authorizeResult.enterpriseId] = new WebClientPool();
        }
      }

      if (this.attachFunctionToken && context.functionBotAccessToken) {
        // workflow tokens are always unique, they should not be added to the pool
        client = new WebClient(token, clientOptionsCopy);
      } else if (pool !== undefined) {
        client = pool.getOrCreate(token, clientOptionsCopy);
      }
    }

    // TODO: can we instead use type predicates in these switch cases to allow for narrowing of the body simultaneously? we have isEvent, isView, isShortcut, isAction already in types/utilities / helpers
    // Set aliases
    if (type === IncomingEventType.Event) {
      // TODO: assigning eventListenerArgs by reference to set properties of listenerArgs is error prone, there should be a better way to do this!
      const eventListenerArgs = listenerArgs as SlackEventMiddlewareArgs;
      eventListenerArgs.event = eventListenerArgs.payload;
      if (eventListenerArgs.event.type === 'message') {
        const messageEventListenerArgs = eventListenerArgs as SlackEventMiddlewareArgs<'message'>;
        messageEventListenerArgs.message = messageEventListenerArgs.payload;
      }
      // Add complete() and fail() utilities for function-related interactivity
      if (eventListenerArgs.event.type === 'function_executed') {
        listenerArgs.complete = createFunctionComplete(context, client);
        listenerArgs.fail = createFunctionFail(context, client);
        listenerArgs.inputs = eventListenerArgs.event.inputs;
      }
    } else if (type === IncomingEventType.Action) {
      const actionListenerArgs = listenerArgs as SlackActionMiddlewareArgs;
      actionListenerArgs.action = actionListenerArgs.payload;
      // Add complete() and fail() utilities for function-related interactivity
      if (context.functionExecutionId !== undefined) {
        listenerArgs.complete = createFunctionComplete(context, client);
        listenerArgs.fail = createFunctionFail(context, client);
        listenerArgs.inputs = context.functionInputs;
      }
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
      listenerArgs.respond = buildRespondFn(this.axios, body.response_url);
    } else if (typeof body.response_urls !== 'undefined' && body.response_urls.length > 0) {
      // This can exist only when view_submission payloads - response_url_enabled: true
      listenerArgs.respond = buildRespondFn(this.axios, body.response_urls[0].response_url);
    }

    // Set ack() utility
    if (type !== IncomingEventType.Event) {
      listenerArgs.ack = ack;
    } else {
      const eventListenerArgs = listenerArgs as unknown as SlackEventMiddlewareArgs;
      if (eventListenerArgs.event?.type === 'function_executed') {
        listenerArgs.ack = ack;
      } else {
        // Events API requests are acknowledged right away, since there's no data expected
        // Except function_executed events since ack can be handled by the user
        await ack();
      }
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

            // Don't process the last item in the listenerMiddleware array - it will be passed a no-op next fn
            const listener = listenerMiddleware.pop();

            if (listener === undefined) {
              return undefined;
            }
            return processMiddleware(
              listenerMiddleware,
              listenerArgs as AnyMiddlewareArgs,
              context,
              client,
              this.logger,
              // When all the listener middleware are done processing,
              // `listener` here will be called with a noop `next` fn
              async () =>
                listener({
                  ...(listenerArgs as AnyMiddlewareArgs),
                  context,
                  client,
                  logger: this.logger,
                  next: () => {},
                } as AnyMiddlewareArgs & AllMiddlewareArgs),
            );
          });

          const settledListenerResults = await Promise.allSettled(listenerResults);
          const rejectedListenerResults = settledListenerResults.filter(isRejected);
          if (rejectedListenerResults.length === 1) {
            throw rejectedListenerResults[0].reason;
            // biome-ignore lint/style/noUselessElse: I think this is a biome issue actually...
          } else if (rejectedListenerResults.length > 1) {
            throw new MultipleListenerError(rejectedListenerResults.map((rlr) => rlr.reason));
          }
        },
      );
    } catch (error) {
      // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
      const e = error as any;
      return this.handleError({
        context,
        error: e,
        logger: this.logger,
        body: bodyArg,
      });
    }
  }

  /**
   * Global error handler. The final destination for all errors (hopefully).
   */
  private handleError(args: AllErrorHandlerArgs): Promise<void> {
    const { error, ...rest } = args;

    return this.extendedErrorHandler && this.hasCustomErrorHandler
      ? this.errorHandler({ error: asCodedError(error), ...rest })
      : this.errorHandler(asCodedError(error));
  }

  // ---------------------
  // Private methods for initialization
  // ---------------------

  private initReceiver(
    receiver?: Receiver,
    signingSecret?: HTTPReceiverOptions['signingSecret'],
    endpoints?: HTTPReceiverOptions['endpoints'],
    port?: HTTPReceiverOptions['port'],
    customRoutes?: HTTPReceiverOptions['customRoutes'],
    processBeforeResponse?: HTTPReceiverOptions['processBeforeResponse'],
    signatureVerification?: HTTPReceiverOptions['signatureVerification'],
    clientId?: HTTPReceiverOptions['clientId'],
    clientSecret?: HTTPReceiverOptions['clientSecret'],
    stateSecret?: HTTPReceiverOptions['stateSecret'],
    redirectUri?: HTTPReceiverOptions['redirectUri'],
    installationStore?: HTTPReceiverOptions['installationStore'],
    scopes?: HTTPReceiverOptions['scopes'],
    appToken?: string,
    logger?: Logger,
  ): Receiver {
    if (receiver !== undefined) {
      // Custom receiver supplied
      if (this.socketMode === true && !(receiver instanceof SocketModeReceiver)) {
        throw new AppInitializationError('You cannot supply a custom receiver when socketMode is set to true.');
      }
      return receiver;
    }
    if (this.socketMode === true) {
      if (appToken === undefined) {
        throw new AppInitializationError(
          'You must provide an appToken when socketMode is set to true. To generate an appToken see: https://api.slack.com/apis/connections/socket#token',
        );
      }
      this.logger.debug('Initializing SocketModeReceiver');
      return new SocketModeReceiver({
        appToken,
        clientId,
        clientSecret,
        stateSecret,
        redirectUri,
        installationStore,
        scopes,
        logger,
        logLevel: this.logLevel,
        installerOptions: this.installerOptions,
        customRoutes,
      });
    }
    if (signatureVerification === true && signingSecret === undefined) {
      // Using default receiver HTTPReceiver, signature verification enabled, missing signingSecret
      throw new AppInitializationError(
        'signingSecret is required to initialize the default receiver. Set signingSecret or use a ' +
          'custom receiver. You can find your Signing Secret in your Slack App Settings.',
      );
    }
    this.logger.debug('Initializing HTTPReceiver');
    return new HTTPReceiver({
      signingSecret: signingSecret || '',
      endpoints,
      port,
      customRoutes,
      processBeforeResponse,
      signatureVerification,
      clientId,
      clientSecret,
      stateSecret,
      redirectUri,
      installationStore,
      scopes,
      logger,
      logLevel: this.logLevel,
      installerOptions: this.installerOptions,
    });
  }

  private initAuthorizeIfNoTokenIsGiven(token?: string, authorize?: Authorize): Authorize<boolean> | undefined {
    let usingOauth = false;
    const httpReceiver = this.receiver as HTTPReceiver;
    if (httpReceiver.installer !== undefined && httpReceiver.installer.authorize !== undefined) {
      // This supports using the built-in HTTPReceiver, declaring your own HTTPReceiver
      // and theoretically, doing a fully custom (non-Express.js) receiver that implements OAuth
      usingOauth = true;
    }

    if (token !== undefined) {
      if (usingOauth || authorize !== undefined) {
        throw new AppInitializationError(
          `You cannot provide a token along with either oauth installer options or authorize. ${tokenUsage}`,
        );
      }
      return undefined;
    }

    if (authorize === undefined && !usingOauth) {
      throw new AppInitializationError(
        `${tokenUsage} \n\nSince you have not provided a token or authorize, you might be missing one or more required oauth installer options. See https://tools.slack.dev/bolt-js/concepts/authenticating-oauth/ for these required fields.\n`,
      );
      // biome-ignore lint/style/noUselessElse: I think this is a biome issue actually...
    } else if (authorize !== undefined && usingOauth) {
      throw new AppInitializationError(`You cannot provide both authorize and oauth installer options. ${tokenUsage}`);
      // biome-ignore lint/style/noUselessElse: I think this is a biome issue actually...
    } else if (authorize === undefined && usingOauth) {
      // biome-ignore lint/style/noNonNullAssertion: we know installer is truthy here
      return httpReceiver.installer!.authorize;
      // biome-ignore lint/style/noUselessElse: I think this is a biome issue actually...
    } else if (authorize !== undefined && !usingOauth) {
      return authorize as Authorize<boolean>;
    }
    return undefined;
  }

  private initAuthorizeInConstructor(
    token?: string,
    authorize?: Authorize<boolean>,
    authorization?: Authorization,
  ): Authorize<boolean> {
    const initializedAuthorize = this.initAuthorizeIfNoTokenIsGiven(token, authorize);
    if (initializedAuthorize !== undefined) {
      return initializedAuthorize;
    }
    if (token !== undefined && authorization !== undefined) {
      return singleAuthorization(this.client, authorization, this.tokenVerificationEnabled);
    }
    const hasToken = token !== undefined && token.length > 0;
    const errorMessage = `Something has gone wrong in #initAuthorizeInConstructor method (hasToken: ${hasToken}, authorize: ${authorize}). Please report this issue to the maintainers. https://github.com/slackapi/bolt-js/issues`;
    this.logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

function defaultErrorHandler(logger: Logger): ErrorHandler {
  return (error: CodedError) => {
    logger.error(error);

    return Promise.reject(error);
  };
}

// -----------
// singleAuthorization

function runAuthTestForBotToken(
  client: WebClient,
  authorization: Partial<AuthorizeResult> & { botToken: Required<AuthorizeResult>['botToken'] },
): Promise<{ botUserId: string; botId: string }> {
  // TODO: warn when something needed isn't found
  return authorization.botUserId !== undefined && authorization.botId !== undefined
    ? Promise.resolve({ botUserId: authorization.botUserId, botId: authorization.botId })
    : client.auth.test({ token: authorization.botToken }).then((result) => ({
        botUserId: result.user_id as string,
        botId: result.bot_id as string,
      }));
}

// the shortened type, which is supposed to be used only in this source file
type Authorization = Partial<AuthorizeResult> & { botToken: Required<AuthorizeResult>['botToken'] };

async function buildAuthorizeResult(
  isEnterpriseInstall: boolean,
  authTestResult: Promise<{ botUserId: string; botId: string }>,
  authorization: Authorization,
): Promise<AuthorizeResult> {
  return { isEnterpriseInstall, botToken: authorization.botToken, ...(await authTestResult) };
}

function singleAuthorization(
  client: WebClient,
  authorization: Authorization,
  tokenVerificationEnabled: boolean,
): Authorize<boolean> {
  // As Authorize function has a reference to this local variable,
  // this local variable can behave as auth.test call result cache for the function
  let cachedAuthTestResult: Promise<{ botUserId: string; botId: string }>;
  if (tokenVerificationEnabled) {
    // call auth.test immediately
    cachedAuthTestResult = runAuthTestForBotToken(client, authorization);
    return async ({ isEnterpriseInstall }) =>
      buildAuthorizeResult(isEnterpriseInstall, cachedAuthTestResult, authorization);
  }
  return async ({ isEnterpriseInstall }) => {
    // hold off calling auth.test API until the first access to authorize function
    cachedAuthTestResult = runAuthTestForBotToken(client, authorization);
    return buildAuthorizeResult(isEnterpriseInstall, cachedAuthTestResult, authorization);
  };
}

// ----------------------------
// For processEvent method

/**
 * Helper which builds the data structure the authorize hook uses to provide tokens for the context.
 */
function buildSource<IsEnterpriseInstall extends boolean>(
  type: IncomingEventType,
  channelId: string | undefined,
  body: AnyMiddlewareArgs['body'],
  isEnterpriseInstall: IsEnterpriseInstall,
): AuthorizeSourceData<IsEnterpriseInstall> {
  // NOTE: potentially something that can be optimized, so that each of these conditions isn't evaluated more than once.
  // if this makes it prettier, great! but we should probably check perf before committing to any specific optimization.

  const teamId: string | undefined = (() => {
    if (type === IncomingEventType.Event) {
      const bodyAsEvent = body as SlackEventMiddlewareArgs['body'];
      if (
        Array.isArray(bodyAsEvent.authorizations) &&
        bodyAsEvent.authorizations[0] !== undefined &&
        bodyAsEvent.authorizations[0].team_id !== null
      ) {
        return bodyAsEvent.authorizations[0].team_id;
      }
      return bodyAsEvent.team_id;
    }

    if (type === IncomingEventType.Command) {
      return (body as SlackCommandMiddlewareArgs['body']).team_id;
    }

    const parseTeamId = (
      bodyAs: SlackAction | SlackViewAction | SlackShortcut | KnownOptionsPayloadFromType<OptionsSource>,
    ): string | undefined => {
      // When the app is installed using org-wide deployment, team property will be null
      if (typeof bodyAs.team !== 'undefined' && bodyAs.team !== null) {
        return bodyAs.team.id;
      }

      // This is the only place where this function might return undefined
      return bodyAs.user.team_id;
    };

    if (type === IncomingEventType.ViewAction) {
      // view_submission/closed payloads can have `view.app_installed_team_id` when a modal view that was opened
      // in a different workspace via some operations inside a Slack Connect channel.

      const bodyAsView = body as SlackViewMiddlewareArgs['body'];

      if (bodyAsView.view.app_installed_team_id) {
        return bodyAsView.view.app_installed_team_id;
      }

      return parseTeamId(bodyAsView);
    }

    if (
      type === IncomingEventType.Action ||
      type === IncomingEventType.Options ||
      type === IncomingEventType.Shortcut
    ) {
      const bodyAsActionOrOptionsOrShortcut = body as (
        | SlackActionMiddlewareArgs
        | SlackOptionsMiddlewareArgs
        | SlackShortcutMiddlewareArgs
      )['body'];
      return parseTeamId(bodyAsActionOrOptionsOrShortcut);
    }

    return assertNever(type);
  })();

  const enterpriseId: string | undefined = (() => {
    if (type === IncomingEventType.Event) {
      const bodyAsEvent = body as SlackEventMiddlewareArgs['body'];
      if (Array.isArray(bodyAsEvent.authorizations) && bodyAsEvent.authorizations[0] !== undefined) {
        // The enterprise_id here can be null when the workspace is not in an Enterprise Grid
        const theId = bodyAsEvent.authorizations[0].enterprise_id;
        return theId !== null ? theId : undefined;
      }
      return bodyAsEvent.enterprise_id;
    }

    if (type === IncomingEventType.Command) {
      return (body as SlackCommandMiddlewareArgs['body']).enterprise_id;
    }

    if (
      type === IncomingEventType.Action ||
      type === IncomingEventType.Options ||
      type === IncomingEventType.ViewAction ||
      type === IncomingEventType.Shortcut
    ) {
      // NOTE: no type system backed exhaustiveness check within this group of incoming event types
      const bodyAsActionOrOptionsOrViewActionOrShortcut = body as (
        | SlackActionMiddlewareArgs
        | SlackOptionsMiddlewareArgs
        | SlackViewMiddlewareArgs
        | SlackShortcutMiddlewareArgs
      )['body'];

      if (
        typeof bodyAsActionOrOptionsOrViewActionOrShortcut.enterprise !== 'undefined' &&
        bodyAsActionOrOptionsOrViewActionOrShortcut.enterprise !== null
      ) {
        return bodyAsActionOrOptionsOrViewActionOrShortcut.enterprise.id;
      }

      // When the app is installed using org-wide deployment, team property will be null
      if (
        typeof bodyAsActionOrOptionsOrViewActionOrShortcut.team !== 'undefined' &&
        bodyAsActionOrOptionsOrViewActionOrShortcut.team !== null
      ) {
        return bodyAsActionOrOptionsOrViewActionOrShortcut.team.enterprise_id;
      }

      return undefined;
    }

    return assertNever(type);
  })();

  const userId: string | undefined = (() => {
    if (type === IncomingEventType.Event) {
      // NOTE: no type system backed exhaustiveness check within this incoming event type
      const { event } = body as SlackEventMiddlewareArgs['body'];
      if ('user' in event) {
        if (typeof event.user === 'string') {
          return event.user;
        }
        if (typeof event.user === 'object') {
          return event.user.id;
        }
      }
      if ('channel' in event && typeof event.channel !== 'string' && 'creator' in event.channel) {
        return event.channel.creator;
      }
      if ('subteam' in event && event.subteam.created_by !== undefined) {
        return event.subteam.created_by;
      }
      return undefined;
    }

    if (
      type === IncomingEventType.Action ||
      type === IncomingEventType.Options ||
      type === IncomingEventType.ViewAction ||
      type === IncomingEventType.Shortcut
    ) {
      // NOTE: no type system backed exhaustiveness check within this incoming event type
      const bodyAsActionOrOptionsOrViewActionOrShortcut = body as (
        | SlackActionMiddlewareArgs
        | SlackOptionsMiddlewareArgs
        | SlackViewMiddlewareArgs
        | SlackShortcutMiddlewareArgs
      )['body'];
      return bodyAsActionOrOptionsOrViewActionOrShortcut.user.id;
    }

    if (type === IncomingEventType.Command) {
      return (body as SlackCommandMiddlewareArgs['body']).user_id;
    }

    return assertNever(type);
  })();

  return {
    userId,
    isEnterpriseInstall,
    teamId: teamId as IsEnterpriseInstall extends true ? string | undefined : string,
    enterpriseId: enterpriseId as IsEnterpriseInstall extends true ? string : string | undefined,
    conversationId: channelId,
  };
}

function isBlockActionOrInteractiveMessageBody(
  body: SlackActionMiddlewareArgs['body'],
): body is SlackActionMiddlewareArgs<BlockAction | InteractiveMessage>['body'] {
  return (body as SlackActionMiddlewareArgs<BlockAction | InteractiveMessage>['body']).actions !== undefined;
}

// Returns either a bot token, a user token or a workflow token for client, say()
function selectToken(context: Context, attachFunctionToken: boolean): string | undefined {
  if (attachFunctionToken && context.functionBotAccessToken) {
    return context.functionBotAccessToken;
  }
  return context.botToken !== undefined ? context.botToken : context.userToken;
}

function buildRespondFn(
  axiosInstance: AxiosInstance,
  responseUrl: string,
): (response: string | RespondArguments) => Promise<AxiosResponse> {
  return async (message: string | RespondArguments) => {
    const normalizedArgs: RespondArguments = typeof message === 'string' ? { text: message } : message;
    return axiosInstance.post(responseUrl, normalizedArgs);
  };
}

function escapeHtml(input: string | undefined | null): string {
  if (input) {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  return '';
}

function extractFunctionContext(body: StringIndexed) {
  let functionExecutionId: string | undefined = undefined;
  let functionBotAccessToken: string | undefined = undefined;
  let functionInputs: FunctionInputs | undefined = undefined;

  // function_executed event
  if (body.event && body.event.type === 'function_executed' && body.event.function_execution_id) {
    functionExecutionId = body.event.function_execution_id;
    functionBotAccessToken = body.event.bot_access_token;
    functionInputs = body.event.inputs;
  }

  // interactivity (block_actions)
  if (body.function_data) {
    functionExecutionId = body.function_data.execution_id;
    functionBotAccessToken = body.bot_access_token;
    functionInputs = body.function_data.inputs;
  }

  return { functionExecutionId, functionBotAccessToken, functionInputs };
}

// ----------------------------
// Instrumentation
// Don't change the position of the following code
addAppMetadata({ name: packageJson.name, version: packageJson.version });
