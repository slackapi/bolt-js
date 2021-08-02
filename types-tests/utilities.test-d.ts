import { App, InteractiveButtonClick } from '../';
import { expectType } from 'tsd';
import { ChatPostMessageResponse } from '@slack/web-api';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

app.action<InteractiveButtonClick>('my_callback_id', async ({ respond, say }) => {
  // Expect respond to work with text
  await respond({ text: 'Some text' });

  // Expect respond to work without text
  await respond({ delete_original: true });

  // Expect say to work with text
  const response = await say({ text: 'Some more text' });
  expectType<ChatPostMessageResponse>(response);

  // since web-api v6.2, this is not an error anymore
  // Expect an error when calling say without text
  // expectError(await say({ blocks: [] }));
});
