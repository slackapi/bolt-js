const { App, LogLevel } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: LogLevel.DEBUG,
});

(async () => {
  await app.start();
  app.logger.info('⚡️ Bolt app started');
})();

// Listen to slash command
// Post a message with Message Metadata
app.command('/post', async ({ ack, say }) => {
  await ack();
  await say({
    text: 'Message Metadata Posting',
    metadata: {
      event_type: 'my_event',
      event_payload: {
        key: 'value',
      },
    },
  });
});

app.event('message_metadata_posted', async ({ event, say }) => {
  const { message_ts: thread_ts } = event;
  await say({
    text: 'Message Metadata Posted',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Message Metadata Posted',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `${JSON.stringify(event.metadata)}`,
          },
        ],
      },
    ],
    thread_ts,
  });
});
