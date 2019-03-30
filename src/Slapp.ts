import { WebClient, ChatPostMessageArguments } from '@slack/web-api';
// import conversationStore from './conversation_store';
import { ExpressReceiver, Receiver, Event as ReceiverEvent, ReceiverArguments } from './receiver';
import { Logger, LogLevel, ConsoleLogger } from './logger'; // tslint:disable-line:import-name
import { ignoreSelfMiddleware, ignoreBotsMiddleware } from './middleware/builtin';
import { processMiddleware } from './middleware/process';
import {
  Middleware,
  AnyMiddlewareArgs,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackOptionsMiddlewareArgs,
  SlackAction,
  Context,
  SayFn,
  AckFn,
  RespondFn,
  KeyValueMapping,
  InteractiveAction,
  KnownActions,
  Actions,
  InteractiveMessage,
} from './middleware/types';

// TODO: remove the following pragma after TSLint to ESLint transformation is complete
/* tslint:disable:completed-docs */

/** App initialization options */
export interface SlappOptions {
  signingSecret?: ReceiverArguments['signingSecret'];
  endpoints?: ReceiverArguments['endpoints'];
  convoStore?: any;
  token?: string; // either token or teamContext
  teamContext?: Authorize; // either token or teamContext
  receiver?: Receiver;
  logger?: Logger;
  logLevel?: LogLevel;
  colors?: boolean;
  ignoreSelf?: boolean;
  ignoreBots?: boolean;
}

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
  botToken?: string; // used by `say` (preferred over appToken, one is required)
  appToken?: string; // used by `say` (overridden by botToken, one is required)
  botId?: string; // required for `ignoreSelf` global middleware
  botUserId?: string; // optional
  [ key: string ]: any;
}

/**
 * A Slack App
 */
export default class Slapp {

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

  constructor({
    signingSecret = undefined,
    endpoints = undefined,
    receiver = undefined,
    convoStore = undefined,
    token = undefined,
    teamContext = undefined,
    logger = new ConsoleLogger(),
    logLevel = LogLevel.INFO,
    colors = false,
    ignoreSelf = false,
    ignoreBots = false,
  }: SlappOptions = {}) {

    this.logger = logger;
    this.logger.setLevel(logLevel);
    // TODO: set colors

    if (token !== undefined) {
      if (teamContext !== undefined) {
        throw new Error(`Both token and teamContext options provided. ${tokenUsage}`);
      }
      this.authorize = async () => ({ botToken: token });
    } else if (teamContext === undefined) {
      throw new Error(`No token and no teamContext options provided. ${tokenUsage}`);
    } else {
      this.authorize = teamContext;
    }

    this.middleware = [];
    this.listeners = [];

    // TODO: should we pass the logLevel through? probably not
    this.client = new WebClient();

    // Check for required arguments of ExpressReceiver
    if (signingSecret !== undefined) {
      this.receiver = new ExpressReceiver({ signingSecret, endpoints });
    } else if (receiver === undefined) {
      // Check for custom receiver
      throw new Error('Signing secret not found, so could not initialize the default receiver. Set a signing secret ' +
        'or use a custom receiver.');
    } else {
      this.receiver = receiver;
    }

    // Subscribe to messages and errors from the receiver
    this.receiver
      .on('message', message => this.onIncomingEvent(message))
      .on('error', error => this.onGlobalError(error));

    if (ignoreBots) {
      this.use(ignoreBotsMiddleware());
    }
    if (ignoreSelf) {
      this.use(ignoreSelfMiddleware());
    }

    // TODO: provide a global middleware for conversation store. this should be de-emphasized because workflows will
    // supercede this solution for the same use cases
  }

  /**
   * Register a new middleware, processed in the order registered.
   *
   * @param m global middleware function
   */
  public use(m: any): this {
    this.middleware.push(m);
    return this;
  }

