---
title: OAuth フローの実装
lang: ja-jp
slug: authenticating-oauth
order: 15
---

<div class="section-content">
Slack アプリの配布を行うには Bolt による OAuth フローを実装し、インストール時に取得した情報をセキュアな方法で保存しておく必要があります。
Bolt は OAuth フローそのものに加えて OAuth のためのルーティング、 state パラメーターの検証、保存するためのインストール情報をアプリに受け渡す、などの処理をハンドリングします。

OAuth を有効にするために、以下を提供する必要があります：
* `clientId`, `clientSecret`, `stateSecret`, `scopes` _(必須)_
* `installationStore` オプションは、インストール情報の保存と取得を行うハンドラーを提供します *(必須とはなっていませんが、本番環境では設定することを強く推奨します)*

##### 開発とテスト

開発・テストの際に利用することを想定して `installationStore` オプションのデフォルト実装である `FileInstallationStore` を提供しています。

```javascript
const { App } = require('@slack/bolt');
const { FileInstallationStore } = require('@slack/oauth');
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  scopes: ['channels:history', 'chat:write', 'commands'],
  installationStore: new FileInstallationStore(),
});
```
:warning: プロダクションコードとしての利用は **推奨しません** ので、自前で実装する必要があります。サンプルコードとして [OAuth の別の実装例](https://github.com/slackapi/bolt-js/tree/main/examples/oauth)を参照してください。

##### アプリのインストール

* **インストール時の初期化**: Bolt for JavaScript は `slack/install` という **パス** を生成します。これは、Slack アプリのダイレクトインストールのために `Add to Slack` ボタンを置く場合に指定できる URL です（ `state` パラメータが必要）。例えば、 _www.example.com_ でホスティングされているアプリであれば、 _www.example.com/slack/install_ とインストールページが提供されます。
  * 💡 `App` コンストラクタ内で `installerOptions.directInstall: true` と設定することで、デフォルトのウェブページを描画しない代わりに、ユーザーへ Slack の認証 URL を出すことができます（[例](https://github.com/slackapi/bolt-js/blob/5b4d9ceb65e6bf5cf29dfa58268ea248e5466bfb/examples/oauth/app.js#L58-L64)）。

* **Slack へ追加**: `Add to Slack` ボタンを押すと Slack との OAuth プロセスを開始します。ユーザーがアプリへの権限付与を許可した後、 Slack はアプリの **Redirect URI** （既に設定済み）を呼び出し, ユーザーに **Open Slack** を促します。詳細に設定を変えたい場合は **Redirect URI** セクションを参照してください。

* **Slack で開く**: ユーザーが **Open Slack** した後、 and here after as your app processes events from Slack, your provided `installationStore`'s `fetchInstallation` と `storeInstallation` ハンドラーが実行されます。ハンドラーに渡す引数についてもっと詳細が知りたい場合、 **Installation Object** セクションを参照してください。

* アプリはすでにインストールされていて、さらにユーザーから追加の認可情報（例：ユーザートークンの発行）な場合や、何らかの理由で動的にインストール用の URL を生成したい場合は、`ExpressReceiver` を自前でインスタンス化し、それを `receiver` という変数に代入した上で `receiver.installer.generateInstallUrl()` を呼び出してください。詳細は [OAuth ライブラリのドキュメント](https://slack.dev/node-slack-sdk/oauth#generating-an-installation-url)の `generateInstallUrl()` を参照してください。

* 💡 Bolt for JavaScript は [カスタムのレシーバー](#receiver) による OAuth をサポートしていません。もしカスタムのレシーバーを実装したいのであれば、私たちが提供している [OAuth ライブラリ](https://slack.dev/node-slack-sdk/oauth#slack-oauth) を使うこともできます。Bolt for JavaScript の組み込みのモジュールもこれを内部的に利用しています。

##### Redirect URI

Bolt for JavaScript は、アプリのインストールフローを完了した後の遷移先の URL である **Redirect URL** のためのパスとして `slack/oauth_redirect` を有効にします。

💡 アプリのドメインを含んだ **Redirect URI** （絶対 URI）を Slack アプリの設定画面の **OAuth and Permissions** セクション内で設定してください。（例 `https://example.com/slack/oauth_redirect` ）。

独自の **Redirect URI** を使う場合、 App クラスの引数 `redirectUri` と `installerOptions.redirectUriPath` にも設定してください。 両方とも設定する必要があり、矛盾のない絶対 URI である必要があります。

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  scopes: ['chat:write'],
  redirectUri: 'https://example.com/slack/redirect', // ここに設定します
  installerOptions: {
    redirectUriPath: '/slack/redirect', // そして、ココ！
  },
});
```

##### Installation オブジェクト

Bolt は `installationStore` の `storeInstallation` ハンドラーに `installation` オブジェクトを渡します。どのようなオブジェクトの形式となるか想像しづらいと開発時に混乱の元になるかもしれません。`installation` オブジェクトはこのような形式となります：

```javascript
{
  team: { id: 'T012345678', name: 'example-team-name' },
  enterprise: undefined,
  user: { token: undefined, scopes: undefined, id: 'U01234567' },
  tokenType: 'bot',
  isEnterpriseInstall: false,
  appId: 'A01234567',
  authVersion: 'v2',
  bot: {
    scopes: [
      'chat:write',
    ],
    token: 'xoxb-244493-28*********-********************',
    userId: 'U012345678',
    id: 'B01234567'
  }
}
```

Bolt は `fetchInstallation` と `deleteInstallation` ハンドラーに `installQuery` オブジェクトを渡します：

```javascript
{
  userId: 'U012345678',
  isEnterpriseInstall: false,
  teamId: 'T012345678',
  enterpriseId: undefined,
  conversationId: 'D02345678'
}
```


##### OrG 全体へのインストール

[Enterprise Grid の OrG 全体へのインストール](https://api.slack.com/enterprise/apps)への対応を追加する場合、Bolt for JavaScript のバージョン 3.0.0 以上を利用してください。また Slack アプリの設定画面で **Org Level Apps** の設定が有効になっていることを確認してください。

管理者画面からの [Enterprise Grid の OrG 全体へのインストール](https://api.slack.com/enterprise/apps) の場合、 Bolt で動作させるために追加の設定が必要です。この利用シナリオでは、推奨の `state` パラメータが提供されず、Bolt アプリでは `state` を検証しようとするため、インストールを継続することができません。

Bolt アプリ側で `stateVerification` オプションを false に設定することで、 `state` パラメーターの検証を無効することができます。以下の例を参考にしてください。

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: ['chat:write'],
  installerOptions: {
    stateVerification: false,
  },
});
```

Slack の OAuth インストールフローについてのより詳細な情報は [API ドキュメント](https://api.slack.com/authentication/oauth-v2)を参照してください。

</div>

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  scopes: ['channels:read', 'groups:read', 'channels:manage', 'chat:write', 'incoming-webhook'],
  installationStore: {
    storeInstallation: async (installation) => {
      // 実際のデータベースに保存するために、ここのコードを変更
      if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
        // OrG 全体へのインストールに対応する場合
        return await database.set(installation.enterprise.id, installation);
      }
      if (installation.team !== undefined) {
        // 単独のワークスペースへのインストールの場合
        return await database.set(installation.team.id, installation);
      }
      throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
      // 実際のデータベースから取得するために、ここのコードを変更
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // OrG 全体へのインストール情報の参照
        return await database.get(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // 単独のワークスペースへのインストール情報の参照
        return await database.get(installQuery.teamId);
      }
      throw new Error('Failed fetching installation');
    },
    deleteInstallation: async (installQuery) => {
      // 実際のデータベースから削除するために、ここのコードを変更
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // OrG 全体へのインストール情報の削除
        return await myDB.delete(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // 単独のワークスペースへのインストール情報の削除
        return await myDB.delete(installQuery.teamId);
      }
      throw new Error('Failed to delete installation');
    },
  },
});
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">OAuth デフォルト設定をカスタマイズ</h4>
</summary>

