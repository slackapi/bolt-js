import { Middleware, AnyMiddlewareArgs } from './types';
import { getTypeAndConversation } from './helpers';

/**
 * Storage backend used by the conversation context middleware
 */
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
export function conversationContext<ConversationState = any>(
  store: ConversationStore<ConversationState>,
): Middleware<AnyMiddlewareArgs> {
  return async ({ body, context, next, logger }) => {
    const { conversationId } = getTypeAndConversation(body);
    if (conversationId !== undefined) {
      // TODO: expiresAt is not passed through to store.set
      context.updateConversation = (conversation: ConversationState) => store.set(conversationId, conversation);
      try {
        context.conversation = await store.get(conversationId);
        logger.debug(`Conversation context loaded for ID ${conversationId}`);
      } catch (error) {
        logger.debug(`Conversation context failed loading for ID: ${conversationId}, error: ${error.message}`);
      }
    } else {
      logger.debug('No conversation ID for incoming event');
    }
    // TODO: remove the non-null assertion operator
    await next!();
  };
}
