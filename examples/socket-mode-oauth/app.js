const { App, LogLevel } = require('@slack/bolt');

const app = new App({
  logLevel: LogLevel.DEBUG,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  scopes: ['channels:history', 'chat:write', 'commands'],
});

/** Start Bolt App */
(async () => {
  try {
    await app.start(process.env.PORT);
    console.log('⚡️ Bolt app is running! ⚡️');
  } catch (error) {
    console.error('Unable to start App', error);
    process.exit(1);
  }
})();
