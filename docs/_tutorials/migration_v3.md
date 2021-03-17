---
title: Migrating to V3
order: 2
slug: migration-v3
lang: en
layout: tutorial
permalink: /tutorial/migration-v3
---
# Migrating to v3.x

<div class="section-content">
This guide will walk you through the process of updating your app from using `@slack/bolt@2.x` to `@slack/bolt@3.x`. There are a few changes you'll need to make but for most apps, these changes can be applied in 5 - 15 minutes.

*Note: Make sure to checkout our [support schedule](#slackbolt2x-support-schedule) for `@slack/bolt@2.x` if you don't plan on upgrading right away*
</div> 

---

### Org Wide App Installation Changes to InstallationStore & orgAuthorize

In [Bolt for JavaScript 2.5.0](https://github.com/slackapi/bolt-js/releases/tag/%40slack%2Fbolt%402.5.0), we introduced support for [org wide app installations](https://api.slack.com/enterprise/apps). To add support to your applications, two new methods were introduced to the Installation Store used during OAuth, `fetchOrgInstallation` & `storeOrgInstallation`. With `@slack/bolt@3.x`, we have dropped support for these two new methods for a simpler interface and to be better aligned with Bolt for Python and Bolt for Java. See the code samples below for the recommended changes to migrate.

Before:

```javascript
installationStore: {
    storeInstallation: async (installation) => {
      // change the line below so it saves to your database
      return await database.set(installation.team.id, installation);
    },
    fetchInstallation: async (installQuery) => {
      // change the line below so it fetches from your database
      return await database.get(installQuery.teamId);
    },
    storeOrgInstallation: async (installation) => {
      // include this method if you want your app to support org wide installations
      // change the line below so it saves to your database
      return await database.set(installation.enterprise.id, installation);
    },
    fetchOrgInstallation: async (installQuery) => {
      // include this method if you want your app to support org wide installations
      // change the line below so it fetches from your database
      return await database.get(installQuery.enterpriseId);
    },
  },
```

After:

```javascript
installationStore: {
    storeInstallation: async (installation) => {
      if (installation.isEnterpriseInstall) {
        // support for org wide app installation
        return await database.set(installation.enterprise.id, installation);
      } else {
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
```

Along with this change, we have also dropped support for `orgAuthorize`, and instead recommend developers to use `authorize` for both the single workspace installs and org wide app installs (if you are not using the built-in OAuth or providing a token when initializing App). See the code sample below for migration steps:

Before:

```javascript
const app = new App({ authorize: authorizeFn, orgAuthorize: orgAuthorizeFn, signingSecret: process.env.SLACK_SIGNING_SECRET });

const authorizeFn = async ({ teamId, enterpriseId}) => { 
  // Use teamId to fetch installation details from database
}

const orgAuthorizeFn = async ({ teamId, enterpriseId }) => { 
  // Use enterpriseId to fetch installation details from database
}
```

After:
```javascript
const app = new App({ authorize: authorizeFn, signingSecret: process.env.SLACK_SIGNING_SECRET });

const authorizeFn = async ({ teamId, enterpriseId, isEnterpriseInstall}) => { 
  // if isEnterpriseInstall is true, use enterpriseId to fetch installation details from database
  // else, use teamId to fetch installation details from database
}
```

### HTTP Receiver as default

In `@slack/bolt@3.x`, we have introduced a new default [`HTTPReceiver`](https://github.com/slackapi/bolt-js/issues/670) which replaces the previous default `ExpressReceiver`. This will allow Bolt for JavaScript apps to easily work with other popular web frameworks (Hapi.js, Koa, etc). `ExpressReceiver` is still being shipped with Bolt for JavaScript and `HTTPReceiver` will not provide all the same functionality. One use case that isn't supported by `HTTPReceiver` is creating custom routes (ex: create a route to do a health check). For these use cases, we recommend continuing to use `ExpressReceiver` by importing the class, and creating your own instance of it, and passing this instance into the constructor of `App`. See [our documentation on adding custom http routes](https://slack.dev/bolt-js/concepts#custom-routes) for an example.

### @slack/bolt@2.x support schedule

`@slack/bolt@2.x` will be deprecated on **January 12th, 2021**. We will only implement **critical bug fixes** until the official end of life date and close non critical issues and pull requests, which is slated for **May 31st, 2021**. At this time, development will fully stop for `@slack/bolt@2.x` and all remaining open issues and pull requests will be closed. 

### Minimum Node Version

`@slack/bolt@3.x` requires a minimum Node version of `12.13.0` and minimum npm version of `6.12.0` .

### Minimum TypeScript Version

As outlined in our [using TypeScript guide](https://slack.dev/bolt/tutorial/using-typescript), `@slack/bolt@3.x` requires a minimum TypeScript version of `4.1`.
