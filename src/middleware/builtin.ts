import {
  Middleware,
  KeyValueMapping,
  SlashCommand,
  SlackEvent,
  AnyMiddlewareArgs,
  SlackAction,
  InteractiveMessage,
  InteractiveAction,
  DialogSubmitAction,
  MessageAction,
  ActionConstraints,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  UnknownElementAction,
  MenuSelect,
  ButtonClick,
} from './types';

/**
 * Middleware that filters out any event that isn't an action
 */
export const onlyActions: Middleware<AnyMiddlewareArgs & { action?: SlackAction }> = ({ action, next }) => {
  // Filter out any non-actions
  if (action === undefined) {
    return;
  }

  // It matches so we should continue down this middleware listener chain
  next();
};

/**
 * Middleware that filters out any event that isn't a command
 */
export const onlyCommands: Middleware<AnyMiddlewareArgs & { command?: SlashCommand }> = ({ command, next }) => {
  // Filter out any non-commands
  if (command === undefined) {
    return;
  }

  // It matches so we should continue down this middleware listener chain
  next();
};

/**
 * Middleware that filters out any event that isn't an options
 */
export const onlyOptions: Middleware<AnyMiddlewareArgs> = ({ body, next }) => {
  // Filter out any non-actions
  if (!isOptionsBody(body)) {
    return;
  }

  // It matches so we should continue down this middleware listener chain
  next();
};

/**
 * Middleware that filters out any event that isn't an event
 */
export const onlyEvents: Middleware<AnyMiddlewareArgs & { event?: SlackEvent }> = ({ event, next }) => {
  // Filter out any non-actions
  if (event === undefined) {
    return;
  }

  // It matches so we should continue down this middleware listener chain
  next();
};

/**
 * Middleware that checks for matches given constraints
 */
export function matchActionConstraints(
    constraints: ActionConstraints,
    // TODO: this function signature could be wrong. this gets used in options() so the action property can be undefined
  ): Middleware<SlackActionMiddlewareArgs<SlackAction>> {
  return ({ action, next, context }) => {
    // NOTE: DialogSubmitAction and MessageAction do not have an actions array
    const innerAction: InteractiveAction | UnknownElementAction<string> | undefined =
      action.actions !== undefined ? action.actions[0] : undefined;

    // TODO: is putting matches in an array actually helpful? there's no way to know which of the regexps contributed
    // which matches (and in which order)
    let tempMatches: RegExpExecArray | null;
    const matches: any[] = [];

    if (constraints.block_id !== undefined) {
      if (innerAction === undefined || !isElementAction(innerAction)) {
        return;
      }

      if (typeof constraints.block_id === 'string') {
        if (innerAction.block_id !== constraints.block_id) {
          return;
        }
      } else {
        if ((tempMatches = constraints.block_id.exec(innerAction.block_id)) !== null) {
          matches.concat(tempMatches);
        } else {
          return;
        }
      }
    }

    if (constraints.action_id !== undefined) {
      if (innerAction === undefined || !isElementAction(innerAction)) {
        return;
      }

      if (typeof constraints.action_id === 'string') {
        if (innerAction.action_id !== constraints.action_id) {
          return;
        }
      } else {
        if ((tempMatches = constraints.action_id.exec(innerAction.action_id)) !== null) {
          matches.concat(tempMatches);
        } else {
          return;
        }
      }
    }

    if (constraints.callback_id !== undefined) {
      if (!isCallbackIdentifiedAction(action)) {
        return;
      }
      if (typeof constraints.callback_id === 'string') {
        if (action.callback_id !== constraints.callback_id) {
          return;
        }
      } else {
        if ((tempMatches = constraints.callback_id.exec(action.callback_id)) !== null) {
          matches.concat(tempMatches);
        } else {
          return;
        }
      }
    }

    // Add matches to context
    context['matches'] = matches;

    next();
  };
}

/*
 * Middleware that filters out messages that don't match pattern
 */
export function matchMessage(pattern: string | RegExp): Middleware<SlackEventMiddlewareArgs<'message'>> {
  return ({ message, context, next }) => {
    let tempMatches: RegExpExecArray | null;

    // Filter out messages that don't contain the pattern
    if (typeof pattern === 'string') {
      if (message.text !== undefined && !message.text.includes(pattern)) {
        return;
      }
    } else {
      if ((tempMatches = pattern.exec(message.text)) !== null) {
        context['matches'] = tempMatches;
      } else {
        return;
      }
    }

    next();
  };
}

