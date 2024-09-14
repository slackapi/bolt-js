import type { ChatPostMessageResponse } from '@slack/web-api';
import { expectType } from 'tsd';
// eslint-disable-next-line
import App from '../src/App';
import type { InteractiveButtonClick } from '../src/types';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

app.action<InteractiveButtonClick>('my_callback_id', async ({ respond, say }) => {
  // Expect respond to work with text
  await respond({ text: 'Some text' });

  // Expect respond to work without text
  await respond({ delete_original: true });

  // Expect say to work with text
  const response = await say({ text: 'Some more text' });
  expectType<ChatPostMessageResponse>(response);
  say({ blocks: [] });
});
