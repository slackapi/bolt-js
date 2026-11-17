# イベントのリスニング

[Events API イベント](/apis/events-api/)のリスニングは、Slack アプリの設定画面でサブスクリプション設定を行った上で `event()` メソッドを使用します。これにより、Slack で何かが発生した (例：ユーザーがメッセージにリアクションした、チャンネルに参加した) ときに Bolt アプリ側で処理を実行できます。

`event()` メソッドは、文字列型の `eventType` を指定する必要があります。

```javascript
const welcomeChannelId = 'C12345';

// 新しいユーザーがワークスペースに加入したタイミングで、指定のチャンネルにメッセージを送信して自己紹介を促す
app.event('team_join', async ({ event, client, logger }) => {
  try {
    // 組み込みの client で chat.postMessage を呼び出す
    const result = await client.chat.postMessage({
      channel: welcomeChannelId,
      text: `Welcome to the team, <@${event.user.id}>! 🎉 You can introduce yourself in this channel.`,
    });
    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});
```
