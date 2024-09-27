import Router from '@koa/router';
import { App, FileInstallationStore } from '@slack/bolt';
import { ConsoleLogger, LogLevel } from '@slack/logger';
import { FileStateStore } from '@slack/oauth';
import Koa from 'koa';
import KoaReceiver from './KoaReceiver';

if (!process.env.SLACK_SIGNING_SECRET) {
  throw new Error('SLACK_SIGNING_SECRET environment variable not found!');
}

const logger = new ConsoleLogger();
logger.setLevel(LogLevel.DEBUG);
const koa = new Koa();
const router = new Router();

router.get('/', async (ctx) => {
  ctx.redirect('/slack/install');
});

const receiver = new KoaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: ['commands', 'chat:write', 'app_mentions:read'],
  installationStore: new FileInstallationStore(),
  installerOptions: {
    directInstall: true,
    stateStore: new FileStateStore({}),
  },
  koa,
  router,
});

const app = new App({
  logLevel: LogLevel.DEBUG,
  logger,
  receiver,
});

app.event('app_mention', async ({ event, say }) => {
  await say({
    text: `<@${event.user}> Hi there :wave:`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<@${event.user}> Hi there :wave:`,
        },
      },
    ],
  });
});

(async () => {
  await app.start();
  logger.info('⚡️ Bolt app is running!');
})();