/**
 * Middleware that filters out any command that doesn't match name
 */
export function matchCommandName(name: string): Middleware<SlackCommandMiddlewareArgs> {
  return ({ command, next }) => {
    // Filter out any commands that are not the correct command name
    if (name !== command.command) {
      return;
    }

    next();
  };
}

/**
 * Middleware that filters out any event that isn't of given type
 */
export function matchEventType(type: string): Middleware<SlackEventMiddlewareArgs<string>> {
  return ({ event, next }) => {
    // Filter out any events that are not the correct type
    if (type !== event.type) {
      return;
    }

    next();
  };
}

export function ignoreSelfMiddleware(): Middleware<AnyMiddlewareArgs> {
  return (args) => {
    // TODO: we might be able to query for the botId and/or botUserId and cache it to avoid errors/warnings.
    // if so, the botId check would emit a warning instead of an error.

    // When context does not have a botId in it, then this middleware cannot perform its job. Bail immediately.
    if (args.context.botId === undefined) {
      // TODO: coded error
      args.next(new Error('Cannot ignore events from the app\'s own bot user without a bot ID. ' +
        'Use authorize option to return a botId.'));
      return;
    }

    const botId = args.context.botId as string;
    const botUserId = args.context.botUserId !== undefined ? args.context.botUserId as string : undefined;

    if (isEventArgs(args)) {
      // Once we've narrowed the type down to SlackEventMiddlewareArgs<string>, there's no way to further narrow it
      // down to SlackEventMiddlewareArgs<'message'> without a cast, so the following couple lines do that.
      if (args.message !== undefined) {
        const message = args.message as SlackEventMiddlewareArgs<'message'>['message'];

        // TODO: revisit this once we have all the message subtypes defined to see if we can do this better with
        // type narrowing
        // Look for an event that is identified as a bot message from the same bot ID as this app, and return to skip
        if (message.subtype === 'bot_message' && message.bot_id === botId) {
          return;
        }

      }
    }

    // Look for any events (not just Events API) that are from the same userId as this app, and return to skip
    // NOTE: this goes further than Slapp's previous ignoreSelf middleware. That middleware only applied this filter
    // when the event was of type message. Is this okay?
    if (botUserId !== undefined && args.payload.user === botUserId) {
      return;
    }

    // If all the previous checks didn't skip this message, then its okay to resume to next
    args.next();
  };
}

/**
 * Middleware that ignores messages from any bot user
 */
export function ignoreBotsMiddleware(): Middleware<AnyMiddlewareArgs> {
  return (args) => {
    if (isEventArgs(args)) {
      // Once we've narrowed the type down to SlackEventMiddlewareArgs<string>, there's no way to further narrow it
      // down to SlackEventMiddlewareArgs<'message'> without a cast, so the following couple lines do that.
      if (args.message !== undefined) {
        const message = args.message as SlackEventMiddlewareArgs<'message'>['message'];

        // TODO: revisit this once we have all the message subtypes defined to see if we can do this better with
        // type narrowing
        // Look for an event that is identified as a bot message from the same bot ID as this app, and return to skip
        if (message.subtype === 'bot_message') {
          return;
        }
      }
    }

    // If all the previous checks didn't skip this message, then its okay to resume to next
    args.next();
  };
}

function isElementAction(
  action: InteractiveAction | UnknownElementAction<string>,
): action is UnknownElementAction<string> {
  return (action as UnknownElementAction<string>).action_id !== undefined;
}

type CallbackIdentifiedAction =
  | InteractiveMessage<ButtonClick>
  | InteractiveMessage<MenuSelect>
  | DialogSubmitAction
  | MessageAction;

function isCallbackIdentifiedAction(action: SlackAction<string>): action is CallbackIdentifiedAction {
  return (action as CallbackIdentifiedAction).callback_id !== undefined;
}

function isEventArgs(
  args: AnyMiddlewareArgs,
): args is SlackEventMiddlewareArgs<string> {
  return (args as SlackEventMiddlewareArgs<string>).event !== undefined;
}

/**
 * Helper function that determines if a payload is an options payload
 * TODO: Get rid of use of KeyValueMapping
 */
function isOptionsBody(body: KeyValueMapping): boolean {
  if (body.type === 'dialog_suggestion') {
    return true;
  }
  if (body.type === 'interactive_message' && body.name !== undefined) {
    return true;
  }
  if (body.type === 'block_suggestion') {
    return true;
  }
  return false;
}
