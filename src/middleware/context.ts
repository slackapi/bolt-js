/* eslint-disable import/prefer-default-export */
import { Context } from '../types';

/**
 * Gather a token from the invocation context as set during app initialization.
 * This is either from the function execution context or a bot or user token and
 * is the token used in handlers.
 *
 * The functionBotAccessToken is set in context during `App` initialization if
 * configured during setup so that continuity between a function_executed event
 * and subsequent interactive events (actions) is preserved.
 *
 * The botToken and userToken remain available in context regardless of this but
 * the functionBotAccess token cannot be switched between functions. Middleware
 * granularity for this decision is left TODO.
 *
 * @param context - the incoming payload context.
 * @link https://github.com/slackapi/bolt-js/pull/2026#discussion_r1467123047
 */
export function selectToken(context: Context): string | undefined {
  if (context.functionBotAccessToken) {
    return context.functionBotAccessToken;
  }
  return context.botToken ?? context.userToken;
}
