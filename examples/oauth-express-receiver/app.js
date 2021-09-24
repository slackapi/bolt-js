const { App, ExpressReceiver, LogLevel } = require('@slack/bolt');

// Create an ExpressReceiver
const receiver = new ExpressReceiver({ 
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-secret',
  scopes: ['chat:write'],
  installerOptions: {
    // If below is true, /slack/install redirects installers to the Slack authorize URL
    // without rendering the web page with "Add to Slack" button.
    // This flag is available in @slack/bolt v3.7 or higher
    // directInstall: true,
  },
  installationStore: {
    storeInstallation: async (installation) => {
      // replace database.set so it fetches from your database
      if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
        // support for org wide app installation
        return await database.set(installation.enterprise.id, installation);
      }
      if (installation.team !== undefined) {
        // single team app installation
        return await database.set(installation.team.id, installation);
      }
      throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
      // replace database.get so it fetches from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation lookup
        return await database.get(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        return await database.get(installQuery.teamId);
      }
      throw new Error('Failed fetching installation');
    },
  },
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
  await app.start(8080);
  console.log('Express app is running');
})();