/* eslint-disable @typescript-eslint/dot-notation */

import {
  Middleware,
  AnyMiddlewareArgs,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackOptionsMiddlewareArgs,
  SlackShortcutMiddlewareArgs,
  SlackViewMiddlewareArgs,
  SlackEvent,
  SlackAction,
  SlackShortcut,
  SlashCommand,
  SlackOptions,
  BlockSuggestion,
  InteractiveMessageSuggestion,
  DialogSuggestion,
  InteractiveMessage,
  DialogSubmitAction,
  GlobalShortcut,
  MessageShortcut,
  BlockElementAction,
  SlackViewAction,
  EventTypePattern,
  ViewOutput,
} from '../types';
import { ActionConstraints, ViewConstraints, ShortcutConstraints } from '../App';
import { ContextMissingPropertyError } from '../errors';

/**
 * Middleware that filters out any event that isn't an action
 */
export const onlyActions: Middleware<AnyMiddlewareArgs & { action?: SlackAction }> = async ({ action, next }) => {
  // Filter out any non-actions
  if (action === undefined) {
    return;
  }

  // It matches so we should continue down this middleware listener chain
  // TODO: remove the non-null assertion operator
  await next!();
};

/**
 * Middleware that filters out any event that isn't a shortcut
 */
// tslint:disable-next-line: max-line-length
export const onlyShortcuts: Middleware<AnyMiddlewareArgs & { shortcut?: SlackShortcut }> = async ({
  shortcut,
  next,
}) => {
  // Filter out any non-shortcuts
  if (shortcut === undefined) {
    return;
  }

  // It matches so we should continue down this middleware listener chain
  // TODO: remove the non-null assertion operator
  await next!();
};

/**
 * Middleware that filters out any event that isn't a command
 */
export const onlyCommands: Middleware<AnyMiddlewareArgs & { command?: SlashCommand }> = async ({ command, next }) => {
  // Filter out any non-commands
  if (command === undefined) {
    return;
  }

  // It matches so we should continue down this middleware listener chain
  // TODO: remove the non-null assertion operator
  await next!();
};

/**
 * Middleware that filters out any event that isn't an options
 */
export const onlyOptions: Middleware<AnyMiddlewareArgs & { options?: SlackOptions }> = async ({ options, next }) => {
  // Filter out any non-options requests
  if (options === undefined) {
    return;
  }

  // It matches so we should continue down this middleware listener chain
  // TODO: remove the non-null assertion operator
  await next!();
};

/**
 * Middleware that filters out any event that isn't an event
 */
export const onlyEvents: Middleware<AnyMiddlewareArgs & { event?: SlackEvent }> = async ({ event, next }) => {
  // Filter out any non-events
  if (event === undefined) {
    return;
  }

  // It matches so we should continue down this middleware listener chain
  // TODO: remove the non-null assertion operator
  await next!();
};

/**
 * Middleware that filters out any event that isn't a view_submission or view_closed event
 */
export const onlyViewActions: Middleware<AnyMiddlewareArgs & { view?: ViewOutput }> = async ({ view, next }) => {
  // Filter out anything that doesn't have a view
  if (view === undefined) {
    return;
  }

  // It matches so we should continue down this middleware listener chain
  // TODO: remove the non-null assertion operator
  await next!();
};

/**
 * Middleware that checks for matches given constraints
 */
export function matchConstraints(
  constraints: ActionConstraints | ViewConstraints | ShortcutConstraints,
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
            context['blockIdMatches'] = tempMatches;
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
            context['actionIdMatches'] = tempMatches;
          } else {
            return;
          }
        }
      }
    }

    // Check callback_id
    if ('callback_id' in constraints && constraints.callback_id !== undefined) {
      let callbackId: string = '';

      if (isViewBody(body)) {
        callbackId = body['view']['callback_id'];
      } else if (isCallbackIdentifiedBody(body)) {
        callbackId = body['callback_id'];
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
          context['callbackIdMatches'] = tempMatches;
        } else {
          return;
        }
      }
    }

    // Check type
    if ('type' in constraints) {
      if (body.type !== constraints.type) return;
    }

    // TODO: remove the non-null assertion operator
    await next!();
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
        context['matches'] = tempMatches;
      } else {
        return;
      }
    }

    // TODO: remove the non-null assertion operator
    await next!();
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

    // TODO: remove the non-null assertion operator
    await next!();
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
        context['matches'] = tempMatches;
      } else {
        return;
      }
    }

    // TODO: remove the non-null assertion operator
    await next!();
  };
}

