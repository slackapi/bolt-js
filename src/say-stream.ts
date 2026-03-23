import type { WebClient } from '@slack/web-api';
import type { Context, SayStreamArguments, SayStreamFn } from './types';

interface CreateSayStreamArgs {
  context: Context;
  channelId: string;
  client: WebClient;
  // biome-ignore lint/suspicious/noExplicitAny: body type varies by incoming event type
  body: Record<string, any>;
}

export function createSayStream({ channelId, client, context, body }: CreateSayStreamArgs): SayStreamFn {
  return async (args?: SayStreamArguments) => {
    const event = body?.event;
    const thread_ts = args?.thread_ts ?? event?.thread_ts ?? event?.assistant_thread?.thread_ts ?? event?.ts;
    if (!thread_ts) {
      throw new Error('sayStream requires a thread_ts but none could be determined from the event context');
    }
    return client.chatStream({
      channel: args?.channel ?? channelId,
      thread_ts,
      recipient_team_id: args?.recipient_team_id ?? context.teamId ?? context.enterpriseId,
      recipient_user_id: args?.recipient_user_id ?? context.userId,
      buffer_size: args?.buffer_size,
    });
  };
}
