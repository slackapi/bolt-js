const assert = require('node:assert/strict');
const { test } = require('node:test');
const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');

process.env.SLACK_SIGNING_SECRET = 'test-signing-secret';
process.env.SLACK_CLIENT_ID = 'test-client-id';
process.env.SLACK_CLIENT_SECRET = 'test-client-secret';
process.env.SLACK_STATE_SECRET = 'test-state-secret';
process.env.COOKIE_SECRET = 'test-cookie-secret';

const { receiver, createApp, renderSuccessPage } = require('./app');

const COOKIE_SECRET = process.env.COOKIE_SECRET;
const TENANT_COOKIE = 'tenant';
const TENANT_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;
const STATE_COOKIE = 'slack-app-oauth-state';

let storedInstallation;

// Keep the tests offline: stub the token exchange and the installation store.
receiver.installer.installationStore.storeInstallation = async (installation) => {
  storedInstallation = installation;
};

receiver.installer.noTokenClient.oauth.v2.access = async () => ({
  ok: true,
  app_id: 'A012345678',
  authed_user: {
    id: 'U012345678',
    access_token: 'xoxp-test-token',
    scope: 'chat:write',
  },
  team: { id: 'T012345678', name: 'example-team' },
  enterprise: null,
  is_enterprise_install: false,
  token_type: 'bot',
});

function findSetCookie(response, name) {
  const header = response.headers['set-cookie'] ?? [];
  const cookies = Array.isArray(header) ? header : [header];
  return cookies.find((cookie) => cookie.startsWith(`${name}=`));
}

function cookiePair(setCookie) {
  return setCookie.split(';')[0];
}

async function signedTenantCookie(payload) {
  const signer = express();
  signer.use(cookieParser(COOKIE_SECRET));
  signer.get('/', (req, res) => {
    res.cookie(TENANT_COOKIE, payload, {
      signed: true,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: TENANT_COOKIE_MAX_AGE_MS,
    });
    res.end();
  });

  const response = await request(signer).get('/');
  return findSetCookie(response, TENANT_COOKIE);
}

async function startInstall(tenant = 'tenant-a') {
  const response = await request(receiver.app).get('/slack/install').query({ tenant }).expect(302);

  const tenantCookie = findSetCookie(response, TENANT_COOKIE);
  const stateCookie = findSetCookie(response, STATE_COOKIE);
  const state = new URL(response.headers.location).searchParams.get('state');

  return { response, tenantCookie, stateCookie, state };
}

function callbackRequest({ tenantCookie, stateCookie, state, code = 'test-code' }) {
  const cookies = [tenantCookie, stateCookie].filter(Boolean).map(cookiePair).join('; ');
  const req = request(receiver.app).get('/slack/oauth_redirect').query({ code, state });
  return cookies ? req.set('Cookie', cookies) : req;
}

test('install path sets a signed tenant cookie and redirects to Slack', async () => {
  const { response, tenantCookie } = await startInstall('tenant-a');

  assert.match(response.headers.location, /^https:\/\/slack\.com\/oauth\/v2\/authorize\?/);
  assert.ok(tenantCookie, 'expected a tenant cookie');
  assert.match(tenantCookie, /HttpOnly/i);
  assert.match(tenantCookie, /Secure/i);
  assert.match(tenantCookie, /SameSite=Lax/i);
  assert.match(tenantCookie, /Max-Age=600/);

  const encoded = cookiePair(tenantCookie).slice(`${TENANT_COOKIE}=`.length);
  const signed = decodeURIComponent(encoded);
  assert.ok(signed.startsWith('s:'), 'expected a signed cookie value');
  const unsigned = signed.slice(2, signed.lastIndexOf('.'));
  const payload = JSON.parse(unsigned.slice(2));
  assert.equal(payload.tenant, 'tenant-a');
  assert.equal(typeof payload.issuedAt, 'number');
});

test('callback rejects a missing tenant cookie', async () => {
  const { stateCookie, state } = await startInstall();
  const response = await callbackRequest({ stateCookie, state });

  assert.equal(response.status, 400);
  assert.match(response.text, /tenant cookie/i);
});

