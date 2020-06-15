---
title: 認可（Authorization）
lang: ja-jp
slug: authorization
order: 2
---

<div class="section-content">
認可（Authorization）は、Slack からのイベントを処理するにあたって、どの Slack クレデンシャル (ボットトークンなど) を使用可能にするかを決定するプロセスです。

1 つだけのワークスペースにインストールされたカスタムアプリであれば `App` 初期化時に単に `token` オプションを使用するだけで OK です。一方で、複数のワークスペースにインストールされる、複数のユーザートークンを使用するといったケースのように、アプリが複数のトークンを処理しなければならない場合があります。このようなケースでは `token` の代わりに `authorize` オプションを使用する必要があります。

`authorize` オプションには、イベントソースを入力値として受け取り、許可された認可されたクレデンシャルを含むオブジェクトを Promise の値として返す関数を指定します。このイベントソースの情報には、 `teamId` (常に存在します)、 `userId`、`conversationId`、`enterpriseId` のような、イベントが誰によって発生させられたか、どこで発生したかに関する情報が含まれます。

許可されたクレデンシャルには、`botToken`、`userToken`、`botId` (アプリがボット自体からのメッセージを無視するために必要です)、 `botUserId` が含まれます。[`context`](#context) オブジェクトに、これ以外の他のプロパティを自由に設定することもできます。

`botToken` と `userToken` は、どちらか、またはその両方を必ず設定してください。`say()` のようなユーティリティを動作させるには、どちらか一方が存在している必要があります。両方指定した場合、`say()` では `botToken` が優先されます。
</div>

```javascript
const app = new App({ authorize: authorizeFn, signingSecret: process.env.SLACK_SIGNING_SECRET });

// 注: これはデモの目的のみの例です
// 実際は重要なデータはセキュリティの高いデータベースに保存してください。このアプリは bot トークンのみを使用すると仮定しています。ここで使われるオブジェクトは、複数ワークスペースにアプリをインストールした場合のクレデンシャルを保管するモデルです。

const installations = [
  {
    enterpriseId: 'E1234A12AB',
    teamId: 'T12345',
    botToken: 'xoxb-123abc',
    botId: 'B1251',
    botUserId: 'U12385',
  },
  {
    teamId: 'T77712',
    botToken: 'xoxb-102anc',
    botId: 'B5910',
    botUserId: 'U1239',
  },
];

const authorizeFn = async ({ teamId, enterpriseId }) => {
  // データベースから team（ワークスペース）を取得
  for (const team of installations) {
    // installations 配列から teamId と enterpriseId（Enterprise Grid の OrG の ID）が一致するかチェック
    if ((team.teamId === teamId) && (team.enterpriseId === enterpriseId)) {
      // 一致したワークスペースのクレデンシャルを使用
      return {
        // 代わりに userToken をセットしても OK
        botToken: team.botToken,
        botId: team.botId,
        botUserId: team.botUserId
      };
    }
  }

  throw new Error('No matching authorizations');
}
```
