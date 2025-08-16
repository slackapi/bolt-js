# ショートカットのリスニング

`shortcut()` メソッドは、[グローバルショートカット](/interactivity/implementing-shortcuts#global)と[メッセージショートカット](/interactivity/implementing-shortcuts#messages)の両方をサポートします。

ショートカットは、テキスト入力エリアや検索バーから起動できる Slack クライアント内の UI エレメントです。グローバルショートカットは、コンポーザーメニューまたは検索メニューから呼び出すことができます。メッセージショートカットは、メッセージのコンテキストメニュー内にあります。`shortcut()` メソッドを使って、これらのショートカットのリクエストをリッスンすることができます。このメソッドには `callback_id` を文字列または正規表現のデータ型で設定します。

⚠️ 同じ対象にマッチする正規表現の `shortcut()` を複数使用する場合、マッチする _全ての_ リスナーが実行されることに注意してください。そのような挙動を意図しない場合は、これが発生しないよう正規表現をデザインしてください。

グローバルショートカットのリクエストは Slack へリクエストを受信したことを知らせるために `ack()` メソッドで確認する必要があります。

グローバルショートカットのペイロードは、ユーザーの実行アクションの確認のために[モーダルを開く](/tools/bolt-js/concepts/creating-modals)などの用途に使用できる `trigger_id` を含んでいます。

⚠️ グローバルショートカットのペイロードは **チャンネル ID は含んでいない** ことに注意してください。もしあなたのアプリがチャンネル ID を知る必要があれば、モーダル内で [`conversations_select`](/reference/block-kit/block-elements/multi-select-menu-element#conversation_multi_select) エレメントを使用できます。
メッセージショートカットのペイロードはチャンネル ID を含みます。

```javascript
// open_modal というグローバルショートカットはシンプルなモーダルを開く
app.shortcut('open_modal', async ({ shortcut, ack, context, logger }) => {
  // グローバルショートカットリクエストの確認
  ack();

  try {
    // 組み込みの WebClient を使って views.open API メソッドを呼び出す
    const result = await app.client.views.open({
      // `context` オブジェクトに保持されたトークンを使用
      token: context.botToken,
      trigger_id: shortcut.trigger_id,
      view: {
        "type": "modal",
        "title": {
          "type": "plain_text",
          "text": "My App"
        },
        "close": {
          "type": "plain_text",
          "text": "Close"
        },
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "About the simplest modal you could conceive of :smile:\n\nMaybe <https://docs.slack.dev/block-kit/#making-things-interactive|*make the modal interactive*> or <https://docs.slack.dev/surfaces/modals#composing_views|*learn more advanced modal use cases*>."
            }
          },
          {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
              }
            ]
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

## 制約付きオブジェクトを使用したショートカットのリスニング

制約付きオブジェクトを使って `callback_id` や `type` によるリスニングができます。オブジェクト内の制約は文字列型または RegExp オブジェクトを使用できます。

```javascript
// callback_id が 'open_modal' と一致し type が 'message_action' と一致する場合のみミドルウェアが呼び出される
app.shortcut({ callback_id: 'open_modal', type: 'message_action' }, async ({ shortcut, ack, context, client, logger }) => {
  try {
    // ショートカットリクエストの確認
    await ack();

    // 組み込みの WebClient を使って views.open API メソッドを呼び出す
    const result = await app.client.views.open({
      // `context` オブジェクトに保持されたトークンを使用
      token: context.botToken,
      trigger_id: shortcut.trigger_id,
      view: {
        type: "modal",
        title: {
          type: "plain_text",
          text: "My App"
        },
        close: {
          type: "plain_text",
          text: "Close"
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "About the simplest modal you could conceive of :smile:\n\nMaybe <https://docs.slack.dev/block-kit/#making-things-interactive|*make the modal interactive*> or <https://docs.slack.dev/surfaces/modals#composing_views|*learn more advanced modal use cases*>."
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
              }
            ]
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