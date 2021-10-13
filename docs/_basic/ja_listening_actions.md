---
title: アクションのリスニング
lang: ja-jp
slug: action-listening
order: 5
---

<div class="section-content">
Bolt アプリは `action` メソッドを用いて、ボタンのクリック、メニューの選択、メッセージショートカットなどのユーザーのアクションをリッスンすることができます。

アクションは文字列型の `action_id` または RegExp オブジェクトでフィルタリングできます。 `action_id` は、Slack プラットフォーム上のインタラクティブコンポーネントの一意の識別子として機能します。 

すべての `action()` の例で `ack()` が使用されていることに注目してください。Slack からリクエストを受信したことを確認するために、アクションリスナー内で `ack()` 関数を呼び出す必要があります。これについては、「[リクエストの確認](#acknowledge)」 セクションで説明しています。

*注: Bolt 2.x からメッセージショートカット（以前はメッセージアクションと呼ばれていました）は `action()` ではなく `shortcut()` メソッドを使用するようになりました。この変更については [2.x マイグレーションガイド](https://slack.dev/bolt/ja-jp/tutorial/migration-v2)を参照してください。*
</div>

```javascript
// action_id が "approve_button" のインタラクティブコンポーネントがトリガーされる毎にミドルウェアが呼び出される
app.action('approve_button', async ({ ack }) => {
  await ack();
  // アクションを反映してメッセージをアップデート
});
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">制約付きオブジェクトを使用したアクションのリスニング</h4>
</summary>

<div class="secondary-content" markdown="0">
制約付きのオブジェクトを使って、 `callback_id` 、 `block_id` 、および `action_id` (またはそれらの組み合わせ) をリッスンすることができます。オブジェクト内の制約には、文字列型または RegExp オブジェクトを使用できます。
</div>

```javascript
// action_id が 'select_user' と一致し、block_id が 'assign_ticket' と一致する場合のみミドルウェアが呼び出される
app.action({ action_id: 'select_user', block_id: 'assign_ticket' },
  async ({ body, client, ack }) => {
    await ack();
    try {
      if (body.message) {
        const result = await client.reactions.add({
          name: 'white_check_mark',
          timestamp: body.message.ts,
          channel: body.channel.id
        });

        console.log(result);
      }
    }
    catch (error) {
      console.error(error);
    }
  });
```

</details>