<div class="secondary-content" markdown="0">

`installerOptions` を使って OAuth モジュールのデフォルト設定を上書きすることができます。このカスタマイズされた設定は `App` の初期化時に渡します。以下の情報を変更可能です:

- `authVersion`: 新しい Slack アプリとクラシック Slack アプリの切り替えに使用
- `metadata`: セッションに関連する情報の指定に使用
- `installPath`: "Add to Slack" ボタンのためのパスを変更するために使用
- `redirectUriPath`: Redirect URL を変更するために使用
- `callbackOptions`: OAuth フロー完了時の成功・エラー完了画面をカスタマイズするために使用
- `stateStore`: 組み込みの `ClearStateStore` の代わりにカスタムのデータストアを有効にするために使用
- `userScopes`: 親の階層にある `scopes` プロパティと同様、ユーザがアプリをインストールする際に必要となるユーザスコープのリストの指定に使用

</div>

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: ['channels:read', 'groups:read', 'channels:manage', 'chat:write', 'incoming-webhook'],
  installerOptions: {
      authVersion: 'v1', // デフォルトは 'v2' (クラシック Slack アプリは 'v1')
      metadata: 'some session data',
      installPath: '/slack/installApp',
      redirectUriPath: '/slack/redirect',
      userScopes: ['chat:write'],
      callbackOptions: {
        success: (installation, installOptions, req, res) => {
          // ここで成功時のカスタムロジックを実装
          res.send('successful!');
        }, 
        failure: (error, installOptions , req, res) => {
          // ここでエラー時のカスタムロジックを実装
          res.send('failure');
        }
      },
      stateStore: {
        // `stateStore` を指定する場合は `stateSecret` の設定が不要

        // 第一引数は `generateInstallUrl` メソッドに渡される `InstallUrlOptions` オブジェクト、第二引数は日付オブジェクト
        // state の文字列を応答
        generateStateParam: async (installUrlOptions, date) => {
          // URL の state パラメーターとして使用するランダムな文字列を生成
          const randomState = randomStringGenerator();
          // その値をキャッシュ、データベースに保存
          await myDB.set(randomState, installUrlOptions);
          // データベースに保存されたものを利用可能な値として返却
          return randomState;
        },

        // 第一引数は日付オブジェクトで、第二引数は state を表現する文字列
        // `installUrlOptions` オブジェクトを応答
        verifyStateParam: async (date, state) => {
          // state をキーに、データベースから保存された installOptions を取得
          const installUrlOptions = await myDB.get(randomState);
          return installUrlOptions;
        }
      },
  }
});
```

</details>
