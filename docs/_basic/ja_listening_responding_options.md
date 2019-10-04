---
title: オプションのリスニングと応答
lang: ja-jp
slug: options
order: 12
---

<div class="section-content">
`option()` メソッドは、Slack からの着信オプションリクエストペイロードをリッスンします。 [`actions()` と同様](#action-listening)に、 `action_id` オブジェクトまたは制約付きオブジェクトが必要です。

`external_select` メニューには `action_id` を使用することをお勧めしますが、ダイアログはまだ Block Kit をサポートしていないため、制約オブジェクトを用いて `callback_id` でフィルタリングする必要があります。

オプションリクエストに応答するためには、適切なオプションを指定して `ack()` を実行する必要があります。[external_select の応答の例](https://api.slack.com/reference/messaging/block-elements#external-select)も[ダイアログ応答の例](https://api.slack.com/dialogs#dynamic_select_elements_external)も API サイトで参照できます。
</div>

```javascript
// external_select オプションリクエストに応答する例
app.options('external_action', async ({ options, ack }) => {
  // チームまたはチャンネル情報を取得
  const results = await db.get(options.team.id);
  
  if (results) {
    let options = [];
    // ack 応答 するために options 配列に情報をプッシュ
    for (const result in results) {
      options.push({
        "text": {
          "type": "plain_text",
          "text": result.label
        },
        "value": result.value
      });
    }

    ack({
      "options": options
    });
  } else {
    ack();
  }
});
```