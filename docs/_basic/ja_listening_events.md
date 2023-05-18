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
app.event('team_join', async ({ event, client, logger }) => {
  try {
    // 組み込みの client で chat.postMessage を呼び出す
    const result = await client.chat.postMessage({
      channel: welcomeChannelId,
      text: `Welcome to the team, <@${event.user.id}>! 🎉 You can introduce yourself in this channel.`
    });
    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});
```

<details class="secondary-wrapper" >
<summary class="section-head" markdown="0">
<h4 class="section-head">メッセージのサブタイプのフィルタリング</h4>
</summary>

<div class="secondary-content" markdown="0">
`message()` リスナーは `event('message')` と等価の機能を提供します。

イベントのサブタイプをフィルタリングしたい場合、組み込みの `subtype()` ミドルウェアを使用できます。 `message_changed` や `message_replied` のような一般的なメッセージサブタイプの情報は、[メッセージイベントのドキュメント](https://api.slack.com/events/message#message_subtypes)を参照してください。
</div>

```javascript
// パッケージから subtype をインポート
const { App, subtype } = require('@slack/bolt');

// user からのメッセージの編集と一致
app.message(subtype('message_changed'), ({ event, logger }) => {
  // この if 文は TypeScript でコードを書く際に必要
  if (event.subtype === 'message_changed'
    && !event.message.subtype
    && !event.previous_message.subtype) {
    logger.info(`The user ${event.message.user} changed their message from ${event.previous_message.text} to ${event.message.text}`);
  }
});
```

</details>
