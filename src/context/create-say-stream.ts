import type { WebClient } from '@slack/web-api';
import type { Context } from '../types';

type ChatStreamParams = Parameters<WebClient['chatStream']>[0];
export type SayStreamArguments = Partial<Omit<ChatStreamParams, 'token'>>;

export type SayStreamFn = (args?: SayStreamArguments) => ReturnType<WebClient['chatStream']>;

export function createSayStream(client: WebClient, context: Context, channelId: string, threadTs: string): SayStreamFn {
  return (args?: SayStreamArguments) => {
    return client.chatStream({
      channel: channelId,
      thread_ts: threadTs,
      recipient_team_id: context.teamId ?? context.enterpriseId,
      recipient_user_id: context.userId,
      ...args,
    });
  };
}
