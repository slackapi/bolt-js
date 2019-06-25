---
title: グローバルミドルウェア
lang: jp
slug: global-middleware
order: 4
---

<div class="section-content">
グローバルミドルウェアは、すべての着信イベントに対して、リスナーミドルウェアより前に実行されます。`app.use(fn(payload,...,next))` を使用すると、グローバルミドルウェアをいくつでもアプリに追加できます。

グローバルミドルウェアとリスナーミドルウェアは、いずれも、`next()` を呼び出して実行チェーンの制御を次のミドルウェアに渡すか、`next(error)` を呼び出して以前に実行したミドルウェアチェーンにエラーを渡す必要があります。

たとえば、アプリが、対応する内部認証サービス (SSO プロバイダ、LDAP など) で識別されたユーザーにのみ応答する必要があるとします。この場合、グローバルミドルウェアを使用して認証サービス内のユーザーレコードを検索し、ユーザーが見つからない場合はエラーとなるように定義するのがよいでしょう。
</div>

```javascript
// Authentication middleware that associates incoming event with user in Acme identity provider
function authWithAcme({ payload, context, say, next }) {
  const slackUserId = payload.user;
  const helpChannelId = 'C12345';

  // Assume we have a function that accepts a Slack user ID to find user details from Acme
  acme.lookupBySlackId(slackUserId)
    .then((user) => {
      // When the lookup is successful, populate context with Acme user details
      context.user = user;

      // Pass control to the next middleware and any listener functions
      next();
    })
    .catch((error) => {
      // This user wasn't found in Acme. Send them an error and don't continue processing event
      if (error.message === 'Not Found') {
        app.client.chat.postEphemeral({
          token: context.botToken,
          channel: payload.channel,
          user: slackUserId,
          text: `Sorry <@${slackUserId}, you aren't registered in Acme. Please post in <#${helpChannelId} for assistance.`
        });
        return;
      }

      // Pass control to previous middleware (if any) or the global error handler
      next(error);
    });
}
```