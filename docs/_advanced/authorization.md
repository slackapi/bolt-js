---
title: Authorization
slug: authorization
order: 2
---

<div class="section-content">
Custom apps installed on just one team can define `token` (and optionally `botId` and `botUserId`) at the time of app initialization. But in the case you want to handle multiple tokens, authorization functions can be passed in rather than a `token`. Authorization functions must have `source` and `body` as parameters and are expected to return a Promise that resolves to an `AuthorizeResult`.

`source` will be provided to an authorize function and will always contain a `teamId`, and will contain an `enterpriseId`, a `userId`, and a `conversationId` when they exist for the event.

`body` will be provided as the request body of the event.

After you app is initialized, the authorization function will be run as an incoming event is passed from the Receiver. This will give opportunity to add the proper token and bot user and app IDs (which are used for the builtin `ignoreSelf` middleware).
</div>

```javascript
// NOTE: This is for demonstration purposes only.
// All sensitive data should be stored in a secure database
let teamInfo = {
  'E1234A12AB': {
    'T12345': {
      botToken: 'xoxb-123abc',
      botId: 'B1251',
      botUserId: 'U12385' 
    },
    'T56789': {
      botToken: 'xoxb-456def',
      botId: 'B3219',
      botUserId: 'U45819'
    }
  },
  'E5678B23CD': {
    'T77712': {
      botToken: 'xoxb-102anc',
      botId: 'B5910',
      botUserId: 'U1239'
    }
  }
}

const authorizeFn = async (source, body) => {
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