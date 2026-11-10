# メッセージの送信

リスナー関数内では、その実行に関連付けられた会話 (例：リスナー実行のトリガーが発生したイベント・アクションが発生したチャンネル) があるとき `say()` を使用できます。 `say()` は、シンプルなメッセージを送信するための文字列か、もっと複雑なメッセージを送信するための JSON ペイロードを受け付けます。渡されたメッセージのペイロードは、関連付けられた会話へ送信されます。

リスナー関数以外の場所でメッセージを送信したい場合や、より高度な操作 (特定のエラーの処理など) を実行したい場合は、[Bolt インスタンスにアタッチされた client を使用](/tools/bolt-js/concepts/web-api)して `chat.postMessage` を呼び出します。

```javascript
// "knock knock" を含むメッセージをリッスンし、 "who's there?" というメッセージをイタリック体で送信
app.message('knock knock', async ({ message, say }) => {
  await say(`_Who's there?_`);
});
```

## ブロックを用いたメッセージの送信

`say()` は、より複雑なメッセージペイロードを受け付けるので、メッセージに機能やリッチな構造を与えることが容易です。

リッチなメッセージレイアウトをアプリに追加する方法については、[API サイトのガイド](/messaging/#structure)を参照し、[Block Kit ビルダー](https://app.slack.com/block-kit-builder)の一般的なアプリフローのテンプレートを確認してください。

```javascript
// 誰かが 📅 絵文字でリアクションした時に、日付ピッカー block を送信
app.event('reaction_added', async ({ event, say }) => {
  if (event.reaction === 'calendar') {
    await say({
      blocks: [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Pick a date for me to remind you"
        },
        "accessory": {
          "type": "datepicker",
          "action_id": "datepicker_remind",
          "initial_date": "2019-04-28",
          "placeholder": {
            "type": "plain_text",
            "text": "Select a date"
          }
        }
      }]
    });
  }
});
```