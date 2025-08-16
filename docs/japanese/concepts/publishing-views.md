# ホームタブの更新

[ホームタブ](/surfaces/app-home)は、サイドバーや検索画面からアクセス可能なサーフェスエリアです。アプリはこのエリアを使ってユーザーごとのビューを表示することができます。アプリ設定ページで App Home の機能を有効にすると、[`views.publish`](/reference/methods/views.publish/) API メソッドの呼び出しで `user_id` と[ビューのペイロード](/reference/views)を指定して、ホームタブを公開・更新することができるようになります。

エンドユーザーが App Home（ホームタブやアプリとの DM など）にアクセスしたことを知るために、[`app_home_opened`](/reference/events/app_home_opened) イベントをサブスクライブすることができます。

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
        type: "home",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Welcome home, <@" + event.user + "> :house:*"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Learn how home tabs can be more useful and interactive <https://docs.slack.dev/surfaces/app-home|*in the documentation*>."
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