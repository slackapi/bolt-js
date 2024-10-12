import { MessageMetadataEventPayloadObject } from '@slack/types';
import { AllAssistantMiddlewareArgs, extractThreadInfo, GetThreadContextFn, SaveThreadContextFn } from './Assistant';

export interface AssistantThreadContextStore {
  get: GetThreadContextFn;
  save: SaveThreadContextFn;
}

export interface AssistantThreadContext {
  channel_id?: string;
  team_id?: string;
  enterprise_id?: string | null;
}

export class DefaultThreadContextStore implements AssistantThreadContextStore {
  private context: AssistantThreadContext = {};

  public async save(args: AllAssistantMiddlewareArgs): Promise<void> {
    console.log('***********************************************');
    console.log('DEFAULT THREAD CONTEXT STORE : SAVE CALLED');
    console.log('***********************************************');
    const { context, client, payload } = args;
    const { channelId: channel, threadTs: thread_ts, context: threadContext } = extractThreadInfo(payload);

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
    const initialMsg = thread.messages.find((m) => !m.subtype && m.user === context.botUserId);
    if (initialMsg) {
      const { ts, text, blocks } = initialMsg as any; // TODO : TS
      await client.chat.update({
        channel,
        ts,
        text,
        blocks,
        metadata: {
          event_type: 'assistant_thread_context',
          event_payload: threadContext as MessageMetadataEventPayloadObject,
        },
      });
    }

    console.log('context that was saved => ', threadContext);
    this.context = threadContext;
  }

  // public async get(args: AllAssistantMiddlewareArgs): Promise<AssistantThreadContext> {
  public async get(args: AllAssistantMiddlewareArgs): Promise<AssistantThreadContext> {
    console.log('***********************************************');
    console.log('DEFAULT THREAD CONTEXT STORE : GET CALLED');
    console.log('***********************************************');
    const { context, client, payload } = args;
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
    const initialMsg = thread.messages.find((m) => !m.subtype && m.user === context.botUserId);
    const threadContext = initialMsg && initialMsg.metadata ? initialMsg.metadata.event_payload : null;

    console.log('get: this.context => ', this.context);
    return threadContext || {};
  }
  // }
}
