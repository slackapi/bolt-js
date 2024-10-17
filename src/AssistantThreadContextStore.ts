import { ChatUpdateArguments } from '@slack/web-api';
import { Block, KnownBlock, MessageMetadataEventPayloadObject } from '@slack/types';
import { AllAssistantMiddlewareArgs, extractThreadInfo } from './Assistant';

export interface AssistantThreadContextStore {
  get: GetThreadContextFn;
  save: SaveThreadContextFn;
}

export interface GetThreadContextFn {
  (args: AllAssistantMiddlewareArgs): Promise<AssistantThreadContext>;
}

export interface SaveThreadContextFn {
  (args: AllAssistantMiddlewareArgs): Promise<void>;
}

export interface AssistantThreadContext {
  channel_id?: string;
  team_id?: string;
  enterprise_id?: string | null;
}

export class DefaultThreadContextStore implements AssistantThreadContextStore {
  private context: AssistantThreadContext = {};

  public async get(args: AllAssistantMiddlewareArgs): Promise<AssistantThreadContext> {
    const { context, client, payload, logger } = args;

    logger.debug('DefaultAssistantThreadStore: get method called');

    if (this.context.channel_id) {
      return this.context;
    }

    const { channelId: channel, threadTs: thread_ts } = extractThreadInfo(payload);

    // Retrieve the current thread history
    const thread = await client.conversations.replies({
      channel,
      ts: thread_ts,
      oldest: thread_ts,
      include_all_metadata: true,
      limit: 4,
    });

    if (!thread.messages) return {};

    // Find the first message in the thread that holds the current context using metadata.
    // See createSaveThreadContext below for a description and explanation for this approach.
    const initialMsg = thread.messages.find((m) => !('subtype' in m) && m.user === context.botUserId);
    const threadContext = initialMsg && initialMsg.metadata ? initialMsg.metadata.event_payload : null;

    return threadContext || {};
  }

  public async save(args: AllAssistantMiddlewareArgs): Promise<void> {
    const { context, client, payload, logger } = args;
    const { channelId: channel, threadTs: thread_ts, context: threadContext } = extractThreadInfo(payload);

    logger.debug('DefaultAssistantThreadStore: save method called');

    // Retrieve first several messages from the current Assistant thread
    const thread = await client.conversations.replies({
      channel,
      ts: thread_ts,
      oldest: thread_ts,
      include_all_metadata: true,
      limit: 4,
    });

    if (!thread.messages) return;

    // Find and update the initial Assistant message with the new context to ensure the
    // thread always contains the most recent context that user is sending messages from.
    const initialMsg = thread.messages.find((m) => !('subtype' in m) && m.user === context.botUserId);
    if (initialMsg && initialMsg.ts) {
      const params: ChatUpdateArguments = {
        channel,
        ts: initialMsg.ts,
        text: initialMsg.text,
        metadata: {
          event_type: 'assistant_thread_context',
          event_payload: threadContext as MessageMetadataEventPayloadObject,
        },
      };

      if (initialMsg.blocks) {
        params.blocks = initialMsg.blocks as (KnownBlock | Block)[];
      }

      await client.chat.update(params);
    }

    this.context = threadContext;
  }
}
