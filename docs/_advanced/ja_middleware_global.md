---
title: グローバルミドルウェア
lang: ja-jp
slug: global-middleware
order: 4
---

<div class="section-content">
グローバルミドルウェアは、すべての着信イベントに対して、リスナーミドルウェアより前に実行されます。`app.use(fn(payload,...,next))` を使用すると、グローバルミドルウェアをいくつでもアプリに追加できます。

グローバルミドルウェアとリスナーミドルウェアは、いずれも、`next()` を呼び出して実行チェーンの制御を次のミドルウェアに渡すか、`next(error)` を呼び出して以前に実行したミドルウェアチェーンにエラーを渡す必要があります。

たとえば、アプリが、対応する内部認証サービス (SSO プロバイダ、LDAP など) で識別されたユーザーにのみ応答する必要があるとします。この場合、グローバルミドルウェアを使用して認証サービス内のユーザーレコードを検索し、ユーザーが見つからない場合はエラーとなるように定義するのがよいでしょう。
</div>

```javascript
//  Acme ID情報管理プロバイダ上のユーザからの着信イベントと紐つけた認証ミドルウェア
function authWithAcme({ payload, context, say, next }) {
  const slackUserId = payload.user;
  const helpChannelId = 'C12345';

  // Slack ユーザ ID を使って Acmeシステム上にあるユーザ情報を検索できる関数があるとと仮定
  acme.lookupBySlackId(slackUserId)
    .then((user) => {
      // 検索できたらそのユーザ情報でコンテクストを生成
      context.user = user;

      // 制御とリスナー関数を次のミドルウェアに引き渡し
      next();
    })
    .catch((error) => {
      // Acme システム上にユーザが存在しないのでエラーをわたし、イベントプロセスを終了
      if (error.message === 'Not Found') {
        app.client.chat.postEphemeral({
          token: context.botToken,
          channel: payload.channel,
          user: slackUserId,
          text: `Sorry <@${slackUserId}, you aren't registered in Acme. Please post in <#${helpChannelId} for assistance.`
        });
        return;
      }

      // 制御とリスナー関数を（もしあれば）前のミドルウェア渡す、もしくはグローバルエラーハンドラに引き渡し
      next(error);
    });
}
```