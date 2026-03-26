import type { WebClient } from '@slack/web-api';
import type { Context } from '../types';

export interface SayStreamArguments {
  buffer_size?: number;
  channel?: string;
  thread_ts?: string;
  recipient_team_id?: string;
  recipient_user_id?: string;
}

export type SayStreamFn = (args?: SayStreamArguments) => ReturnType<WebClient['chatStream']>;

export function createSayStream(client: WebClient, context: Context, channelId: string, threadTs: string): SayStreamFn {
  return (args?: SayStreamArguments) => {
    return client.chatStream({
      ...(args?.buffer_size !== undefined && { buffer_size: args.buffer_size }),
      channel: args?.channel ?? channelId,
      thread_ts: args?.thread_ts ?? threadTs,
      recipient_team_id: args?.recipient_team_id ?? context.teamId ?? context.enterpriseId,
      recipient_user_id: args?.recipient_user_id ?? context.userId,
    });
  };
}
