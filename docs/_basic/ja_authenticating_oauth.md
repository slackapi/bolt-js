---
title: OAuth フローの実装
lang: ja-jp
slug: authenticating-oauth
order: 14
---

<div class="section-content">
複数のワークスペースにインストールされる Slack アプリは OAuth フローを実装し、アクセストークンなどのインストール時に取得した情報をセキュアな方法で保存しておく必要があります。Bolt for JavaScript では、`clientId`、`clientSecret`、`stateSecret`、`scopes` を `App` 初期化時に指定すると OAuth フローのためのルートのセットアップや state パラメーターを検証する機能が有効になります。組み込みの OAuth サポートモジュールは `ExpressReceiver` を使用している場合のみ利用可能です。もしカスタムのレシーバーを実装して利用している場合は、私たちが提供している [OAuth ライブラリ](https://slack.dev/node-slack-sdk/oauth#slack-oauth)を利用していください。 Bolt for JavaScript の組み込みのモジュールもこれを内部的に利用しています。


Bolt for JavaScript は、アプリのインストールフローを完了した後の遷移先の URL である **Redirect URL** のためのパスとして `slack/oauth_redirect` を有効にします。この URL を Slack アプリの設定画面の **OAuth and Permissions** セクション内で **Redirect URL** として指定してください。この設定のカスタマイズは以下で説明する `installerOptions` を指定することで可能です。

Bolt for JavaScript は `slack/install` というパスも生成します。これは、Slack アプリのダイレクトインストールのために `Add to Slack` ボタンを置く場合に指定できる URL です。アプリはすでにインストールされていて、さらにユーザーから追加の認可情報（例：ユーザートークンの発行）な場合や、何らかの理由で動的にインストール用の URL を生成したい場合は、`ExpressReceiver` を自前でインスタンス化し、それを `receiver` という変数に代入した上で `receiver.installer.generateInstallUrl()` を呼び出してください。詳細は [OAuth ライブラリのドキュメント](https://slack.dev/node-slack-sdk/oauth#generating-an-installation-url)の `generateInstallUrl()` を参照してください。

Slack の OAuth インストールフローについてもっと知りたい場合は [API ドキュメント](https://api.slack.com/authentication/oauth-v2)を参照してください。
</div>

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET
  stateSecret: 'my-state-secret',
  scopes: ['channels:read', 'groups:read', 'channels:manage', 'chat:write', 'incoming-webhook'],
  installationStore: {
    storeInstallation: (installation) => {
      // TODO: 実際のデータベースに保存するために、ここのコードを変更
      return database.set(installation.team.id, installation);
    },
    fetchInstallation: (InstallQuery) => {
      // TODO: 実際のデータベースから取得するために、ここのコードを変更
      return database.get(InstallQuery.teamId);
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

</div>

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET
  scopes: ['channels:read', 'groups:read', 'channels:manage', 'chat:write', 'incoming-webhook'],
  installerOptions: {
      authVersion: 'v1', // デフォルトは 'v2' (クラシック Slack アプリは 'v1')
      metadata: 'some session data',
      installPath: '/slack/installApp',
      redirectUriPath: '/slack/redirect',
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
        generateStateParam: (installUrlOptions, date) => {
          // URL の state パラメーターとして使用するランダムな文字列を生成
          const randomState = randomStringGenerator();
          // その値をキャッシュ、データベースに保存
          myDB.set(randomState, installUrlOptions);
          // データベースに保存されたものを利用可能な値として返却
          return randomState;
        },

        // 第一引数は日付オブジェクトで、第二引数は state を表現する文字列
        // `installUrlOptions` オブジェクトを応答
        verifyStateParam:  (date, state) => {
          // state をキーに、データベースから保存された installOptions を取得
          const installUrlOptions = myDB.get(randomState);
          return installUrlOptions;
        }
      },
  }
});
```

</details>
