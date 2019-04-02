import {
  Middleware,
  KeyValueMapping,
  Actions,
  ExternalSelectResponse,
  SlashCommand,
  AnyMiddlewareArgs,
  SlackAction,
  InteractiveMessage,
  InteractiveAction,
  DialogSubmitAction,
  MessageAction,
  ExternalOptionsRequest,
  Container,
  ActionConstraint,
  ObjectConstraint,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
} from './types';

/**
 * Middleware that filters out any event that isn't an action
 */
export function matchActions(): Middleware<AnyMiddlewareArgs & { action?: SlackAction }> {
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
export function matchCommands(): Middleware<AnyMiddlewareArgs & { command?: SlashCommand }> {
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
export function matchOptions(): Middleware<AnyMiddlewareArgs> {
  return ({ payload, next }) => {
    // Filter out any non-actions
    if (!isOptionsPayload(payload)) {
      return;
    }

    // It matches so we should continue down this middleware listener chain
    next();
  };
}

/**
 * Helper function that determines if a payload is an options payload
 */
function isOptionsPayload(payload: KeyValueMapping): boolean {
  if (payload.type !== 'dialog_suggestion' && !isInteractiveMessageOptions(payload) && !isExternalSelect(payload)) {
    return false;
  }
  return true;
}

/**
 * Typeguard that decides if a payload is an interactive message options request
 */
function isInteractiveMessageOptions(payload: KeyValueMapping):
payload is ExternalOptionsRequest<'interactive_message'> {
  if ((payload as InteractiveMessage<InteractiveAction>).actions) {
    return false;
  }
  if (payload.type !== 'interactive_message') return false;
  return false;
}

/**
 * Typeguard that decides if a payload is an interactive message options request
 */
function isExternalSelect(payload: KeyValueMapping):
payload is Actions<ExternalSelectResponse> {
  if ((payload as Actions<ExternalSelectResponse>).actions &&
    (payload as Actions<ExternalSelectResponse>).actions[0].type === 'external_select') {
    return true;
  }
  return false;
}

/**
 * Typeguard that decides whether a constraint object is an options constraint object
 */
function isOptionConstraint(actionOrOptionConstraint: ActionConstraint |
  ObjectConstraint): actionOrOptionConstraint is ObjectConstraint {
  if ((actionOrOptionConstraint as ObjectConstraint).container) {
    return true;
  }
  return false;
}

/**
 * Typeguard that decides whether a constraint object is an options constraint object
 */
function hasCallbackId(payload: { [key: string]: any; }): payload is (
    InteractiveMessage<InteractiveAction> | DialogSubmitAction | MessageAction | ExternalOptionsRequest<Container>
  ) {
  if ((payload as (InteractiveMessage<InteractiveAction> | DialogSubmitAction |
    MessageAction | ExternalOptionsRequest<Container>)).callback_id) {
    return true;
  }
  return false;
}

/**
 * Middleware that checks for matches given constraints
 */
export function matchActionConstraints(
    constraints: ActionConstraint | ObjectConstraint,
  ): Middleware<SlackActionMiddlewareArgs<SlackAction>> {
  return ({ action, next, context }) => {
    let tempMatches: RegExpExecArray | null;
    const matches: any[] = [];

    if (constraints.block_id) {
      if (typeof constraints.block_id === 'string' && action.block_id !== constraints.block_id) {
        return;
      }

      if ((tempMatches = (constraints.block_id as RegExp).exec(action.block_id)) != null) {
        matches.concat(tempMatches);
      } else return;
    }

    if (constraints.action_id) {
      if (typeof constraints.action_id === 'string' && action.action_id !== constraints.action_id) {
        return;
      }

      if ((tempMatches = (constraints.action_id as RegExp).exec(action.action_id)) != null) {
        matches.concat(tempMatches);
      } else return;
    }

    if (constraints.callback_id) {
      if (hasCallbackId(action)) {
        if (typeof constraints.callback_id === 'string' && action.callback_id !== constraints.callback_id) {
          return;
        }

        if ((tempMatches = (constraints.callback_id as RegExp).exec(action.callback_id)) != null) {
          matches.concat(tempMatches);
        } else return;
      } else return;
    }

    if (isOptionConstraint(constraints)) {
      if (constraints.container === 'dialog' && action.type !== 'dialog_suggestion') {
        return;
      }

      if (constraints.container === 'interactive_message' && action.type !== 'interactive_message') {
        return;
      }

      if (constraints.container === 'block_actions' && action.type !== 'block_actions') {
        return;
      }
    }

    // Add matches to context
    context['matches'] = matches;

    next();
  };
}

/**
 * Middleware that filters out any event that isn't a command
 */
export function matchCommandName(name: string): Middleware<SlackCommandMiddlewareArgs> {
  return ({ command, next }) => {
    // Filter out any commands without commandName
    if (name !== command.text) {
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
