const { App, HTTPReceiver, ExpressReceiver } = require('@slack/bolt');

const useExpress = false;

let receiver;
receiver = new HTTPReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  customPropertiesExtractor: (req) => {
    return {
      "headers": req.headers,
      "foo": "bar",
    };
  }
});
if (useExpress) {
  receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    customPropertiesExtractor: (req) => {
      return {
        "headers": req.headers,
        "foo": "bar",
      };
    }
  });
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
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