import type { AssistantThreadsSetStatusArguments, AssistantThreadsSetStatusResponse, WebClient } from '@slack/web-api';

export type SetStatusArguments = Omit<AssistantThreadsSetStatusArguments, 'channel_id' | 'thread_ts'>;

export type SetStatusFn = (status: string | SetStatusArguments) => Promise<AssistantThreadsSetStatusResponse>;

export function createSetStatus(client: WebClient, channelId: string, threadTs: string): SetStatusFn {
  return (status: string | SetStatusArguments) => {
    if (typeof status === 'string') {
      return client.assistant.threads.setStatus({
        channel_id: channelId,
        thread_ts: threadTs,
        status,
      });
    }
    return client.assistant.threads.setStatus({
      channel_id: channelId,
      thread_ts: threadTs,
      ...status,
    });
  };
}
