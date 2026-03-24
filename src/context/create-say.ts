import type { ChatPostMessageArguments, WebClient } from '@slack/web-api';
import type { SayFn } from '../types';

export function createSay(client: WebClient, token: string | undefined, channelId: string): SayFn {
  return (message) => {
    let postMessageArguments: ChatPostMessageArguments;
    if (typeof message === 'string') {
      postMessageArguments = { token, text: message, channel: channelId };
    } else {
      postMessageArguments = { ...message, token, channel: channelId };
    }

    return client.chat.postMessage(postMessageArguments);
  };
}
