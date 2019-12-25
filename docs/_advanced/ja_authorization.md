---
title: 承認
lang: ja-jp
slug: authorization
order: 2
---

<div class="section-content">
承認は、特定の着信イベントの処理中にどの Slack 認証情報 (ボットトークンなど) を使用可能にするかを決定するプロセスです。

1 つのワークスペースにインストールされたカスタムアプリでは、`App` 初期化時に `token` オプションを使用できます。ただし、複数のワークスペースにインストールされる場合や、複数のユーザートークンにアクセスする必要がある場合など、アプリが複数のトークンを処理しなければならない場合には、代わりに `authorize` オプションを使用する必要があります。

`authorize` オプションは、イベントソースを入力値として受け取る関数に設定でき、許可された認証情報を含むオブジェクトに Promise を返す必要があります。ソースには、 `teamId` (常に利用可能)、 `userId`、`conversationId`、`enterpriseId` のようなプロパティを使用して、イベントの送信者や送信元に関する情報が含まれています。

許可された認証情報には、`botToken`、`userToken`、`botId` (アプリがボット自体からのメッセージを無視するために必要)、 `botUserId` などの固有のプロパティもいくつか含まれています。その他、 [`context`](#context) オブジェクトを使用すれば他のプロパティの指定もできるようになります。

`botToken` プロパティと `userToken` プロパティは、一方または両方を必ず指定する必要があります。`say()` のようなヘルパーを動作させるには、どちらか一方は指定しなければなりません。両方指定した場合は、`botToken` が優先されます。
</div>

```javascript
const app = new App({ authorize: authorizeFn, signingSecret: process.env.SLACK_SIGNING_SECRET });

// 注: これはデモの目的のみの例です
// 実際は重要なデータはセキュリティの高いデータベースに保存してください
// このアプリは bot トークンのみのしようと仮定、ここで使われるオブジェクトは、複数ワークスペースにアプリをインストールする際の認証情報を保管するモデルとします

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
  // データベースから team 情報を取得
  for (const team in installations) {
    // installations 配列から teamId と enterpriseId が一致するかチェック
    if ((team.teamId === teamId) && (team.enterpriseId === enterpriseId)) {
      // 一致したワークスペースの認証情報を使用
      return {
        // 代わりに userToken をセットしても OK
        botToken: team.botToken,
        botId: team.botId,
        botUserId: team.botUserId
      };
    }
  }
  
  throw new Error('No matching authorizations'); // 認証エラー
}
```
