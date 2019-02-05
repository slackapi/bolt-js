export interface NextMiddleware {
  (error: Error): void;
  (postProcess: (error: Error | undefined, done: (error?: Error) => void) => any): void;
  (): void;
}

// TODO: should this become a generic, so that specific handlers can bind to handling a specific type, and become
// aware of which aliases are available?
export interface MiddlewareArguments {
  // Payload and its aliases
  payload: object;
  message?: object;
  event?: object;

  // Body (superset of payload)
  body: object;

  context: object;

  say?: (message: string | object) => void;

  ack?: (message?: string | object) => void;

  respond?: (message: string | object) => void;
}

export interface Middleware {
  (args: MiddlewareArguments): void;
}

export function process(initialArguments: MiddlewareArguments, middleware: Middleware[]): void {
  // TODO
}

/**
 * Middleware that ignores messages from this bot user (self) when we can tell. Requires the
 * meta context to be populated with `app_bot_id`.
 */
export function ignoreSelfMiddleware(): Middleware {
  return ({ payload, next }) => {
    // TODO
    if (msg.isBot() && msg.isMessage() && msg.body.event.subtype === 'bot_message') {
      let bothFalsy = !msg.meta.app_bot_id && !msg.meta.bot_id
      let bothEqual = msg.meta.app_bot_id === msg.meta.bot_id
      if (!bothFalsy && bothEqual) {
        return
      }
    }
    next()
  }
}

/**
 * Middleware that ignores messages from any bot user
 */

export function ignoreBotsMiddleware(): Middleware {
  return ({ payload, next }) => {
    // TODO
    if (msg.isBot() && msg.isMessage() && msg.body.event.subtype === 'bot_message') {
      return
    }
    next()
  }
}