---
title: context の追加
lang: ja-jp
slug: context
order: 7
---

<div class="section-content">
`context` オブジェクトは、受信リクエストに付加情報を提供するために使用されるもので、全てのリスナーがこれを使用できます。例えば、3rd party のシステムからユーザー情報を追加したり、ミドルウェアのチェインの中で次のミドルウェアが必要とする一時的な状態を追加したりといった用途に利用できます。

`context` は、ただのオブジェクトなので、いくらでも属性を追加、編集することができます。
</div>

```javascript
async function addTimezoneContext({ payload, client, context, next }) {
  const user = await client.users.info({
    user: payload.user_id,
    include_locale: true
  });

  // ユーザのタイムゾーン情報を追加
  context.tz_offset = user.tz_offset;

  // 制御とリスナー関数を次のミドルウェアに引き渡し
  await next();
}

app.command('/request', addTimezoneContext, async ({ command, ack, client, context, logger }) => {
  // コマンドリクエストの確認
  await ack();
  // リクエスト時のローカル時間を取得
  const localHour = (Date.UTC(2020, 3, 31) + context.tz_offset).getHours();

  // リクエストに使用するチャンネル ID
  const requestChannel = 'C12345';

  const requestText = `:large_blue_circle: *New request from <@${command.user_id}>*: ${command.text}`;

  // 午前 9 時〜午後 5 時以外のリクエストの場合は明日
  if (localHour > 17 || localHour < 9) {
    // ローカル時間の明日午前 9 時までの差分を取得する関数があると仮定
    const localTomorrow = getLocalTomorrow(context.tz_offset);

    try {
      // メッセージ送信スケジュールを調整
      const result = await client.chat.scheduleMessage({
        channel: requestChannel,
        text: requestText,
        post_at: localTomorrow
      });
    }
    catch (error) {
      logger.error(error);
    }
  } else {
    try {
      // 送信
      const result = await client.chat.postMessage({
        channel: requestChannel,
        text: requestText
      });
    } catch (error) {
      logger.error(error);
    }
  }
});
```
