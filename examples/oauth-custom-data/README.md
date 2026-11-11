# Passing custom data through OAuth

This example shows how to carry data that is specific to a single installation,
such as a tenant ID, through the Slack OAuth flow and store it with the
installation. It uses an `ExpressReceiver` and a signed cookie.

## How it works

1. The installer opens `/slack/install?tenant=acme`.
2. `installerOptions.installPathOptions.beforeRedirection` validates the tenant
   and stores it in a signed `tenant` cookie.
3. Slack redirects the installer back to `/slack/oauth_redirect`.
4. `installerOptions.callbackOptions.beforeInstallation` rejects the request if
   the cookie is missing, invalid, tampered with, or older than 10 minutes.
5. `installerOptions.callbackOptions.afterInstallation` adds the tenant to
   `installation.metadata` before the installation is stored.

The cookie is registered on an Express router that is passed to
`ExpressReceiver`. Because the router middleware runs before the OAuth routes,
`req.signedCookies` is available in the OAuth callbacks.

## Setup

Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps), then add
your public redirect URL under **OAuth & Permissions**. For local development,
use a tunnel such as [`ngrok`](https://ngrok.com/download):

```
ngrok http 3000
```

The redirect URL is your tunnel URL followed by `/slack/oauth_redirect`, for
example `https://example.ngrok.app/slack/oauth_redirect`.

Install the dependencies:

```
npm install
```

Set the environment variables. `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, and
`SLACK_SIGNING_SECRET` are in your app configuration. `SLACK_STATE_SECRET` and
`COOKIE_SECRET` can be any long random strings of your choosing.

```bash
export SLACK_CLIENT_ID=YOUR_SLACK_CLIENT_ID
export SLACK_CLIENT_SECRET=YOUR_SLACK_CLIENT_SECRET
export SLACK_SIGNING_SECRET=YOUR_SLACK_SIGNING_SECRET
export SLACK_STATE_SECRET=YOUR_SLACK_STATE_SECRET
export COOKIE_SECRET=YOUR_COOKIE_SECRET
```

You can also put these values in a `.env` file.

## Run the app

```
npm start
```

Then start the OAuth flow with a tenant in the query string:

```
https://example.ngrok.app/slack/install?tenant=acme
```

After the installation, the stored installation contains
`metadata: { tenant: "acme" }`. The success page only shows the team and
enterprise IDs; it never prints tokens.

## Tests

```
npm test
```

The tests run offline. They stub the Slack token exchange and the installation
store, then exercise the install path and callback with supertest.

## Security notes

- A signed cookie is **not** encrypted. Anyone who can read the cookie can read
  its contents. Do not put secrets or access tokens in it.
- Serve the app over HTTPS. The cookie uses `Secure`, so browsers only send it
  over HTTPS.
- The cookie uses `HttpOnly` and `SameSite=Lax` to reduce the risk of script
  access and cross-site requests.
- Validate and authorize the tenant on the server. The value in the query
  string and the cookie both come from the client; confirm that the installer
  is allowed to install the app for that tenant before trusting it.
- The cookie is only a short-lived carrier for the OAuth redirect. The
  installation metadata is the durable record.
- `FileInstallationStore` is for local development only. Use a persistent
  installation store in production.
