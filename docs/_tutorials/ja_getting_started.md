---
title: Bolt 入門ガイド
order: 0
slug: getting-started
lang: ja-jp
layout: tutorial
permalink: /ja-jp/tutorial/getting-started
redirect_from:
  - /ja-jp/getting-started
  - /getting-started/ja-jp
---
# Bolt 入門ガイド

<div class="section-content">
このガイドでは、Bolt を使用して Slack アプリを起動し実行する方法について説明します。その過程で、新しい Slack アプリを作成し、ローカル環境を設定し、Slack ワークスペースからのメッセージをリスニングして応答するアプリを開発します。
</div> 

---

### アプリを作成する
最初にやるべきこと: Bolt で開発を始める前に、 [Slack アプリを作成](https://api.slack.com/apps/new)します。 

> 💡 いつもの仕事のさまたげにならないように、別に開発用のワークスペースを使用することをお勧めします — [新しいワークスペースを無料で作成](https://slack.com/get-started#create)できます。

アプリ名を入力し (後で変更可能)、インストール先のワークスペースを選択したら、`Create App`  ボタンをクリックすると、アプリの  **Basic Information**  ページが表示されます。

このページには、後で必要になる重要な認証情報 (**App Credentials**  ヘッダーの下の  `Signing Secret`  など) に加えて、アプリケーションの概要が表示されます。

![Basic Information page](../../assets/basic-information-page.png "Basic Information page")

ひと通り確認し、アプリのアイコンと説明を追加してから、アプリの設定 🔩 を始めましょう。

---

### トークンとアプリのインストール
Slack アプリは、[OAuth を使用して、Slack の API へのアクセスを管理](https://api.slack.com/docs/oauth)します。アプリがインストールされると、トークンを受け取ります。そのトークンを使って、アプリは API メソッドを呼び出すことができます。

Slack アプリに使用できるトークンタイプは、user(`xoxp`) トークンと bot(`xoxb`) トークンの 2 つです。ユーザートークンを使用すると、ユーザーがアプリをインストールまたは認証した後で、ユーザーに代わって API メソッドを呼び出すことができます。単一のワークスペースに複数のユーザートークンが存在する場合があります。ボットトークンは、アプリがインストールされるすべてのワークスペースで 1 回付与されます。ただし、ボットトークンは、アプリにボットユーザーを追加する必要があります。どのユーザーがインストールを実行しても、アプリで使用されるボットトークンは同じになります。

説明を簡潔にするために、このガイドではボットトークンを使用します。

ボットユーザーを追加するには、左側のサイドバーの  **Bot Users**  をクリックしてから、**Add A Bot User**  をクリックします。表示名とユーザー名を指定して、**Add Bot User**  をクリックします。

Slack へのメッセージの送信権限を持つボットユーザーが追加されたので、まずはワークスペースにアプリをインストールしましょう。

左側のサイドバーにある  **Install App**  をクリックし、ページ上部の  **Install App to Workspace**  ボタンをクリックします。アプリがリクエストしている権限の詳細を示す画面が表示されます。これは、アプリの OAuth トークンに適用されるスコープと相関しています。

インストールを承認すると、**OAuth & Permissions**  ページが表示されます。

![OAuth Tokens](../../assets/bot-token.png "OAuth Tokens")

2 つのトークンが表示されます。今回は`xoxb` ボットトークンを使用します。(このページを下にスクロールして  **Scope**  セクションを表示すると、`xoxp` トークンに追加できるさまざまなスコープが確認できます。)

> 💡 トークンは、パスワードのように大切に扱い、[安全に保管](https://api.slack.com/docs/oauth-safety)してください。アプリではそのトークンを使用して、Slack ワークスペースからの情報を投稿および取得します。

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

1. **Basic Information  ページから  Signing Secret  をコピー**して、新しい環境変数に保存します。次の例は Linux と MacOS で動作します。ただし、[Windows でも同様のコマンドが利用可能](https://superuser.com/questions/212150/how-to-set-env-variable-in-windows-cmd-line/212153#212153)です。

```shell
export SLACK_SIGNING_SECRET=<your-signing-secret>
```

2. **OAuth & Permissions  ページからボット (xoxb) トークンをコピー**し、それを別の環境変数に格納します。

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

アプリから、起動し実行中であることが通知されます。

---

### イベントの設定
アプリはボットとしてチームメンバーのように動作し、メッセージを投稿したり、絵文字リアクションを追加したりすることができます。Slack ワークスペースで発生するイベント (メッセージが投稿されたときや、メッセージに対するリアクションが投稿されたときなど) をリスニングするには、[Events API を使用してイベントタイプに登録](https://api.slack.com/events-api)します。

アプリのイベントを有効にするには、まずアプリ設定ページに戻ります ([アプリ管理ページ](https://api.slack.com/apps)でアプリをクリックします)。左側のサイドバーにある  **Event Subscription**  をクリックします。**Enable Events**  のスイッチをオンにします。


**Request URL**  というフォーム・フィールドには、指定したイベントに対応する HTTP POST リクエストを Slack から受信するためのパブリック URL です。

> ⚙️Slack 開発者がアプリをホストするプロバイダの例をいくつか[API サイト](https://api.slack.com/docs/hosting)に用意しておきました。

イベントが発生すると、Slack は、そのイベントをトリガーしたユーザーやイベントが発生したチャンネルなど、イベントに関する情報をアプリに送信します。アプリが詳細を処理し、それに応じて応答することができます。

<details>
<summary markdown="0">
<h4>開発用のローカルリクエスト URL </h4>
</summary>

アプリの開発を始めたばかりの場合は、パブリック URL をまだお持ちでないかもしれません。最終的には自ら URL をセットアップすることになるかもしれませんが、現時点では [ngrok](https://ngrok.com/) のような開発プロキシを利用することをお勧めします。これにより、パブリック URL が作成され、リクエストが開発環境にトンネルされます。[Slack でのローカル開発に ngrok を使用](https://api.slack.com/tutorials/tunneling-with-ngrok)する方法についてのチュートリアルを作成しておきました。このチュートリアルに従えば、すべてをセットアップすることができます。

開発用プロキシをインストールしたら、それを実行して特定のポートへのリクエストの転送を開始します (この例ではポート 3000 を使用していますが、アプリの初期化に使用するポートをカスタマイズした場合は、代わりにそのポートを使用してください)。

```shell
ngrok http 3000
```

![Running ngrok](../../assets/ngrok.gif "Running ngrok")

使用可能な URL が生成され、出力されます ( `https://` で始まる URL をお勧めします)。この URL がリクエスト URL のベースになります。この例では `https://8e8ec2d7.ngrok.io` です。

---
</details>

これで、ローカルマシンにトンネルする、アプリの公開 URL を用意できました。アプリの設定で使用する  Request URL  は、公開されている URL とアプリがリスニングする URL の組み合わせです。デフォルトでは、Bolt アプリは `/slack/events` をリスニングするため、完全なリクエスト URL は `https://8e8ec2d7.ngrok.io/slack/events` となります。

**Request URL**  ボックスの  **Enable Events**  スイッチの下のフィールドにこの URL を貼り付けます。Bolt アプリが引き続き実行されている場合は、URL が検証されチェックマークが表示されます。

Request URL が検証されたら、**Subscribe to Bot Events** までスクロールします。メッセージに関するイベントが４つあります−
message.channels (パブリックチャンネルのメッセージをリスニング), message.groups (プライベートチャンネルのメッセージをリスニング), message.im (App Home とダイレクトメッセージのリスニング), and message.mpim (グループ DM のリスニング)

もしボットに全てのメッセージイベントのリスニングをさせたいならば、これら４つ全てのイベントを選んでください。終わったら緑の **Save Changes** ボタンをクリックします。

---

### メッセージのリスニングと応答
これで、アプリでいくつかのロジックを設定する準備が整いました。まずは `message()` メソッドを使用して、メッセージのリスナーをアタッチしましょう。

次の例では、 `hello` という単語を含むすべてのメッセージをリッスンし、 `Hey there @user!` と応答します。

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to incoming messages that contain "hello"
app.message('hello', ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  say(`Hey there <@${message.user}>!`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

アプリを再起動したら、ボットユーザーをチャンネルに追加し、 `hello` を含むメッセージを送信してみてください。アプリが応答したら成功です。

これは基本的な例ですが、ここから自分の好きなようにアプリをカスタマイズしていくことができます。さらにインタラクティブな動作を試すために、プレーンテキストではなくボタンを送信してみましょう。

---

### アクションの送信と応答

ボタン、選択メニュー、日付ピッカー、ダイアログ、メッセージ操作などの機能を使用するには、インタラクティブ性を有効にする必要があります。イベントと同様に、Slack の URL を指定してアクション ( 「ボタン・クリック」など) を送信する必要があります。

アプリ設定ページに戻り、左側の  **Interactive Components**  をクリックします。**Request URL**  ボックスがもう 1 つあることがわかります。

デフォルトでは、Bolt はイベントに使用しているのと同じエンドポイントをインタラクティブコンポーネントに使用するように設定されているため、上記と同じリクエスト URL (この例では `https://8e8ec2d7.ngrok.io/slack/events`) を使用します。右下隅にある  **Save Changes**  ボタンを押してください。これでアプリのインタラクティブなコンポーネントの設定が有効になりました!

![Configuring a Request URL](../../assets/request-url-config.png "Configuring a Request URL")

それでは、アプリのコードに戻り、インタラクティブな処理を追加しましょう。この実装は以下の二つのステップで構成されます。
- 最初に、アプリからボタンを含むメッセージを送信します。
- 次に、ユーザーがボタンをクリックしたときの動作をアプリでリスニングし、応答します。

以下は、前のセクションで記述したアプリコードを、文字列ではなくボタン付きのメッセージを送信するように変更したものです。

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to incoming messages that contain "hello"
app.message('hello', ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  say({
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
    ]
  });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

`say()` に格納されている値が、 `blocks` の配列を含むオブジェクトになりました。このブロックは Slack メッセージを構成するコンポーネントであり、テキストや画像、日付ピッカーなど、さまざまなタイプがあります。この例では、アプリは、ボタンを `accessory` として含むセクションブロックを使用して応答します。

このボタン `accessory` オブジェクトには、`action_id` が割り当てられています。これはボタンの一意の識別子として機能するため、アプリはどのアクションに応答するかを指定できます。

> 💡 [Block Kit ビルダー](https://api.slack.com/tools/block-kit-builder)を使うとインタラクティブメッセージを簡単にプロトタイプすることができます。ビルダーを使用すると、ユーザー (またはそのチームメンバー) はメッセージをモックアップして、対応する JSON を生成し、それをアプリに直接貼り付けることができます。

これで、アプリを再起動し、アプリが登録されているチャンネルで `hello` と入力すると、ボタン付きのメッセージが表示されます。ただしこのボタンをクリックしても、まだ何も起こりません。

ボタンがクリックされるとフォローアップメッセージを送信するハンドラーを追加してみましょう。

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to incoming messages that contain "hello"
app.message('hello', ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  say({
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
    ]
  });
});

app.action('button_click', ({ body, ack, say }) => {
  // Acknowledge the action
  ack();
  say(`<@${body.user.id}> clicked the button`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

このように、`action_id` を使用することによってボタンアクションのリスナーを追加できるのです。アプリを再起動してボタンをクリックしてみましょう。すると、you clicked the button  という新しいメッセージがアプリに表示されるはずです。

---

### 次のステップ
これで最初の Bolt アプリが構築できました! 🎉

基本的なアプリの作成ができましたので、次回は是非もっといろいろな、 Bolt の機能を使ってアプリを作ってみましょう。下記のリンクを辿っていろいろアイデアを模索してみてください！

* [基本的な概念](https://slack.dev/bolt#basic)をお読みください。Bolt アプリからアクセスできるさまざまなメソッドと機能について学ぶことができます。

* ボットが[`events()` メソッド](https://slack.dev/bolt#event-listening)でリッスンできるさまざまなイベントを確認しましょう。イベントはすべて[API サイト](https://api.slack.com/events)にリストされています。

* Bolt を使用すると、アプリにアタッチされているクライアントで [Web API メソッドを呼び出す](https://slack.dev/bolt#web-api)ことができます。API サイトに [130 を超えるメソッド](https://api.slack.com/methods)を用意してあります。

* [API サイト](https://api.slack.com/docs/token-types)ではさまざまなトークンタイプの詳細を確認することができます。アプリには、実行するアクションに応じて異なるトークンが必要になる場合があります。
