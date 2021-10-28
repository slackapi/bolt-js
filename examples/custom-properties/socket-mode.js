const { App, SocketModeReceiver } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: new SocketModeReceiver({
    appToken: process.env.SLACK_APP_TOKEN,
    customPropertiesExtractor: ({ type, body }) => {
      return {
        "socket_mode_payload_type": type,
        "socket_mode_payload": body,
        "foo": "bar",
      };
    }
  }),
});

app.use(async ({ logger, context, next }) => {
  logger.info(context);
  await next();
});

(async () => {
  // Start your app
  await app.start();

  console.log('⚡️ Bolt app is running!');
})();