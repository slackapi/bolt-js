import { expectError } from 'tsd';
import { App, InteractiveButtonClick } from '../';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

app.action<InteractiveButtonClick>('my_callback_id', async ({ respond, say }) => {
  // Expect respond to work with text
  await respond({ text: 'Some text' });

  // Expect respond to work without text
  await respond({ delete_original: true });

  // Expect say to work with text
  await say({ text: 'Some more text' });

  // Expect an error when calling say without text
  expectError(await say({ blocks: [] }));
});
