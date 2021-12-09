---
title: ホームタブの更新
lang: ja-jp
slug: publishing-views
order: 13
---

<div class="section-content">
<a href="https://api.slack.com/surfaces/tabs/using">ホームタブ</a>は、サイドバーや検索画面からアクセス可能なサーフェスエリアです。アプリはこのエリアを使ってユーザーごとのビューを表示することができます。アプリ設定ページで App Home の機能を有効にすると、<a href="https://api.slack.com/methods/views.publish">`views.publish`</a> API メソッドの呼び出しで `user_id` と<a href="https://api.slack.com/reference/block-kit/views">ビューのペイロード</a>を指定して、ホームタブを公開・更新することができるようになります。

エンドユーザーが App Home（ホームタブやアプリとの DM など）にアクセスしたことを知るために、<a href="https://api.slack.com/events/app_home_opened">`app_home_opened`</a> イベントをサブスクライブすることができます。
</div>

```javascript
// ユーザーが App Home にアクセスしたことを伝えるイベントをリッスン
app.event('app_home_opened', async ({ event, client, logger }) => {
  try {
    // 組み込みの API クライアントを使って views.publish を呼び出す
    const result = await client.views.publish({
      // イベントに紐づけられたユーザー ID を指定
      user_id: event.user,
      view: {
        // ホームタブはあらかじめアプリ設定ページで有効にしておく必要があります
        "type": "home",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Welcome home, <@" + event.user + "> :house:*"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Learn how home tabs can be more useful and interactive <https://api.slack.com/surfaces/tabs/using|*in the documentation*>."
            }
          }
        ]
      }
    });

    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});
```