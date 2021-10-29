const { App, HTTPReceiver } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: new HTTPReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    customPropertiesExtractor: (req) => {
      return {
        "headers": req.headers,
        "foo": "bar",
      };
    },
    // other custom handlers
    dispatchErrorHandler: ({ error, logger, response }) => {
      logger.error(`dispatch error: ${error}`);
      response.writeHead(404);
      response.write("Something is wrong!");
      response.end();
    },
    processEventErrorHandler: ({ error, logger, response }) => {
      logger.error(`processEvent error: ${error}`);
      // acknowledge it anyway!
      response.writeHead(200);
      response.end();
      return true;
    },
    unhandledRequestHandler: async ({ logger, response }) => {
      // acknowledge it anyway!
      logger.info('Acknowledging this incoming request because 2 seconds already passed...');
      response.writeHead(200);
      response.end();
    },
    unhandledRequestTimeoutMillis: 2000, // the default is 3001
  }),
});

app.use(async ({ logger, context, next }) => {
  logger.info(context);
  await next();
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();