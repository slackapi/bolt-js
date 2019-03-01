import { WebClient } from '@slack/client';
// import conversationStore from './conversation_store';
import { ExpressReceiver, Receiver, Event as ReceiverEvent, ReceiverArguments } from './receiver';
import { Logger, LogLevel, ConsoleLogger } from './logger'; // tslint:disable-line:import-name
import { ignoreSelfMiddleware, ignoreBotsMiddleware } from './middleware/builtin';
import {
  Middleware,
  AnyMiddlewareArgs,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackOptionsMiddlewareArgs,
  SlackAction,
} from './middleware/types';

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

export interface Authorize {
  (
    source: AuthorizeSourceData,
    body: ReceiverEvent['body'],
  ): Promise<AuthorizeResult>;
}

export interface AuthorizeSourceData {
  teamId: string;
  enterpriseId?: string;
  userId?: string;
  conversationId?: string;
}

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

    // Initialize context (shallow copy to enforce object identity separation)
    const context = { ...(await this.authorize(buildSource(type, body), body)) };

    // Factory for say() argument
    const createSay = (channelId: string) => {
      const token = context.botToken !== undefined ? context.botToken : context.appToken;
      return (message: any) => {
        const postMessageArguments = (typeof message === 'string') ?
          { token, channel: channelId, text: message } : { token, channel: channelId, ...message };
        this.client.chat.postMessage(postMessageArguments)
          // TODO: create a specific error code
          .catch(this.onGlobalError);
      };
    };

    // Set body and payload
    const listenerArgs: AnyMiddlewareArgs = {
      body,
      payload: (type === IncomingEventType.Event) ? body.event : body,
    };

    // Set aliases
    if (type === IncomingEventType.Event) {
      listenerArgs.event = listenerArgs.payload;
      if (listenerArgs.event.type === 'message') {
        listenerArgs.message = listenerArgs.payload;
      }
    } else if (type === IncomingEventType.Action) {
      listenerArgs.action = listenerArgs.payload;
    } else if (type === IncomingEventType.Command) {
      listenerArgs.command = listenerArgs.payload;
    }
    // NOTE: there is no alias for options

    // Set say() utility
    const channelId = getChannelContext(type, body);
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

    // TODO: Dispatch event through global middleware

    // TODO: Dispatch event through all listeners
    // this.listeners.forEach(l => l(listenerArguments));
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
    callbackId: string | RegExp,
    ...listeners: Middleware<SlackActionMiddlewareArgs<ActionType>>[]
  ): void {
    // TODO:
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
 * Helper which builds the data structure the authorize hook uses to provide tokens for the context.
 */
function buildSource(type: IncomingEventType, body: AnyMiddlewareArgs['body']): AuthorizeSourceData {
  // tslint:disable:max-line-length
  const source: AuthorizeSourceData = {
    teamId:
      ((type === IncomingEventType.Event || type === IncomingEventType.Command) ? body.team_id as string :
       (type === IncomingEventType.Action || type === IncomingEventType.Options) ? body.team.id as string :
       assertNever(type)),
    enterpriseId:
      ((type === IncomingEventType.Event || type === IncomingEventType.Command) ? body.enterprise_id as string :
       (type === IncomingEventType.Action || type === IncomingEventType.Options) ? body.team.enterprise_id as string :
       undefined),
    userId:
      ((type === IncomingEventType.Event) ?
        ((typeof body.event.user === 'string') ? body.event.user as string :
         (typeof body.event.user === 'object') ? body.event.user.id as string :
         (body.event.channel !== undefined && body.event.channel.creator !== undefined) ? body.event.channel.creator as string :
         (body.event.subteam !== undefined && body.event.subteam.created_by !== undefined) ? body.event.subteam.created_by as string :
         undefined) :
       (type === IncomingEventType.Action || type === IncomingEventType.Options) ? body.user.id as string :
       (type === IncomingEventType.Command) ? body.user_id as string :
       undefined),
    // TODO: fill in conversationId, possibly reuse part of getChannelContext()
    conversationId: undefined,
  };
  // tslint:enable:max-line-length

  return source;
}

function getChannelContext(type: IncomingEventType, body: AnyMiddlewareArgs['body']): string | undefined {
  if (type === IncomingEventType.Action) {
    return body.channel.id;
  }
  if (type === IncomingEventType.Command) {
    return body.channel_id;
  }
  // TODO: verify this covers all the events
  if (type === IncomingEventType.Event) {
    if (body.event.channel !== undefined) {
      return body.event.channel;
    }
    if (body.event.item !== undefined) {
      return body.event.item.channel;
    }
  }
  // NOTE: Intentionally leaving all options requests with undefined
  return undefined;
}

function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}
