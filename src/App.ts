import util from 'util';
import { WebClient, ChatPostMessageArguments, addAppMetadata, WebClientOptions } from '@slack/web-api';
import { Logger, LogLevel, ConsoleLogger } from '@slack/logger';
import ExpressReceiver, { ExpressReceiverOptions } from './ExpressReceiver';
import {
  ignoreSelf as ignoreSelfMiddleware,
  onlyActions,
  matchConstraints,
  onlyCommands,
  matchCommandName,
  onlyOptions,
  onlyEvents,
  matchEventType,
  matchMessage,
  onlyViewActions,
} from './middleware/builtin';
import { processMiddleware } from './middleware/process';
import { ConversationStore, conversationContext, MemoryStore } from './conversation-store';
import {
  Middleware,
  AnyMiddlewareArgs,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackOptionsMiddlewareArgs,
  SlackViewMiddlewareArgs,
  SlackAction,
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
} from './types';
import { IncomingEventType, getTypeAndConversation, assertNever } from './helpers';
import { ErrorCode, CodedError, errorWithCode, asCodedError } from './errors';
const packageJson = require('../package.json'); // tslint:disable-line:no-require-imports no-var-requires

/** App initialization options */
export interface AppOptions {
  signingSecret?: ExpressReceiverOptions['signingSecret'];
  endpoints?: ExpressReceiverOptions['endpoints'];
  agent?: ExpressReceiverOptions['agent']; // also WebClientOptions['agent']
  clientTls?: ExpressReceiverOptions['clientTls']; // also WebClientOptions['tls']
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
  (
    source: AuthorizeSourceData,
    body: ReceiverEvent['body'],
  ): Promise<AuthorizeResult>;
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
  block_id?: A extends BlockAction ? (string | RegExp) : never;
  action_id?: A extends BlockAction ? (string | RegExp) : never;
  callback_id?: Extract<A, { callback_id?: string }> extends any ? (string | RegExp) : never;
}

export interface ViewConstraints {
  callback_id?: string | RegExp;
  type?: 'view_closed' | 'view_submission';
}

export interface ErrorHandler {
  (error: CodedError): void;
}

/**
 * A Slack App
 */
export default class App {

  /** Slack Web API client */
  public client: WebClient;

  /** Receiver - ingests events from the Slack platform */
  private receiver: Receiver;

  /** Logger */
  private logger: Logger;

  /**  */
  private authorize: Authorize;

  /** Global middleware */
  private middleware: Middleware<AnyMiddlewareArgs>[];

  /** Listeners (and their middleware) */
  private listeners: Middleware<AnyMiddlewareArgs>[][];