test('callback rejects a tampered tenant cookie', async () => {
  const { tenantCookie, stateCookie, state } = await startInstall();
  const pair = cookiePair(tenantCookie);
  const tampered = `${pair.slice(0, -1)}${pair.endsWith('a') ? 'b' : 'a'}`;
  const response = await callbackRequest({ tenantCookie: tampered, stateCookie, state });

  assert.equal(response.status, 400);
  assert.match(response.text, /tenant cookie/i);
});

test('callback rejects an expired tenant cookie', async () => {
  const { stateCookie, state } = await startInstall();
  const expiredCookie = await signedTenantCookie({
    tenant: 'tenant-a',
    issuedAt: Date.now() - TENANT_COOKIE_MAX_AGE_MS - 1000,
  });
  const response = await callbackRequest({ tenantCookie: expiredCookie, stateCookie, state });

  assert.equal(response.status, 400);
  assert.match(response.text, /tenant cookie/i);
});

test('valid cookie reaches afterInstallation and is stored in metadata', async () => {
  storedInstallation = undefined;
  const { tenantCookie, stateCookie, state } = await startInstall('tenant-a');
  const response = await callbackRequest({ tenantCookie, stateCookie, state });

  assert.equal(response.status, 200);
  assert.match(response.text, /T012345678/);
  assert.ok(storedInstallation, 'expected the installation to be stored');
  assert.deepEqual(storedInstallation.metadata, { tenant: 'tenant-a' });
});

test('install path rejects an invalid tenant', async () => {
  const response = await request(receiver.app).get('/slack/install').query({ tenant: 'bad tenant!' });

  assert.equal(response.status, 400);
  assert.match(response.text, /valid tenant/i);
});

test('createApp requires COOKIE_SECRET', () => {
  const original = process.env.COOKIE_SECRET;
  delete process.env.COOKIE_SECRET;

  try {
    assert.throws(() => createApp(), /COOKIE_SECRET is required/);
  } finally {
    process.env.COOKIE_SECRET = original;
  }
});

test('success page shows the enterprise ID for org-wide installs', () => {
  let body;
  renderSuccessPage(
    { enterprise: { id: 'E012345678' } },
    {
      send: (value) => {
        body = value;
      },
    },
  );

  assert.match(body, /E012345678/);
});

test('success page handles an installation without team or enterprise IDs', () => {
  let body;
  renderSuccessPage(
    {},
    {
      send: (value) => {
        body = value;
      },
    },
  );

  assert.match(body, /unknown workspace/);
});

test('validates the tenant before the token exchange and survives cookie expiry', async () => {
  storedInstallation = undefined;
  const realNow = Date.now;
  let now = realNow();
  Date.now = () => now;

  try {
    const issuedAt = now - TENANT_COOKIE_MAX_AGE_MS + 1000;
    const tenantCookie = await signedTenantCookie({ tenant: 'tenant-a', issuedAt });
    const { stateCookie, state } = await startInstall('tenant-a');
    const teamTokenResponse = receiver.installer.noTokenClient.oauth.v2.access;

    receiver.installer.noTokenClient.oauth.v2.access = async () => {
      now += 2000;
      return teamTokenResponse();
    };

    try {
      const response = await callbackRequest({ tenantCookie, stateCookie, state });

      assert.equal(response.status, 200, response.text);
      assert.deepEqual(storedInstallation.metadata, { tenant: 'tenant-a' });
    } finally {
      receiver.installer.noTokenClient.oauth.v2.access = teamTokenResponse;
    }
  } finally {
    Date.now = realNow;
  }
});

test('callback rejects an invalid state', async () => {
  const { tenantCookie, stateCookie } = await startInstall();
  const response = await callbackRequest({ tenantCookie, stateCookie, state: 'invalid-state' });

  assert.equal(response.status, 400);
  assert.match(response.text, /slack_oauth_invalid_state/);
});
