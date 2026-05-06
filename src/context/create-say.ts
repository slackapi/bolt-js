import type { ChatPostMessageArguments, WebClient } from '@slack/web-api';
import type { SayFn } from '../types';

export function createSay(client: WebClient, channelId: string): SayFn {
  return (message) => {
    let postMessageArguments: ChatPostMessageArguments;
    if (typeof message === 'string') {
      postMessageArguments = { text: message, channel: channelId };
    } else {
      postMessageArguments = { ...message, channel: channelId };
    }

    return client.chat.postMessage(postMessageArguments);
  };
}
