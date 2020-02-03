---
title: アクションへの応答
lang: ja-jp
slug: action-respond
order: 6
---

<div class="section-content">
アクションに応答するには、主に 2 つの方法があります。1 つ目の (最も一般的な) 方法では、 `say` 関数を使用します。 `say` 関数は、着信イベントが発生した会話にメッセージを返します。

アクションに応答する 2 つ目の方法では、 `respond()` を使用します。これは、アクションに関連付けられている `response_url` を使用するためのシンプルななユーティリティです。
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
`respond()` は `response_url` を呼び出すためのユーティリティであるため、同じ方法で動作します。新しいメッセージペイロードを使用して JSON オブジェクトを渡すことができます。このオブジェクトは、 `response_type` (値は `in_channel` または `ephemeral` )、 `replace_original` 、 `delete_original` のようなオプションのプロパティを使用して元の会話のソースにパブリッシュされます。
</div>

```javascript
// "user_select" の action_id がトリガーされたアクションをリスニング
app.action('user_choice', async ({ action, ack, respond }) => {
  await ack();
  await respond(`You selected <@${action.selected_user}>`);
});
```

</details>
