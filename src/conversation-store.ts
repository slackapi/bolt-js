import { getTypeAndConversation } from './helpers';
import type { AnyMiddlewareArgs, Middleware } from './types';

/**
 * Storage backend used by the conversation context middleware
 */
// biome-ignore lint/suspicious/noExplicitAny: user-defined convo values can be anything
export interface ConversationStore<ConversationState = any> {
  // NOTE: expiresAt is in milliseconds
  set(conversationId: string, value: ConversationState, expiresAt?: number): Promise<unknown>;
  get(conversationId: string): Promise<ConversationState>;
}

/**
 * Default implementation of ConversationStore, which stores data in memory.
 *
 * This should not be used in situations where there is more than once instance of the app running because state will
 * not be shared amongst the processes.
 */
// biome-ignore lint/suspicious/noExplicitAny: user-defined convo values can be anything
export class MemoryStore<ConversationState = any> implements ConversationStore<ConversationState> {
  private state: Map<string, { value: ConversationState; expiresAt?: number }> = new Map();

  public set(conversationId: string, value: ConversationState, expiresAt?: number): Promise<void> {
    return new Promise((resolve) => {
      this.state.set(conversationId, { value, expiresAt });
      resolve();
    });
  }

  public get(conversationId: string): Promise<ConversationState> {
    return new Promise((resolve, reject) => {
      const entry = this.state.get(conversationId);
      if (entry !== undefined) {
        if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
          // release the memory
          this.state.delete(conversationId);
          reject(new Error('Conversation expired'));
        }
        resolve(entry.value);
      }
      reject(new Error('Conversation not found'));
    });
  }
}

/**
 * Conversation context global middleware.
 *
 * This middleware allows listeners (and other middleware) to store state related to the conversationId of an incoming
 * event using the `context.updateConversation()` function. That state will be made available in future events that
 * take place in the same conversation by reading from `context.conversation`.
 *
 * @param store storage backend used to store and retrieve all conversation state
 * @param logger a logger
 */
// biome-ignore lint/suspicious/noExplicitAny: user-defined convo values can be anything
export function conversationContext<ConversationState = any>(
  store: ConversationStore<ConversationState>,
): Middleware<AnyMiddlewareArgs> {
  return async ({ body, context, next, logger }) => {
    const { conversationId } = getTypeAndConversation(body);
    if (conversationId !== undefined) {
      context.updateConversation = (conversation: ConversationState, expiresAt?: number) =>
        store.set(conversationId, conversation, expiresAt);
      try {
        context.conversation = await store.get(conversationId);
        logger.debug(`Conversation context loaded for ID: ${conversationId}`);
      } catch (error) {
        const e = error as Error;
        if (e.message !== undefined && e.message !== 'Conversation not found') {
          // The conversation data can be expired - error: Conversation expired
          logger.debug(`Conversation context failed loading for ID: ${conversationId}, error: ${e.message}`);
        }
      }
    } else {
      logger.debug('No conversation ID for incoming event');
    }
    await next();
  };
}
