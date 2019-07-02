---
title: イベントのリスニング
lang: ja-jp
slug: event-listening
order: 3
---

<div class="section-content">
[Events API イベント](https://api.slack.com/events)をリスニングするには、 `event()` メソッドをアプリ設定でサブスクライブしてから使用します。これにより、Slack で何かが発生した (ユーザーがメッセージにリアクションした、チャンネルに参加したなど) ときに、アプリでアクションを実行できます。

`event()` メソッドは、文字列型の `eventType` を必要とします。
</div>

```javascript
const welcomeChannelId = 'C12345';

// ユーザーが新規でチームに加入した際に、指定のチャンネルにメッセージを送信して自己紹介を促す
app.event('team_join', async ({ event, context }) => {
  try {
    const result = await app.client.chat.postMessage({
      token: context.botToken,
      channel: welcomeChannelId,
      text: `Welcome to the team, <@${event.user.id}>! 🎉 You can introduce yourself in this channel.`
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});
```

<details class="secondary-wrapper" >
<summary class="section-head" markdown="0">
<h4 class="section-head">メッセージのサブタイプのフィルタリング</h4>
</summary>

<div class="secondary-content" markdown="0">
`message()` リスナーは `event('message')` に相当します。

イベントのサブタイプをフィルタリングするには、組み込みの `matchEventSubtype()` ミドルウェアを使用します。 `bot_message` や `message_replied` のような一般的なメッセージサブタイプは、[メッセージイベントページ](https://api.slack.com/events/message#message_subtypes)にあります。
</div>

```javascript
// bot からのメッセージ全てと一致
app.message(subtype('bot_message'), ({ message }) => {
  console.log(`The bot user ${message.user} said ${message.text}`);
});
```

</details>
