---
title: Bolt 入門ガイド
order: 0
slug: getting-started-http
lang: ja-jp
layout: tutorial
permalink: /ja-jp/tutorial/getting-started
redirect_from:
  - /ja-jp/getting-started
  - /getting-started/ja-jp
---
# Bolt 入門ガイド

<div class="section-content">
このガイドでは、Bolt を使用して Slack アプリを起動し実行する方法について説明します。その過程で、新しい Slack アプリを作成し、ローカル環境を設定し、Slack ワークスペースからのメッセージをリッスンして応答するアプリを開発します。
</div>

このガイドが終わったら、あなたはこの⚡️[Getting Started app](https://github.com/slackapi/bolt-js-getting-started-app)を実行したり、修正したり、自分で作ったりすることができます。

---

### アプリを作成する
最初にやるべきこと: Bolt で開発を始める前に、 [Slack アプリを作成](https://api.slack.com/apps/new)します。

> 💡 いつもの仕事のさまたげにならないように、別に開発用のワークスペースを使用することをおすすめします — [新しいワークスペースを無料で作成](https://slack.com/get-started#create)できます。

アプリ名を入力し (後で変更可能)、インストール先のワークスペースを選択したら、`Create App`  ボタンをクリックすると、アプリの  **Basic Information**  ページが表示されます。

このページには、後で必要になる重要な認証情報 (**App Credentials**  ヘッダーの下の  `Signing Secret`  など) に加えて、アプリケーションの概要が表示されます。

![Basic Information page](../../assets/basic-information-page.png "Basic Information page")

ひと通り確認し、アプリのアイコンと説明を追加してから、アプリの設定 🔩 を始めましょう。

---

### トークンとアプリのインストール
Slack アプリは、[OAuth を使用して、Slack の API へのアクセスを管理](https://api.slack.com/docs/oauth)します。アプリがインストールされると、トークンを受け取ります。そのトークンを使って、アプリは API メソッドを呼び出すことができます。

Slack アプリで使用できるトークンには、ユーザートークン（`xoxp`）とボットトークン（`xoxb`）、アプリレベルトークン（`xapp`）の 3 種類があります。
- [ユーザートークン](https://api.slack.com/authentication/token-types#user) を使用すると、アプリをインストールまたは認証したユーザーに成り代わって API メソッドを呼び出すことができます。1 つのワークスペースに複数のユーザートークンが存在する可能性があります。
- [ボットトークン](https://api.slack.com/authentication/token-types#bot) はボットユーザーに関連づけられ、1 つのワークスペースでは最初に誰かがそのアプリをインストールした際に一度だけ発行されます。どのユーザーがインストールを実行しても、アプリが使用するボットトークンは同じになります。_ほとんど_のアプリで使用されるのは、ボットトークンです。
- [アプリレベルトークン](https://api.slack.com/authentication/token-types#app) は、全ての組織（とその配下のワークスペースでの個々のユーザーによるインストール）を横断して、あなたのアプリを代理するものです。アプリレベルトークンは、アプリの WebSocket コネクションを確立するためによく使われます。

説明を簡潔にするために、このガイドではボットトークンを使用します。

1. 左側のサイドバーの **OAuth & Permissions** にアクセスして、**Bot Token Scopes** までスクロールします。そして、**Add an OAuth Scope** をクリックします。

2. とりあえずは、[`chat:write`](https://api.slack.com/scopes/chat:write) というスコープだけを追加してみましょう。これは、アプリにボットユーザがメンバーとして参加しているチャンネルへのメッセージの投稿を許可するスコープです。

3. ページ上部までスクロールして戻り、**Install App to Workspace** をクリックします。すると、開発用のワークスペースにこのアプリをインストールするための Slack の OAuth 確認画面へと誘導されます。

4. インストールを承認すると、**OAuth & Permissions** ページが表示され、**Bot User OAuth Access Token** を確認することができるはずです。

![OAuth Tokens](../../assets/bot-token.png "OAuth Tokens")

> 💡 トークンは、パスワードのように大切に扱い、[安全に保管](https://api.slack.com/docs/oauth-safety)してください。アプリではそのトークンを使用して、Slack ワークスペースからの情報を投稿および取得します。

---

### ローカルプロジェクトの設定
初期設定が完了したので、次は新しい Bolt プロジェクトを設定します。ここで、アプリのロジックを処理するコードを記述します。

プロジェクトをまだ作成していない場合は、新しいプロジェクトを作成しましょう。次のように、空のディレクトリを作成して、新しいプロジェクトを初期化します。

```shell
mkdir first-bolt-app
cd first-bolt-app
npm init
```

新しいプロジェクトを説明するための一連の質問が表示されます (特に問題がなければ、各プロンプトで <kbd>Enter</kbd> を押すと、デフォルトを受け入れることができます)。完了すると、ディレクトリ内に新しい `package.json` ファイルが作成されます。

Bolt パッケージを新しいプロジェクトにインストールする前に、アプリの設定時に生成されたボットトークンと signing secret (サイン認証) を保存しましょう。これらは環境変数として保存する必要があります。**バージョン管理では保存しない**でください。

1. **Basic Information ページから Signing Secret をコピー**して、新しい環境変数に保存します。次の例は Linux と macOS で動作します。ただし、[Windows でも同様のコマンドが利用可能](https://superuser.com/questions/212150/how-to-set-env-variable-in-windows-cmd-line/212153#212153)です。
```shell
export SLACK_SIGNING_SECRET=<your-signing-secret>
```

2. **OAuth & Permissions ページからボット (xoxb) トークンをコピー**し、それを別の環境変数に格納します。
```shell
export SLACK_BOT_TOKEN=xoxb-<your-bot-token>
```

それでは、アプリを作成しましょう。次のコマンドを使用して、`@slack/bolt` パッケージをインストールし、 `package.json` 中で依存ファイルとして保存します。

```shell
npm install @slack/bolt
```

このディレクトリ内に `app.js` という名前の新しいファイルを作成し、以下のコードを追加します。

```javascript
const { App } = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

まず実行してみましょう。 `app.js` ファイルを保存してから、以下のコマンドラインで動かします。

```script
node app.js
```

アプリから、起動し実行中であることが通知されます🎉

---

### イベントの設定 (HTTP)
アプリはボットとしてチームメンバーのように動作し、メッセージを投稿したり、絵文字リアクションを追加したりすることができます。

Slack ワークスペースで発生するイベント (メッセージが投稿されたときや、メッセージに対するリアクションが投稿されたときなど) をリッスンするには、[Events API を使用してイベントタイプに登録](https://api.slack.com/events-api)します。


アプリのイベントを有効にしましょう。

1. アプリのイベントを有効にするには、まずアプリ設定ページに戻ります ([アプリ管理ページ](https://api.slack.com/apps)でアプリをクリックします)。左側のサイドバーにある  **Event Subscription**  をクリックします。**Enable Events**  のスイッチをオンにします。


2. Request URLを追加します。Slackはイベントに対応するHTTP POSTリクエストをこの[Request URL](https://api.slack.com/apis/connections/events-api#the-events-api__subscribing-to-event-types__events-api-request-urls)エンドポイントに送信します。Boltは`/slack/events`のパスを使用して、すべての受信リクエスト（ショートカット、イベント、インタラクティビティのペイロードなど）をリッスンします。アプリの設定でRequest URLを設定する際には、`https://<your-domain>/slack/events`のように`/slack/events`を追加します。💡

> ローカル開発では、[ngrok](https://ngrok.com/)のようなプロキシサービスを使って公開URLを作成し、リクエストを開発環境にトンネリングすることができます。[ローカル開発のためのSlackでのngrokの使用](https://api.slack.com/tutorials/tunneling-with-ngrok)については別のチュートリアルがありますので、そちらを参照してください。

最後に、聞きたいイベントをSlackに伝えましょう。**Event Subscriptions**の下にある、**Enable Events**というラベルの付いたスイッチを切り替えます。

イベントが発生すると、Slack は、そのイベントをトリガーしたユーザーやイベントが発生したチャンネルなど、イベントに関する情報をアプリに送信します。アプリが詳細を処理し、それに応じて応答することができます。

**Request URL**  ボックスの  **Enable Events**  スイッチの下のフィールドにこの URL を貼り付けます。Bolt アプリが引き続き実行されている場合は、URL が検証されチェックマークが表示されます。

Request URL が検証されたら、**Subscribe to Bot Events** までスクロールします。メッセージに関するイベントが４つあります:
- `message.channels` あなたのアプリが追加されているパブリックチャンネルのメッセージをリッスン
- `message.groups` あなたのアプリが追加されている🔒プライベートチャンネルのメッセージをリッスン
- `message.im` あなたのアプリとユーザーのダイレクトメッセージをリッスン
- `message.mpim` あなたのアプリが追加されているグループ DM をリッスン

もしボットに参加しているすべての場所で全てのメッセージイベントをリッスンさせたいなら、これら４つ全てのイベントを選んでください。選択したら、緑の **Save Changes** ボタンをクリックします。

---

### メッセージのリスニングと応答
これで、アプリでいくつかのロジックを設定する準備が整いました。まずは `message()` メソッドを使用して、メッセージのリスナーをアタッチしましょう。

次の例では、あなたのアプリが追加されているチャンネルや DM で `hello` という単語を含むすべてのメッセージをリッスンし、 `Hey there @user!` と応答します。

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

アプリを再起動したら、ボットユーザーをチャンネル、 DM に追加し、 `hello` を含むメッセージを送信してみてください。アプリが応答したら成功です。

これは基本的な例ですが、ここから自分の好きなようにアプリをカスタマイズしていくことができます。さらにインタラクティブな動作を試すために、プレーンテキストではなくボタンを送信してみましょう。

---

### アクションの送信と応答

ボタン、選択メニュー、日付ピッカー、モーダルなどの機能を使用するには、インタラクティブ性を有効にする必要があります。イベントと同様に、Slack の URL を指定してアクション ( 「ボタン・クリック」など) を送信する必要があります。

アプリ設定ページに戻り、左側の  **Interactivity & Shortcuts**  をクリックします。**Request URL**  ボックスがもう 1 つあることがわかります。

> 💡 デフォルトでは、Bolt はイベントに使用しているのと同じエンドポイントをインタラクティブコンポーネントに使用するように設定されているため、上記と同じリクエスト URL (この例では `https://8e8ec2d7.ngrok.io/slack/events`) を使用します。右下隅にある  **Save Changes**  ボタンを押してください。これでアプリのインタラクティブなコンポーネントを利用する設定が有効になりました!

![Configuring a Request URL](../../assets/request-url-config.png "Configuring a Request URL")

インタラクティブ機能を有効にすると、ショートカット、モーダル、インタラクティブコンポーネント（ボタン、セレクトメニュー、データピッカーなど）とのやり取りがイベントとしてアプリに送信されます。

それでは、アプリのコードに戻り、インタラクティブな処理を追加しましょう。この実装は以下の二つのステップで構成されます。
- 最初に、アプリからボタンを含むメッセージを送信します。
- 次に、ユーザーがボタンをクリックしたときの動作をアプリでリッスンし、応答します。

以下は、前のセクションで記述したアプリコードを、文字列だけでなく、ボタン付きのメッセージを送信するように変更したものです。

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

`say()` に格納されている値が、 `blocks` の配列を含むオブジェクトになりました。このブロックは Slack メッセージを構成するコンポーネントであり、テキストや画像、日付ピッカーなど、さまざまなタイプがあります。この例では、アプリは、ボタンを `accessory` として含むセクションブロックを使用して応答します。`blocks` を使っている場合、 `text` は通知やアクセシビリティのためのフォールバックとして使用されます。

このボタン `accessory` オブジェクトには、`action_id` が割り当てられています。これはボタンの一意の識別子として機能するため、アプリはどのアクションに応答するかを指定できます。

> 💡 [Block Kit ビルダー](https://app.slack.com/block-kit-builder)を使うとインタラクティブメッセージを簡単にプロトタイプすることができます。ビルダーを使用すると、ユーザー (またはそのチームメンバー) はメッセージをモックアップして、対応する JSON を生成し、それをアプリに直接貼り付けることができます。

これで、アプリを再起動し、アプリが登録されているチャンネルで `hello` と入力すると、ボタン付きのメッセージが表示されます。ただしこのボタンをクリックしても、まだ何も起こりません。

ボタンがクリックされるとフォローアップメッセージを送信するハンドラーを追加してみましょう。

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

このように、`app.action()` を使うことで `button_click` という `action_id` のボタンアクションのリスナーを追加できるのです。アプリを再起動してボタンをクリックしてみましょう。すると、you clicked the button  という新しいメッセージがアプリに表示されるはずです。

---

### 次のステップ
これで最初の Bolt アプリが構築できました! 🎉

基本的なアプリの作成ができましたので、次回は是非もっといろいろな、 Bolt の機能を使ってアプリを作ってみましょう。下記のリンクを辿っていろいろアイデアを模索してみてください！

* [基本的な概念](/bolt-js/ja-jp/concepts#basic)をお読みください。Bolt アプリからアクセスできるさまざまなメソッドと機能について学ぶことができます。

* ボットが[`events()` メソッド](/bolt-js/ja-jp/concepts#event-listening)でリッスンできるさまざまなイベントを確認しましょう。イベントはすべて[API サイト](https://api.slack.com/events)にリストされています。

* Bolt を使用すると、アプリにアタッチされているクライアントで [Web API メソッドを呼び出す](/bolt-js/ja-jp/concepts#web-api)ことができます。API サイトに [220 を超えるメソッド](https://api.slack.com/methods)を用意してあります。

* 異なるトークンの種類については、[APIサイト](https://api.slack.com/docs/token-types)を参照してください。アプリケーションが実行したいアクションに応じて、異なるトークンが必要になる場合があります。HTTPではなく[Socket Mode](/bolt-js/tutorial/getting-started)を使用している場合は、`connections:write`スコープを持つ追加の(`xapp`)トークンが必要です。
