---
title: Authorization
slug: authorization
order: 2
---

<div class="section-content">
Authorization is the process of deciding which Slack credentials (such as a bot token) should be available while processing a specific incoming event.

Custom apps installed on just one workspace can simply use the `token` option (and optionally `botId` and `botUserId` options) at the time of `App` initialization. However, when your app needs to handle multiple tokens, the `authorize` option needs to be used instead. You might need to use this option if you're building an app that is in just one workspace but needs to access several different user tokens, or if you're building an app that is installed across multiple workspaces.

The `authorize` option should be set to a function. The function takes an event source as its input, and should return a Promise for an object containing the authorized credentials. The source contains information about who (and where) the event is coming from, which are properties such as `teamId` (always available), `userId`, `conversationId`, and `enterpriseId`. The authorized credentials should also have a few specific properties: `botToken`, `userToken`, `botId`, and `botUserId` (and any other properties you'd like to make available on the [`context`](#context)).

You should always provide either one or both of the `botToken` and `userToken` properties. One of them is necessary to make helpers like `say()` work. If they are both given, then `botToken` will take precedence. The `botId` property is required in order for the app to ignore messages from itself (see `ignoreSelf` option and built-in middleware). The `botUserId` property is optional, but helps the app ignore events from itself besides message events.
</div>

```javascript
const app = new App({ authorize: authorizeFn, signingSecret: process.env.SLACK_SIGNING_SECRET });

// NOTE: This is for demonstration purposes only.
// All sensitive data should be stored in a secure database
// Assuming this app only uses bot tokens, the following object represents a model for storing the credentials as the app is installed into multiple workspaces.

const installations = [
  {
    enterpriseId: 'E1234A12AB',
    teamId: 'T12345',
    botToken: 'xoxb-123abc',
    botId: 'B1251',
    botUserId: 'U12385',
  },
  {
    teamId: 'T77712',
    botToken: 'xoxb-102anc',
    botId: 'B5910',
    botUserId: 'U1239',
  },
];

const authorizeFn = async ({ teamId, enterpriseId }) => {
  // Fetch team info from database. You could also set userToken instead.
  const fetchAuthorizedTeam = new Promise((resolve, reject) => {
    teamInfo[source.enterpriseId][source.teamId] !== undefined ?
      Promise.resolve(teamInfo[source.enterpriseId][source.teamId]) :
      Promise.reject();
  });

  const authorizedTeam = await fetchAuthorizedTeam;

  return () => ({
    botToken: authorizedTeam.botToken,
    botId: authorizedTeam.botId,
    botUserId: authorizedTeam.botUserId,
  });
}
```