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
export function onlyActions(): Middleware<AnyMiddlewareArgs & { action?: SlackAction }> {
  return ({ action, next }) => {
    // Filter out any non-actions
    if (action === undefined) {
      return;
    }

    // It matches so we should continue down this middleware listener chain
    next();
  };
}

/**
 * Middleware that filters out any event that isn't a command
 */
export function onlyCommands(): Middleware<AnyMiddlewareArgs & { command?: SlashCommand }> {
  return ({ command, next }) => {
    // Filter out any non-commands
    if (command === undefined) {
      return;
    }

    // It matches so we should continue down this middleware listener chain
    next();
  };
}

/**
 * Middleware that filters out any event that isn't an options
 */
export function onlyOptions(): Middleware<AnyMiddlewareArgs> {
  return ({ body, next }) => {
    // Filter out any non-actions
    if (!isOptionsBody(body)) {
      return;
    }

    // It matches so we should continue down this middleware listener chain
    next();
  };
}

/**
 * Middleware that filters out any event that isn't an event
 */
export function onlyEvents(): Middleware<AnyMiddlewareArgs & { event?: SlackEvent }> {
  return ({ event, next }) => {
    // Filter out any non-actions
    if (event === undefined) {
      return;
    }

    // It matches so we should continue down this middleware listener chain
    next();
  };
}

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
      if (!message.text.includes(pattern)) {
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

/**
 * Middleware that ignores messages from this bot user (self) when we can tell. Requires the
 * meta context to be populated with `app_bot_id`.
 */
export function ignoreSelfMiddleware(): Middleware<AnyMiddlewareArgs> {
  return ({ next }) => {
    // TODO
    // emit error if the botId is not defined
    // if (msg.isBot() && msg.isMessage() && msg.body.event.subtype === 'bot_message') {
    //   let bothFalsy = !msg.meta.app_bot_id && !msg.meta.bot_id
    //   let bothEqual = msg.meta.app_bot_id === msg.meta.bot_id
    //   if (!bothFalsy && bothEqual) {
    //     return
    //   }
    // }
    next();
  };
}

/**
 * Middleware that ignores messages from any bot user
 */
export function ignoreBotsMiddleware(): Middleware<AnyMiddlewareArgs> {
  return ({ next }) => {
    // TODO
    // if (msg.isBot() && msg.isMessage() && msg.body.event.subtype === 'bot_message') {
    //   return
    // }
    next();
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
  // TODO: fill in a test for what an external_select options looks like once we sort out the payload
  return false;
}
