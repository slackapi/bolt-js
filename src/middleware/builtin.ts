import type { ActionConstraints, OptionsConstraints, ShortcutConstraints, ViewConstraints } from '../App';
import { ContextMissingPropertyError } from '../errors';
import type {
  AnyMiddlewareArgs,
  BlockElementAction,
  BlockSuggestion,
  DialogSubmitAction,
  DialogSuggestion,
  EventTypePattern,
  GlobalShortcut,
  InteractiveMessage,
  InteractiveMessageSuggestion,
  MessageShortcut,
  Middleware,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackEventMiddlewareArgsOptions,
  SlackOptionsMiddlewareArgs,
  SlackShortcutMiddlewareArgs,
  SlackViewAction,
  SlackViewMiddlewareArgs,
} from '../types';

/** Type predicate that can narrow payloads block action or suggestion payloads */
function isBlockPayload(
  payload:
    | SlackActionMiddlewareArgs['payload']
    | SlackOptionsMiddlewareArgs['payload']
    | SlackViewMiddlewareArgs['payload'],
): payload is BlockElementAction | BlockSuggestion {
  return 'action_id' in payload && payload.action_id !== undefined;
}

type CallbackIdentifiedBody =
  | InteractiveMessage
  | DialogSubmitAction
  | MessageShortcut
  | GlobalShortcut
  | InteractiveMessageSuggestion
  | DialogSuggestion;

// TODO: consider exporting these type guards for use elsewhere within bolt
// TODO: is there overlap with `function_executed` event here?
function isCallbackIdentifiedBody(
  body: SlackActionMiddlewareArgs['body'] | SlackOptionsMiddlewareArgs['body'] | SlackShortcutMiddlewareArgs['body'],
): body is CallbackIdentifiedBody {
  return 'callback_id' in body && body.callback_id !== undefined;
}

// TODO: clarify terminology used internally: event vs. body vs. payload
/** Type predicate that can narrow event bodies to ones containing Views */
function isViewBody(
  body: SlackActionMiddlewareArgs['body'] | SlackOptionsMiddlewareArgs['body'] | SlackViewMiddlewareArgs['body'],
): body is SlackViewAction {
  return 'view' in body && body.view !== undefined;
}

function isEventArgs(args: AnyMiddlewareArgs): args is SlackEventMiddlewareArgs {
  return 'event' in args && args.event !== undefined;
}

function isMessageEventArgs(args: AnyMiddlewareArgs): args is SlackEventMiddlewareArgs<'message'> {
  return isEventArgs(args) && 'message' in args;
}

export function isSlackEventMiddlewareArgsOptions<EventType extends string = string>(
  optionOrListener: SlackEventMiddlewareArgsOptions | Middleware<SlackEventMiddlewareArgs<EventType>>,
): optionOrListener is SlackEventMiddlewareArgsOptions {
  return typeof optionOrListener !== 'function' && 'autoAcknowledge' in optionOrListener;
}

/**
 * Middleware that filters out any event that isn't an action
 */
export const onlyActions: Middleware<AnyMiddlewareArgs> = async (args) => {
  if ('action' in args && args.action) {
    await args.next();
  }
};

/**
 * Middleware that filters out any event that isn't a shortcut
 */
export const onlyShortcuts: Middleware<AnyMiddlewareArgs> = async (args) => {
  if ('shortcut' in args && args.shortcut) {
    await args.next();
  }
};

/**
 * Middleware that filters out any event that isn't a command
 */
export const onlyCommands: Middleware<AnyMiddlewareArgs> = async (args) => {
  if ('command' in args && args.command) {
    await args.next();
  }
};

/**
 * Middleware that filters out any event that isn't an options
 */
export const onlyOptions: Middleware<AnyMiddlewareArgs> = async (args) => {
  if ('options' in args && args.options) {
    await args.next();
  }
};

// TODO: event terminology here "event that isn't an event" wat
/**
 * Middleware that filters out any event that isn't an event
 */
export const onlyEvents: Middleware<AnyMiddlewareArgs> = async (args) => {
  if (isEventArgs(args)) {
    await args.next();
  }
};

// TODO: event terminology "ViewAction" is confusing since "Action" we use for block actions
/**
 * Middleware that filters out any event that isn't a view_submission or view_closed event
 */
export const onlyViewActions: Middleware<AnyMiddlewareArgs> = async (args) => {
  if ('view' in args) {
    await args.next();
  }
};

/**
 * Middleware that auto acknowledges the request received
 */
export const autoAcknowledge: Middleware<AnyMiddlewareArgs> = async (args) => {
  if ('ack' in args && args.ack !== undefined) {
    await args.ack();
  }
  await args.next();
};

/**
 * Middleware that checks for matches given constraints
 */