  /**
   * Handles events from the receiver
   */
  private async onIncomingEvent({ body, ack, respond }: ReceiverEvent): Promise<void> {

    // Introspect the body to determine what type of incoming event is being handled
    const type: IncomingEventType | undefined = (() => {
      if (body.event !== undefined) {
        return IncomingEventType.Event;
      }
      if (body.command !== undefined) {
        return IncomingEventType.Command;
      }
      if (body.name !== undefined) {
        return IncomingEventType.Options;
      }
      if (body.actions !== undefined || body.type === 'dialog_submission') {
        return IncomingEventType.Action;
      }
      return undefined;
    })();

    // If the type could not be determined, warn and exit
    if (type === undefined) {
      this.logger.warn('Could not determine the type of an incoming event. No listeners will be called.');
      return;
    }

    // From this point on, we assume that body is not just a key-value map, but one of the types of bodies we expect
    const bodyArg = body as AnyMiddlewareArgs['body'];

    // Initialize context (shallow copy to enforce object identity separation)
    const context: Context = { ...(await this.authorize(buildSource(type, bodyArg), bodyArg)) };

    // Factory for say() argument
    const createSay = (channelId: string): SayFn => {
      const token = context.botToken !== undefined ? context.botToken : context.appToken;
      return (message: Parameters<SayFn>[0]) => {
        const postMessageArguments: ChatPostMessageArguments = (typeof message === 'string') ?
          { token, text: message, channel: channelId } : { ...message, token, channel: channelId };
        this.client.chat.postMessage(postMessageArguments)
          // TODO: create a specific error code
          .catch(this.onGlobalError);
      };
    };

    // Set body and payload (this value will eventually conform to AnyMiddlewareArgs)
    // NOTE: the following doesn't work because... distributive?
    // const listenerArgs: Partial<AnyMiddlewareArgs> = {
    const listenerArgs:
      Pick<AnyMiddlewareArgs, 'body' | 'payload'> & {
        /** Say function might be set below */
        say?: SayFn
        /** Respond function might be set below */
        respond?: RespondFn,
        /** Ack function might be set below */
        ack?: AckFn,
      } = {
        body: bodyArg,
        payload: (type === IncomingEventType.Event) ?
          (bodyArg as SlackEventMiddlewareArgs<string>['body']).event :
          (bodyArg as Exclude<AnyMiddlewareArgs, SlackEventMiddlewareArgs<string>>['body']),
      };

    // Set aliases
    if (type === IncomingEventType.Event) {
      const eventListenerArgs = listenerArgs as SlackEventMiddlewareArgs<string>;
      eventListenerArgs.event = eventListenerArgs.payload;
      if (eventListenerArgs.event.type === 'message') {
        const messageEventListenerArgs = eventListenerArgs as SlackEventMiddlewareArgs<'message'>;
        messageEventListenerArgs.message = messageEventListenerArgs.payload;
      }
    } else if (type === IncomingEventType.Action) {
      const actionListenerArgs = listenerArgs as SlackActionMiddlewareArgs<SlackAction>;
      actionListenerArgs.action = actionListenerArgs.payload;
    } else if (type === IncomingEventType.Command) {
      const commandListenerArgs = listenerArgs as SlackCommandMiddlewareArgs;
      commandListenerArgs.command = commandListenerArgs.payload;
    }
    // NOTE: there is no alias for options

    // Set say() utility
    const channelId = getChannelContext(type, bodyArg);
    if (channelId !== undefined) {
      listenerArgs.say = createSay(channelId);
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
      (globalError?: Error) => {
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
    this.logger.error(error);
  }

  public event<EventType extends string = string>(
    eventName: EventType,
    ...listeners: Middleware<SlackEventMiddlewareArgs<EventType>>[]
  ): void {
    // TODO:
  }

  // TODO: just make a type alias for Middleware<SlackEventMiddlewareArgs<'message'>>
  public message(...listeners: Middleware<SlackEventMiddlewareArgs<'message'>>[]): void;
  public message(pattern: string | RegExp, ...listeners: Middleware<SlackEventMiddlewareArgs<'message'>>[]): void;
  public message(
    patternOrMiddleware: string | RegExp | Middleware<SlackEventMiddlewareArgs<'message'>>,
    ...listeners: Middleware<SlackEventMiddlewareArgs<'message'>>[]
  ): void {
    // TODO
  }

  // NOTE: this is what's called a convenience generic, so that types flow more easily without casting.
  // https://basarat.gitbooks.io/typescript/docs/types/generics.html#design-pattern-convenience-generic
  public action<ActionType extends SlackAction = SlackAction>(
    actionId: string | RegExp,
    ...listeners: Middleware<SlackActionMiddlewareArgs<ActionType>>[]
  ): void;
  public action<ActionType extends SlackAction = SlackAction>(
    constraints: KeyValueMapping,
    ...listeners: Middleware<SlackActionMiddlewareArgs<ActionType>>[]
  ): void;
  public action<ActionType extends SlackAction = SlackAction>(
    actionIdOrContraints: string | RegExp | KeyValueMapping,
    ...listeners: Middleware<SlackActionMiddlewareArgs<ActionType>>[]
  ): void {
    let constraints: KeyValueMapping = {};

    if (typeof actionIdOrContraints !== 'object') {
      constraints.action_id = actionIdOrContraints;
    } else {
      constraints = Object.assign({}, actionIdOrContraints);
    }

    // Validate constraints object
    const error = validateConstraints(constraints);

    if (error) throw error;

    const actionMiddleware: Middleware<SlackActionMiddlewareArgs<ActionType>> = ({ action, next, context }) => {
      // Filter out any non-actions
      if ((action as Actions<KnownActions> | InteractiveMessage<InteractiveAction>).actions === undefined
        && action.type !== 'dialog_submission') {
        return;
      }

      // Filter out any actions without actionId
      const match = matchesConstraints(action, constraints, context);
      if (!match) return;

      // It matches so we should continue down this middleware listener chain
      next();
    };

    this.listeners.push([actionMiddleware, ...listeners] as Middleware<AnyMiddlewareArgs>[]);
  }

  // TODO: should command names also be regex?
  public command(commandName: string, ...listeners: Middleware<SlackCommandMiddlewareArgs>[]): void {
    // TODO:
  }

  // TODO: is the generic constraint a good one?
  // TODO: the name Within is not super good
  public options<Within extends 'interactive_message' | 'dialog_suggestion' = 'interactive_message'>(
    callbackId: string,
    ...listeners: Middleware<SlackOptionsMiddlewareArgs<Within>>[]
  ): void {
    // TODO:
  }
}

const tokenUsage = 'Apps used in one workspace should be initialized with a token. Apps used in many workspaces ' +
  'should be initialized with a teamContext.';

/**
 * Internal data type for capturing the class of event processed in Slapp#onIncomingEvent()
 */
enum IncomingEventType {
  Event,
  Action,
  Command,
  Options,
}

/**
 * Validate constraints
 */
function validateConstraints(constraints: KeyValueMapping): Error | boolean {
  if (constraints.callback_id &&
      !(typeof constraints.callback_id === 'string' || constraints.callback_id instanceof RegExp)) {
    return new TypeError('Callback ID must be a string or RegExp');
  }

  if (constraints.block_id &&
    !(typeof constraints.block_id === 'string' || constraints.block_id instanceof RegExp)) {
    return new TypeError('Block ID must be a string or RegExp');
  }

  if (constraints.action_id &&
    !(typeof constraints.action_id === 'string' || constraints.action_id instanceof RegExp)) {
    return new TypeError('Action ID must be a string or RegExp');
  }

  return false;
}

/**
 * Match constraints given a message payload and adds all matches to context
 */
function matchesConstraints(payload: KeyValueMapping, constraints: KeyValueMapping, context: Context): boolean {
  const action = payload.actions ? payload.actions[0] : {};
  let tempMatches: KeyValueMapping[] = [];
  const matches: KeyValueMapping[] = [];

  if (constraints.block_id) {
    if (typeof constraints.block_id === 'string' && action.block_id !== constraints.block_id) {
      return false;
    }

    if ((tempMatches = constraints.block_id.exec(action.block_id)) != null) {
      matches.concat(tempMatches);
    } else return false;
  }

  if (constraints.action_id) {
    if (typeof constraints.action_id === 'string' && action.action_id !== constraints.action_id) {
      return false;
    }

    if ((tempMatches = constraints.action_id.exec(action.action_id)) != null) {
      matches.concat(tempMatches);
    } else return false;
  }

  if (constraints.callback_id) {
    if (payload.callback_id !== constraints.callback_id) {
      return false;
    }

    if ((tempMatches = constraints.callback_id.exec(payload.callback_id)) != null) {
      matches.concat(tempMatches);
    } else return false;
  }

  // Add matches to context
  context['matches'] = matches;

  return true;
}

/**
 * Helper which builds the data structure the authorize hook uses to provide tokens for the context.
 */
function buildSource(type: IncomingEventType, body: AnyMiddlewareArgs['body']): AuthorizeSourceData {
  // NOTE: potentially something that can be optimized, so that each of these conditions isn't evaluated more than once.
  // if this makes it prettier, great! but we should probably check perf before committing to any specific optimization.

  // tslint:disable:max-line-length
  const source: AuthorizeSourceData = {
    teamId:
      ((type === IncomingEventType.Event || type === IncomingEventType.Command) ? (body as (SlackEventMiddlewareArgs<string> | SlackCommandMiddlewareArgs)['body']).team_id as string :
       (type === IncomingEventType.Action || type === IncomingEventType.Options) ? (body as (SlackActionMiddlewareArgs<SlackAction> | SlackOptionsMiddlewareArgs<'dialog_suggestion' | 'interactive_message'>)['body']).team.id as string :
       assertNever(type)),
    enterpriseId:
      ((type === IncomingEventType.Event || type === IncomingEventType.Command) ? (body as (SlackEventMiddlewareArgs<string> | SlackCommandMiddlewareArgs)['body']).enterprise_id as string :
       (type === IncomingEventType.Action || type === IncomingEventType.Options) ? (body as (SlackActionMiddlewareArgs<SlackAction> | SlackOptionsMiddlewareArgs<'dialog_suggestion' | 'interactive_message'>)['body']).team.enterprise_id as string :
       undefined),
    userId:
      ((type === IncomingEventType.Event) ?
        ((typeof (body as SlackEventMiddlewareArgs<string>['body']).event.user === 'string') ? (body as SlackEventMiddlewareArgs<string>['body']).event.user as string :
         (typeof (body as SlackEventMiddlewareArgs<string>['body']).event.user === 'object') ? (body as SlackEventMiddlewareArgs<string>['body']).event.user.id as string :
         ((body as SlackEventMiddlewareArgs<string>['body']).event.channel !== undefined && (body as SlackEventMiddlewareArgs<string>['body']).event.channel.creator !== undefined) ? (body as SlackEventMiddlewareArgs<string>['body']).event.channel.creator as string :
         ((body as SlackEventMiddlewareArgs<string>['body']).event.subteam !== undefined && (body as SlackEventMiddlewareArgs<string>['body']).event.subteam.created_by !== undefined) ? (body as SlackEventMiddlewareArgs<string>['body']).event.subteam.created_by as string :
         undefined) :
       (type === IncomingEventType.Action || type === IncomingEventType.Options) ? body.user.id as string :
       (type === IncomingEventType.Command) ? (body as SlackCommandMiddlewareArgs['body']).user_id as string :
       undefined),
    // TODO: fill in conversationId, possibly reuse part of getChannelContext()
    conversationId: undefined,
  };
  // tslint:enable:max-line-length

  return source;
}

/**
 * Helper which finds the channel that any specific incoming event is related to (if any). This is analagous to the type
 * helper used to define the SlackEventMiddlewareArgs and SlackActionMiddlewareArgs types.
 */
function getChannelContext(type: IncomingEventType, body: AnyMiddlewareArgs['body']): string | undefined {
  if (type === IncomingEventType.Action) {
    return (body as SlackActionMiddlewareArgs<SlackAction>['body']).channel.id;
  }
  if (type === IncomingEventType.Command) {
    return (body as SlackCommandMiddlewareArgs['body']).channel_id;
  }
  // TODO: verify this covers all the events
  if (type === IncomingEventType.Event) {
    if ((body as SlackEventMiddlewareArgs<string>['body']).event.channel !== undefined) {
      return (body as SlackEventMiddlewareArgs<string>['body']).event.channel;
    }
    if ((body as SlackEventMiddlewareArgs<string>['body']).event.item !== undefined) {
      return (body as SlackEventMiddlewareArgs<string>['body']).event.item.channel;
    }
  }
  // NOTE: Intentionally leaving all options requests with undefined
  return undefined;
}

/** Helper that should never be called, but is useful for exhaustiveness checking in conditional branches */
function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}
