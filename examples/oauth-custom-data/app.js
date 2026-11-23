require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const { App, ExpressReceiver, FileInstallationStore } = require('@slack/bolt');

const TENANT_COOKIE = 'tenant';
const TENANT_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

function readTenant(req) {
  const payload = req.signedCookies?.[TENANT_COOKIE];
  if (
    payload === null ||
    typeof payload !== 'object' ||
    typeof payload.tenant !== 'string' ||
    typeof payload.issuedAt !== 'number' ||
    Date.now() - payload.issuedAt > TENANT_COOKIE_MAX_AGE_MS
  ) {
    return undefined;
  }
  return payload.tenant;
}

function renderSuccessPage(installation, res) {
  const ids = [];
  if (installation.team?.id) {
    ids.push(`team ${installation.team.id}`);
  }
  if (installation.enterprise?.id) {
    ids.push(`enterprise ${installation.enterprise.id}`);
  }
  res.send(`Installation complete (${ids.join(', ') || 'unknown workspace'}). You can close this window.`);
}

function createApp() {
  if (!process.env.COOKIE_SECRET) {
    throw new Error('COOKIE_SECRET is required to sign the tenant cookie');
  }

  // Register cookie parsing before the receiver adds its OAuth routes, so
  // req.signedCookies is available inside the OAuth callbacks.
  const router = express.Router();
  router.use(cookieParser(process.env.COOKIE_SECRET));

  const receiver = new ExpressReceiver({
    router,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: process.env.SLACK_STATE_SECRET,
    scopes: ['chat:write'],
    installationStore: new FileInstallationStore(),
    installerOptions: {
      directInstall: true,
      installPath: '/slack/install',
      installPathOptions: {
        beforeRedirection: async (req, res) => {
          const tenant = req.query.tenant;

          // Replace this format check with a lookup in your own system and
          // confirm that the installer is allowed to install the app for this
          // tenant.
          if (typeof tenant !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(tenant)) {
            res.status(400).send('A valid tenant query parameter is required');
            return false;
          }

          res.cookie(
            TENANT_COOKIE,
            { tenant, issuedAt: Date.now() },
            {
              signed: true,
              httpOnly: true,
              secure: true,
              sameSite: 'lax',
              maxAge: TENANT_COOKIE_MAX_AGE_MS,
            },
          );
          return true;
        },
      },
      callbackOptions: {
        beforeInstallation: async (options, req, res) => {
          const tenant = readTenant(req);
          if (tenant === undefined) {
            res.status(400).send('Missing, invalid, or expired tenant cookie');
            return false;
          }
          // Keep the validated value for afterInstallation. Re-reading the
          // cookie after the token exchange would lose it if it expires.
          res.locals.tenant = tenant;
          return true;
        },
        afterInstallation: async (installation, options, req, res) => {
          const tenant = res.locals.tenant;
          const existingMetadata =
            typeof installation.metadata === 'object' && installation.metadata !== null ? installation.metadata : {};
          installation.metadata = { ...existingMetadata, tenant };
          return true;
        },
        success: (installation, options, req, res) => {
          renderSuccessPage(installation, res);
        },
      },
    },
  });

  const app = new App({ receiver });
  return { app, receiver };
}

const { app, receiver } = createApp();

module.exports = { app, receiver, createApp, renderSuccessPage };

if (require.main === module) {
  (async () => {
    await app.start(process.env.PORT || 3000);
    app.logger.info('⚡️ Bolt app started');
  })();
}