  private errorHandler: ErrorHandler;

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
    logger = new ConsoleLogger(),
    logLevel = LogLevel.INFO,
    ignoreSelf = true,
    clientOptions = undefined,
  }: AppOptions = {}) {

    this.logger = logger;
    this.logger.setLevel(logLevel);
    this.errorHandler = defaultErrorHandler(this.logger);

    this.client = new WebClient(undefined, {
      agent,
      logLevel,
      logger,
      tls: clientTls,
      slackApiUrl: clientOptions !== undefined ? clientOptions.slackApiUrl : undefined,
    });

    if (token !== undefined) {
      if (authorize !== undefined) {
        throw errorWithCode(
          `Both token and authorize options provided. ${tokenUsage}`,
          ErrorCode.AppInitializationError,
        );
      }
      this.authorize = singleTeamAuthorization(this.client, { botId, botUserId, botToken: token });
    } else if (authorize === undefined) {
      throw errorWithCode(
        `No token and no authorize options provided. ${tokenUsage}`,
        ErrorCode.AppInitializationError,
      );
    } else {
      this.authorize = authorize;
    }

    this.middleware = [];
    this.listeners = [];

    // Check for required arguments of ExpressReceiver
    if (receiver !== undefined) {
      this.receiver = receiver;
    } else {
      // No custom receiver
      if (signingSecret === undefined) {
        throw errorWithCode(
          'Signing secret not found, so could not initialize the default receiver. Set a signing secret or use a ' +
          'custom receiver.',
          ErrorCode.AppInitializationError,
        );
      } else {
        // Create default ExpressReceiver
        this.receiver = new ExpressReceiver({ signingSecret, logger, endpoints, agent, clientTls });
      }
    }

    // Subscribe to messages and errors from the receiver
    this.receiver.on('message', message => this.onIncomingEvent(message));
    this.receiver.on('error', error => this.onGlobalError(error));

    // Conditionally use a global middleware that ignores events (including messages) that are sent from this app
    if (ignoreSelf) {
      this.use(ignoreSelfMiddleware());
    }

    // Use conversation state global middleware
    if (convoStore !== false) {
      // Use the memory store by default, or another store if provided
      const store: ConversationStore = convoStore === undefined ? new MemoryStore() : convoStore;
      this.use(conversationContext(store, this.logger));
    }
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
    this.listeners.push(
      [onlyEvents, matchEventType(eventName), ...listeners] as Middleware<AnyMiddlewareArgs>[],
    );
  }

  // TODO: just make a type alias for Middleware<SlackEventMiddlewareArgs<'message'>>
  // TODO: maybe remove the first two overloads
  public message(...listeners: Middleware<SlackEventMiddlewareArgs<'message'>>[]): void;
  public message(pattern: string | RegExp, ...listeners: Middleware<SlackEventMiddlewareArgs<'message'>>[]): void;
  public message(
    ...patternsOrMiddleware: (string | RegExp | Middleware<SlackEventMiddlewareArgs<'message'>>)[]
  ): void {
    const messageMiddleware = patternsOrMiddleware.map((patternOrMiddleware) => {
      if (typeof patternOrMiddleware === 'string' || util.types.isRegExp(patternOrMiddleware)) {
        return matchMessage(patternOrMiddleware);
      }
      return patternOrMiddleware;
    });

    this.listeners.push(
      [onlyEvents, matchEventType('message'), ...messageMiddleware] as Middleware<AnyMiddlewareArgs>[],
    );
  }

  // NOTE: this is what's called a convenience generic, so that types flow more easily without casting.
  // https://basarat.gitbooks.io/typescript/docs/types/generics.html#design-pattern-convenience-generic
  public action<Action extends SlackAction = SlackAction>(
      actionId: string | RegExp,
      ...listeners: Middleware<SlackActionMiddlewareArgs<Action>>[]
    ): void;
  public action<Action extends SlackAction = SlackAction,
    Constraints extends ActionConstraints<Action> = ActionConstraints<Action>>(
      constraints: Constraints,
      // NOTE: Extract<> is able to return the whole union when type: undefined. Why?
      ...listeners: Middleware<SlackActionMiddlewareArgs<Extract<Action, { type: Constraints['type'] }>>>[]
    ): void;
  public action<Action extends SlackAction = SlackAction,
    Constraints extends ActionConstraints<Action> = ActionConstraints<Action>>(
      actionIdOrConstraints: string | RegExp | Constraints,
      ...listeners: Middleware<SlackActionMiddlewareArgs<Extract<Action, { type: Constraints['type'] }>>>[]
    ): void {
    // Normalize Constraints
    const constraints: ActionConstraints  =
      (typeof actionIdOrConstraints === 'string' || util.types.isRegExp(actionIdOrConstraints)) ?
        { action_id: actionIdOrConstraints } : actionIdOrConstraints;

    // Fail early if the constraints contain invalid keys
    const unknownConstraintKeys = Object.keys(constraints)
      .filter(k => (k !== 'action_id' && k !== 'block_id' && k !== 'callback_id' && k !== 'type'));
    if (unknownConstraintKeys.length > 0) {
      this.logger.error(
        `Action listener cannot be attached using unknown constraint keys: ${unknownConstraintKeys.join(', ')}`,
      );
      return;
    }

    this.listeners.push(
      [onlyActions, matchConstraints(constraints), ...listeners] as Middleware<AnyMiddlewareArgs>[],
    );
  }

  // TODO: should command names also be regex?
  public command(commandName: string, ...listeners: Middleware<SlackCommandMiddlewareArgs>[]): void {
    this.listeners.push(
      [onlyCommands, matchCommandName(commandName), ...listeners] as Middleware<AnyMiddlewareArgs>[],
    );
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
      (typeof actionIdOrConstraints === 'string' || util.types.isRegExp(actionIdOrConstraints)) ?
        { action_id: actionIdOrConstraints } : actionIdOrConstraints;

    this.listeners.push(
      [onlyOptions, matchConstraints(constraints), ...listeners] as Middleware<AnyMiddlewareArgs>[],
    );
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
    ...listeners: Middleware<SlackViewMiddlewareArgs<ViewActionType>>[]): void {
    const constraints: ViewConstraints =
      (typeof callbackIdOrConstraints === 'string' || util.types.isRegExp(callbackIdOrConstraints)) ?
        { callback_id: callbackIdOrConstraints, type: 'view_submission' } : callbackIdOrConstraints;
    // Fail early if the constraints contain invalid keys
    const unknownConstraintKeys = Object.keys(constraints)
      .filter(k => (k !== 'callback_id' && k !== 'type'));
    if (unknownConstraintKeys.length > 0) {
      this.logger.error(
        `View listener cannot be attached using unknown constraint keys: ${unknownConstraintKeys.join(', ')}`,
      );
      return;
    }

    if (constraints.type !== undefined && !validViewTypes.includes(constraints.type)) {
      this.logger.error(
        `View listener cannot be attached using unknown view event type: ${constraints.type}`,
      );
      return;
    }

    this.listeners.push(
      [onlyViewActions, matchConstraints(constraints), ...listeners] as Middleware<AnyMiddlewareArgs>[],
    );
  }

  public error(errorHandler: ErrorHandler): void {
    this.errorHandler = errorHandler;
  }

  /**
   * Handles events from the receiver
   */
  private async onIncomingEvent({ body, ack, respond }: ReceiverEvent): Promise<void> {
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
    const authorizeResult = await (this.authorize(source, bodyArg).catch((error) => {
      this.onGlobalError(authorizationErrorFromOriginal(error));
    }));
    if (authorizeResult === undefined) {
      this.logger.warn('Authorization of incoming event did not succeed. No listeners will be called.');
      return;
    }
    const context: Context = { ...authorizeResult };

    // Factory for say() utility
    const createSay = (channelId: string): SayFn => {
      const token = context.botToken !== undefined ? context.botToken : context.userToken;
      return (message: Parameters<SayFn>[0]) => {
        const postMessageArguments: ChatPostMessageArguments = (typeof message === 'string') ?
          { token, text: message, channel: channelId } : { ...message, token, channel: channelId };
        this.client.chat.postMessage(postMessageArguments)
          .catch(error => this.onGlobalError(error));
      };
    };

    // Set body and payload (this value will eventually conform to AnyMiddlewareArgs)
    // NOTE: the following doesn't work because... distributive?
    // const listenerArgs: Partial<AnyMiddlewareArgs> = {
    const listenerArgs: Pick<AnyMiddlewareArgs, 'body' | 'payload'> & {
      /** Say function might be set below */
      say?: SayFn
      /** Respond function might be set below */
      respond?: RespondFn,
      /** Ack function might be set below */
      ack?: AckFn<any>,
    } = {
      body: bodyArg,
      payload:
        (type === IncomingEventType.Event) ?
          (bodyArg as SlackEventMiddlewareArgs['body']).event :
          (type === IncomingEventType.ViewAction) ?
            (bodyArg as SlackViewMiddlewareArgs['body']).view :
            (type === IncomingEventType.Action &&
              isBlockActionOrInteractiveMessageBody(bodyArg as SlackActionMiddlewareArgs['body'])) ?
              (bodyArg as SlackActionMiddlewareArgs<BlockAction | InteractiveMessage>['body']).actions[0] :
              (bodyArg as (
                Exclude<AnyMiddlewareArgs, SlackEventMiddlewareArgs | SlackActionMiddlewareArgs |
                  SlackViewMiddlewareArgs> | SlackActionMiddlewareArgs<Exclude<SlackAction, BlockAction |
                    InteractiveMessage>>
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
    }

    // Set say() utility
    if (conversationId !== undefined && type !== IncomingEventType.Options) {
      listenerArgs.say = createSay(conversationId);
    }

    // Set respond() utility
    if (respond !== undefined) {
      listenerArgs.respond = respond;
    }

    // Set ack() utility
    if (type !== IncomingEventType.Event) {
      listenerArgs.ack = ack;
    } else {
      // Events API requests are acknowledged right away, since there's no data expected
      ack();
    }

    // Dispatch event through global middleware
    processMiddleware(
      listenerArgs as AnyMiddlewareArgs,
      this.middleware,
      (globalProcessedContext: Context, globalProcessedArgs: AnyMiddlewareArgs, startGlobalBubble) => {
        this.listeners.forEach((listenerMiddleware) => {
          // Dispatch event through all listeners
          processMiddleware(
            globalProcessedArgs,
            listenerMiddleware,
            (_listenerProcessedContext, _listenerProcessedArgs, startListenerBubble) => {
              startListenerBubble();
            },
            (error) => {
              startGlobalBubble(error);
            },
            globalProcessedContext,
          );
        });
      },
      (globalError?: CodedError | Error) => {
        if (globalError !== undefined) {
          this.onGlobalError(globalError);
        }
      },
      context,
    );
  }

  /**
   * Global error handler. The final destination for all errors (hopefully).
   */
  private onGlobalError(error: Error): void {
    this.errorHandler(asCodedError(error));
  }

}

const tokenUsage = 'Apps used in one workspace should be initialized with a token. Apps used in many workspaces ' +
  'should be initialized with a authorize.';

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
      ((type === IncomingEventType.Event || type === IncomingEventType.Command) ? (body as (SlackEventMiddlewareArgs | SlackCommandMiddlewareArgs)['body']).team_id as string :
        (type === IncomingEventType.Action || type === IncomingEventType.Options || type === IncomingEventType.ViewAction) ? (body as (SlackActionMiddlewareArgs | SlackOptionsMiddlewareArgs | SlackViewMiddlewareArgs)['body']).team.id as string :
          assertNever(type)),
    enterpriseId:
      ((type === IncomingEventType.Event || type === IncomingEventType.Command) ? (body as (SlackEventMiddlewareArgs | SlackCommandMiddlewareArgs)['body']).enterprise_id as string :
        (type === IncomingEventType.Action || type === IncomingEventType.Options || type === IncomingEventType.ViewAction) ? (body as (SlackActionMiddlewareArgs | SlackOptionsMiddlewareArgs | SlackViewMiddlewareArgs)['body']).team.enterprise_id as string :
          undefined),
    userId:
      ((type === IncomingEventType.Event) ?
        ((typeof (body as SlackEventMiddlewareArgs['body']).event.user === 'string') ? (body as SlackEventMiddlewareArgs['body']).event.user as string :
          (typeof (body as SlackEventMiddlewareArgs['body']).event.user === 'object') ? (body as SlackEventMiddlewareArgs['body']).event.user.id as string :
            ((body as SlackEventMiddlewareArgs['body']).event.channel !== undefined && (body as SlackEventMiddlewareArgs['body']).event.channel.creator !== undefined) ? (body as SlackEventMiddlewareArgs['body']).event.channel.creator as string :
              ((body as SlackEventMiddlewareArgs['body']).event.subteam !== undefined && (body as SlackEventMiddlewareArgs['body']).event.subteam.created_by !== undefined) ? (body as SlackEventMiddlewareArgs['body']).event.subteam.created_by as string :
                undefined) :
        (type === IncomingEventType.Action || type === IncomingEventType.Options || type === IncomingEventType.ViewAction) ? (body as (SlackActionMiddlewareArgs | SlackOptionsMiddlewareArgs | SlackViewMiddlewareArgs)['body']).user.id as string :
          (type === IncomingEventType.Command) ? (body as SlackCommandMiddlewareArgs['body']).user_id as string :
            undefined),
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
  };
}

function singleTeamAuthorization(
  client: WebClient,
  authorization: Partial<AuthorizeResult> & { botToken: Required<AuthorizeResult>['botToken'] },
): Authorize {
  // TODO: warn when something needed isn't found
  const identifiers: Promise<{ botUserId: string, botId: string }> = authorization.botUserId !== undefined &&
    authorization.botId !== undefined ?
    Promise.resolve({ botUserId: authorization.botUserId, botId: authorization.botId }) :
    client.auth.test({ token: authorization.botToken })
      .then((result) => {
        return {
          botUserId: (result.user_id as string),
          botId: (result.bot_id as string),
        };
      });

  return async () => {
    return Object.assign({ botToken: authorization.botToken }, await identifiers);
  };
}

/* Instrumentation */
addAppMetadata({ name: packageJson.name, version: packageJson.version });

/* Error handling helpers */
function authorizationErrorFromOriginal(original: Error): AuthorizationError {
  const error = errorWithCode('Authorization of incoming event did not succeed.', ErrorCode.AuthorizationError);
  (error as AuthorizationError).original = original;
  return error as AuthorizationError;
}

export interface AuthorizationError extends CodedError {
  code: ErrorCode.AuthorizationError;
  original: Error;
}
