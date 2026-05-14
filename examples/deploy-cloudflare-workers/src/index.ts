import { env as cfEnv } from 'cloudflare:workers';
import { App, type BlockButtonAction, CloudflareWorkerReceiver } from '@slack/bolt';

// Initialize your custom receiver
const cloudflareWorkerReceiver = new CloudflareWorkerReceiver({
  signingSecret: cfEnv.SLACK_SIGNING_SECRET,
});

// Initializes your app with your bot token and the Cloudflare Workers ready receiver
const app = new App({
  token: cfEnv.SLACK_BOT_TOKEN,
  receiver: cloudflareWorkerReceiver,

  // When using the CloudflareWorkerReceiver, processBeforeResponse can be omitted.
  // If you use other Receivers, such as ExpressReceiver for OAuth flow support
  // then processBeforeResponse: true is required. This option will defer sending back
  // the acknowledgement until after your handler has run to ensure your function
  // isn't terminated early by responding to the HTTP request that triggered it.

  // processBeforeResponse: true,

  // `deferInitialization: true` lets us call `await app.init()` inside
  // `fetch()`. Cloudflare Workers does not allow asynchronous I/O at module
  // scope.
  deferInitialization: true,
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  if (!('user' in message) || typeof message.user !== 'string') {
    return;
  }

  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Hey there <@${message.user}>!`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Click Me',
          },
          action_id: 'button_click',
        },
      },
    ],
    text: `Hey there <@${message.user}>!`,
  });
});

// Listens for an action from a button click
app.action<BlockButtonAction>('button_click', async ({ body, ack, say }) => {
  await ack();

  await say(`<@${body.user.id}> clicked the button`);
});

// Listens to incoming messages that contain "goodbye"
app.message('goodbye', async ({ message, say }) => {
  if (!('user' in message) || typeof message.user !== 'string') {
    return;
  }

  // say() sends a message to the channel where the event was triggered
  await say(`See ya later, <@${message.user}> :wave:`);
});

// Handle the Worker fetch event
export default {
  async fetch(request: Request, env: typeof cfEnv, ctx: ExecutionContext): Promise<Response> {
    // In Cloudflare Workers we need to initialize the app in the fetch because workers don't allow
    // asynchronous IO in the global scope.
    await app.init();

    const handler = await cloudflareWorkerReceiver.start();
    return handler(request, env, ctx);
  },
};
