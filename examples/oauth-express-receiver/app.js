const { App, ExpressReceiver, LogLevel, FileInstallationStore } = require('@slack/bolt');

// Create an ExpressReceiver
const receiver = new ExpressReceiver({ 
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: ['chat:write'],
  installerOptions: {
    // If below is true, /slack/install redirects installers to the Slack authorize URL
    // without rendering the web page with "Add to Slack" button.
    // This flag is available in @slack/bolt v3.7 or higher
    // directInstall: true,
  },
  installationStore: new FileInstallationStore(),
});

// Create the Bolt App, using the receiver
const app = new App({
  receiver,
  logLevel: LogLevel.DEBUG, // set loglevel at the App level
});

// Slack interactions like listening for events are methods on app
app.event('message', async ({ event, client }) => {
  // Do some slack-specific stuff here
  // await client.chat.postMessage(...);
});

// Set up other handling for other web requests as methods on receiver.router
receiver.router.get('/secret-page', (req, res) => {
  // You're working with an express req and res now.
  res.send('yay!');
});

(async () => {
  await app.start(3000);
  console.log('Express app is running');
})();
