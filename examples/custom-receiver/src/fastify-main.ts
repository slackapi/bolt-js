import { App, FileInstallationStore } from '@slack/bolt';
import { ConsoleLogger, LogLevel } from '@slack/logger';
import { FileStateStore } from '@slack/oauth';
import Fastify from 'fastify';
import FastifyReceiver from './FastifyReceiver';

if (!process.env.SLACK_SIGNING_SECRET) {
  throw new Error('SLACK_SIGNING_SECRET environment variable not found!');
}

const logger = new ConsoleLogger();
logger.setLevel(LogLevel.DEBUG);

const fastify = Fastify({ logger: true });

fastify.get('/', async (_, res) => {
  res.redirect('/slack/install');
});

const receiver = new FastifyReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: ['commands', 'chat:write', 'app_mentions:read'],
  installationStore: new FileInstallationStore(),
  installerOptions: {
    directInstall: true,
    stateStore: new FileStateStore({}),
  },
  fastify,
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
