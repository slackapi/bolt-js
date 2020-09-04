---
title: イベントのリスニング
lang: ja-jp
slug: event-listening
order: 3
---

<div class="section-content">
[Events API イベント](https://api.slack.com/events)のリスニングは、Slack アプリの設定画面でサブスクリプション設定を行った上で `event()` メソッドを使用します。これにより、Slack で何かが発生した (例：ユーザーがメッセージにリアクションした、チャンネルに参加した) ときに Bolt アプリ側で処理を実行できます。

`event()` メソッドは、文字列型の `eventType` を指定する必要があります。
</div>

```javascript
const welcomeChannelId = 'C12345';

// 新しいユーザーがワークスペースに加入したタイミングで、指定のチャンネルにメッセージを送信して自己紹介を促す
app.event('team_join', async ({ event, client }) => {
  try {
    const result = await client.chat.postMessage({
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
`message()` リスナーは `event('message')` と等価の機能を提供します。

イベントのサブタイプをフィルタリングしたい場合、組み込みの `matchEventSubtype()` ミドルウェアを使用できます。 `bot_message` や `message_replied` のような一般的なメッセージサブタイプの情報は、[メッセージイベントのドキュメント](https://api.slack.com/events/message#message_subtypes)を参照してください。
</div>

```javascript
// bot からのメッセージ全てと一致
app.message(subtype('bot_message'), ({ message }) => {
  console.log(`The bot user ${message.user} said ${message.text}`);
});
```

</details>
