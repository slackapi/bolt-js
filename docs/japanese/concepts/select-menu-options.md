# オプションのリスニングと応答

`options()` メソッドは、Slack からのオプション（セレクトメニュー内の動的な選択肢）をリクエストするペイロードをリッスンします。 [`action()` と同様](/tools/bolt-js/concepts/actions)に、文字列型の `action_id` または制約付きオブジェクトが必要です。

`external_select` メニューには `action_id` を使用することをおすすめしますが、ダイアログはまだ Block Kit をサポートしていないため、制約オブジェクトを用いて `callback_id` でフィルタリングする必要があります。

オプションのリクエストへの応答には、適切なオプションを指定して `ack()` を実行する必要があります。API サイトに掲載されている[external_select の応答の例](/reference/block-kit/block-elements/multi-select-menu-element#external_multi_select)や[ダイアログ応答の例](/legacy/legacy-dialogs)を参考にしてください。

```javascript
// external_select オプションリクエストに応答する例
app.options('external_action', async ({ options, ack }) => {
  // チームまたはチャンネル情報を取得
  const results = await db.get(options.team.id);

  if (results) {
    let options = [];
    // ack 応答 するために options 配列に情報をプッシュ
    for (const result of results) {
      options.push({
        text: {
          type: "plain_text",
          text: result.label
        },
        value: result.value
      });
    }

    await ack({
      options: options
    });
  } else {
    await ack();
  }
});
```