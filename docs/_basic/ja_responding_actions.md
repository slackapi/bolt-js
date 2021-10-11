---
title: アクションへの応答
lang: ja-jp
slug: action-respond
order: 6
---

<div class="section-content">
アクションへの応答には、主に 2 つのやり方があります。1 つ目の (最も一般的な) やり方は `say` 関数の利用です。 `say` 関数は、Slack 内のリクエストが発生した会話（チャンネルや DM）へメッセージを返します。

アクションに応答する 2 つ目の方法は `respond()` です。これはアクションに紐付けられている `response_url` を用いたメッセージの送信をシンプルに行うためのユーティリティです。
</div>

```javascript
// action_id が "approve_button" のインタラクティブコンポーネントがトリガーされる毎にミドルウェアが呼び出される
app.action('approve_button', async ({ ack, say }) => {
  // アクションリクエストの確認
  await ack();
  await say('Request approved 👍');
});
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">respond() の使用</h4>
</summary>

<div class="secondary-content" markdown="0">
`respond()` は `response_url` を呼び出すためのユーティリティであるため、それを直接使うときと同様に動作します。新しいメッセージのペイロードと、オプショナルな引数である `response_type` (値は `in_channel` または `ephemeral` )、 `replace_original` 、 `delete_original` を含む JSON オブジェクトを渡すことができます。
</div>

```javascript
// "user_select" の action_id がトリガーされたアクションをリッスン
app.action('user_choice', async ({ action, ack, respond }) => {
  await ack();
  await respond(`You selected <@${action.selected_user}>`);
});
```

</details>