export function matchConstraints(
  constraints: ActionConstraints | ViewConstraints | ShortcutConstraints | OptionsConstraints,
): Middleware<SlackActionMiddlewareArgs | SlackOptionsMiddlewareArgs | SlackViewMiddlewareArgs> {
  return async ({ payload, body, next, context }) => {
    // TODO: is putting matches in an array actually helpful? there's no way to know which of the regexps contributed
    // which matches (and in which order)
    let tempMatches: RegExpMatchArray | null;

    // Narrow type for ActionConstraints
    if ('block_id' in constraints || 'action_id' in constraints) {
      if (!isBlockPayload(payload)) {
        return;
      }

      // Check block_id
      if (constraints.block_id !== undefined) {
        if (typeof constraints.block_id === 'string') {
          if (payload.block_id !== constraints.block_id) {
            return;
          }
        } else {
          tempMatches = payload.block_id.match(constraints.block_id);

          if (tempMatches !== null) {
            context.blockIdMatches = tempMatches;
          } else {
            return;
          }
        }
      }

      // Check action_id
      if (constraints.action_id !== undefined) {
        if (typeof constraints.action_id === 'string') {
          if (payload.action_id !== constraints.action_id) {
            return;
          }
        } else {
          tempMatches = payload.action_id.match(constraints.action_id);

          if (tempMatches !== null) {
            context.actionIdMatches = tempMatches;
          } else {
            return;
          }
        }
      }
    }

    // Check callback_id
    if ('callback_id' in constraints && constraints.callback_id !== undefined) {
      let callbackId = '';

      if (isViewBody(body)) {
        callbackId = body.view.callback_id;
      } else if (isCallbackIdentifiedBody(body)) {
        callbackId = body.callback_id;
      } else {
        return;
      }

      if (typeof constraints.callback_id === 'string') {
        if (callbackId !== constraints.callback_id) {
          return;
        }
      } else {
        tempMatches = callbackId.match(constraints.callback_id);

        if (tempMatches !== null) {
          context.callbackIdMatches = tempMatches;
        } else {
          return;
        }
      }
    }

    // Check type
    if ('type' in constraints) {
      if (body.type !== constraints.type) return;
    }

    await next();
  };
}

/*
 * Middleware that filters out messages that don't match pattern
 */
export function matchMessage(
  pattern: string | RegExp,
): Middleware<SlackEventMiddlewareArgs<'message' | 'app_mention'>> {
  return async ({ event, context, next }) => {
    let tempMatches: RegExpMatchArray | null;

    if (!('text' in event) || event.text === undefined) {
      return;
    }

    // Filter out messages or app mentions that don't contain the pattern
    if (typeof pattern === 'string') {
      if (!event.text.includes(pattern)) {
        return;
      }
    } else {
      tempMatches = event.text.match(pattern);

      if (tempMatches !== null) {
        context.matches = tempMatches;
      } else {
        return;
      }
    }

    await next();
  };
}

/**
 * Middleware that filters out any command that doesn't match the pattern
 */
export function matchCommandName(pattern: string | RegExp): Middleware<SlackCommandMiddlewareArgs> {
  return async ({ command, next }) => {
    // Filter out any commands that do not match the correct command name or pattern
    if (!matchesPattern(pattern, command.command)) {
      return;
    }

    await next();
  };
}

function matchesPattern(pattern: string | RegExp, candidate: string): boolean {
  if (typeof pattern === 'string') {
    return pattern === candidate;
  }
  return pattern.test(candidate);
}

/*
 * Middleware that filters out events that don't match pattern
 */
export function matchEventType(pattern: EventTypePattern): Middleware<SlackEventMiddlewareArgs> {
  return async ({ event, context, next }) => {
    let tempMatches: RegExpMatchArray | null;
    if (!('type' in event) || event.type === undefined) {
      return;
    }

    // Filter out events that don't contain the pattern
    if (typeof pattern === 'string') {
      if (event.type !== pattern) {
        return;
      }
    } else {
      tempMatches = event.type.match(pattern);

      if (tempMatches !== null) {
        context.matches = tempMatches;
      } else {
        return;
      }
    }

    await next();
  };
}

/**
 * Filters out any event originating from the handling app.
 */
export const ignoreSelf: Middleware<AnyMiddlewareArgs> = async (args) => {
  const { botId, botUserId } = args.context;

  if (isEventArgs(args)) {
    if (isMessageEventArgs(args)) {
      const { message } = args;
      // Look for an event that is identified as a bot message from the same bot ID as this app, and return to skip
      if (message.subtype === 'bot_message' && message.bot_id === botId) {
        return;
      }
    }

    // It's an Events API event that isn't of type message, but the user ID might match our own app. Filter these out.
    // However, some events still must be fired, because they can make sense.
    const eventsWhichShouldBeKept = ['member_joined_channel', 'member_left_channel'];

    if (
      botUserId !== undefined &&
      'user' in args.event &&
      args.event.user === botUserId &&
      !eventsWhichShouldBeKept.includes(args.event.type)
    ) {
      return;
    }
  }

  // If all the previous checks didn't skip this message, then its okay to resume to next
  await args.next();
};

// TODO: breaking change: constrain the subtype argument to be a valid message subtype
/**
 * Filters out any message events whose subtype does not match the provided subtype.
 */
export function subtype(subtype1: string): Middleware<SlackEventMiddlewareArgs<'message'>> {
  return async ({ message, next }) => {
    if (message && message.subtype === subtype1) {
      await next();
    }
  };
}

const slackLink = /<(?<type>[@#!])?(?<link>[^>|]+)(?:\|(?<label>[^>]+))?>/;

/**
 * Filters out any message event whose text does not start with an @-mention of the handling app.
 */
export const directMention: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({ message, context, next }) => {
  // When context does not have a botUserId in it, then this middleware cannot perform its job. Bail immediately.
  if (context.botUserId === undefined) {
    throw new ContextMissingPropertyError(
      'botUserId',
      'Cannot match direct mentions of the app without a bot user ID. Ensure authorize callback returns a botUserId.',
    );
  }

  if (!message || !('text' in message) || message.text === undefined) {
    return;
  }

  // Match the message text with a user mention format
  const text = message.text.trim();

  const matches = slackLink.exec(text);
  if (
    matches === null || // stop when no matches are found
    matches.index !== 0 || // stop if match isn't at the beginning
    // stop if match isn't a user mention with the right user ID
    matches.groups === undefined ||
    matches.groups.type !== '@' ||
    matches.groups.link !== context.botUserId
  ) {
    return;
  }

  await next();
};