export function ignoreSelf(): Middleware<AnyMiddlewareArgs> {
  return async (args) => {
    // When context does not have a botId in it, then this middleware cannot perform its job. Bail immediately.
    if (args.context.botId === undefined) {
      throw new ContextMissingPropertyError(
        'botId',
        'Cannot ignore events from the app without a bot ID. Ensure authorize callback returns a botId.',
      );
    }

    const botId = args.context.botId as string;
    const botUserId = args.context.botUserId !== undefined ? (args.context.botUserId as string) : undefined;

    if (isEventArgs(args)) {
      // Once we've narrowed the type down to SlackEventMiddlewareArgs, there's no way to further narrow it down to
      // SlackEventMiddlewareArgs<'message'> without a cast, so the following couple lines do that.
      if (args.message !== undefined) {
        const message = args.message as SlackEventMiddlewareArgs<'message'>['message'];
        // TODO: revisit this once we have all the message subtypes defined to see if we can do this better with
        // type narrowing
        // Look for an event that is identified as a bot message from the same bot ID as this app, and return to skip
        if (message.subtype === 'bot_message' && message.bot_id === botId) {
          return;
        }
      }

      // Its an Events API event that isn't of type message, but the user ID might match our own app. Filter these out.
      // However, some events still must be fired, because they can make sense.
      const eventsWhichShouldBeKept = ['member_joined_channel', 'member_left_channel'];
      const isEventShouldBeKept = eventsWhichShouldBeKept.includes(args.event.type);

      if (botUserId !== undefined && 'user' in args.event && args.event.user === botUserId && !isEventShouldBeKept) {
        return;
      }
    }

    // If all the previous checks didn't skip this message, then its okay to resume to next
    // TODO: remove the non-null assertion operator
    await args.next!();
  };
}

export function subtype(subtype1: string): Middleware<SlackEventMiddlewareArgs<'message'>> {
  // eslint-disable-line no-shadow
  return async ({ message, next }) => {
    if (message.subtype === subtype1) {
      // TODO: remove the non-null assertion operator
      await next!();
    }
  };
}

const slackLink = /<(?<type>[@#!])?(?<link>[^>|]+)(?:\|(?<label>[^>]+))?>/;

export function directMention(): Middleware<SlackEventMiddlewareArgs<'message'>> {
  return async ({ message, context, next }) => {
    // When context does not have a botUserId in it, then this middleware cannot perform its job. Bail immediately.
    if (context.botUserId === undefined) {
      throw new ContextMissingPropertyError(
        'botUserId',
        'Cannot match direct mentions of the app without a bot user ID. Ensure authorize callback returns a botUserId.',
      );
    }

    if (!('text' in message) || message.text === undefined) {
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

    // TODO: remove the non-null assertion operator
    await next!();
  };
}

function isBlockPayload(
  payload:
    | SlackActionMiddlewareArgs['payload']
    | SlackOptionsMiddlewareArgs['payload']
    | SlackViewMiddlewareArgs['payload'],
): payload is BlockElementAction | BlockSuggestion {
  return (payload as BlockElementAction | BlockSuggestion).action_id !== undefined;
}

type CallbackIdentifiedBody =
  | InteractiveMessage
  | DialogSubmitAction
  | MessageShortcut
  | GlobalShortcut
  | InteractiveMessageSuggestion
  | DialogSuggestion;

function isCallbackIdentifiedBody(
  body: SlackActionMiddlewareArgs['body'] | SlackOptionsMiddlewareArgs['body'] | SlackShortcutMiddlewareArgs['body'],
): body is CallbackIdentifiedBody {
  return (body as CallbackIdentifiedBody).callback_id !== undefined;
}

function isViewBody(
  body: SlackActionMiddlewareArgs['body'] | SlackOptionsMiddlewareArgs['body'] | SlackViewMiddlewareArgs['body'],
): body is SlackViewAction {
  return (body as SlackViewAction).view !== undefined;
}

function isEventArgs(args: AnyMiddlewareArgs): args is SlackEventMiddlewareArgs {
  return (args as SlackEventMiddlewareArgs).event !== undefined;
}
