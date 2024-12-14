---
title: AWS Lambda へのデプロイ
lang: ja-jp
---

このガイドでは、Bolt for JavaScript、[Serverless Framework](https://serverless.com/)、[AWS Lambda](https://aws.amazon.com/lambda/) を使った Slack アプリの準備とデプロイの方法について説明します。

この手順を全て終わらせたら、あなたはきっと⚡️ [Deploying to AWS Lambda](https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda) のサンプルアプリを動作させたり、それに変更を加えたり、自分のアプリを作ったりすることができるようになるでしょう。

---

## AWS Lambda のセットアップ {#set-up-aws-lambda}

[AWS Lambda](https://aws.amazon.com/lambda/) はサーバーレスの Function-as-a-Service（FaaS）プラットフォームです。AWS Lambda を利用すると、サーバーを管理することなく、コードを実行することができます。このセクションでは、ローカルマシンから AWS Lambda にアクセスするための設定を行います。

:::tip

すでにローカルマシンから AWS Lambda へのアクセスに必要な[プロファイルの構成](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-profiles)が済んでいる場合、このセクションはスキップできます。

:::

### 1. AWS アカウントを作成する

AWS アカウントをまだ持っていない場合は、[アカウントを作成](https://aws.amazon.com/)する必要があります。画面に表示される案内に沿って作成しましょう。

:::tip 

作成手順の中で請求情報の入力を求められる場合がありますが、ご心配なく。このガイドでは[無料利用枠](https://aws.amazon.com/lambda/pricing/)のみを使用します。

:::

### 2. AWS のアクセスキーを作成する

Lambda へのデプロイでは、プログラムから AWS アカウントにアクセスする手段が必要になります。AWS の世界では、このために**アクセスキー ID** と**シークレットアクセスキー**が必要です。

🍿 [IAM ユーザーを作成してアクセスキーをダウンロードする手順](https://www.youtube.com/watch?v=KngM5bfpttA)を紹介する短い動画を参考にしてみてください。

:::tip 

**すでに IAM ユーザーの作成が完了している場合は、** AWS の公式ガイドに従って [IAM ユーザーのアクセスキーを作成](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-creds)してください。

:::

### 3. AWS CLI をインストールする

AWS では [macOS、Windows、Linux](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) にインストールして利用できるコマンドラインインターフェイス（CLI）のツールが用意されています。

macOS では、[最新の .pkg インストーラーをダウンロード](https://awscli.amazonaws.com/AWSCLIV2.pkg)して AWS CLI をインストールできます。

### 4. AWS プロファイルを構成する

AWS CLI を使ってプロファイルを構成します。プロファイルはローカルマシンに置かれ、アクセスキーのペアを保管します。この CLI やその他のツールは、このプロファイルを使って AWS にアクセスします。

[プロファイルを構成](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-config)する最も簡単な方法は、次のコマンドを実行し、プロンプトに従って入力する方法です。

```zsh
aws configure
# AWS Access Key ID [None]: <AWS のアクセスキー>
# AWS Secret Access Key [None]: <AWS のシークレットアクセスキー>
# Default region name [None]: us-east-1
# Default output format [None]: json
```

:::tip 

[Default region name](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-region) と [Default output format](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-format) は最も望ましい設定でカスタマイズしてください。

:::

これでローカルマシンから AWS にアクセスするための設定が完了しました。👏 次は、同じように Serverless Framework も設定していきましょう。

---

## Serverless Framework をセットアップする {#set-up-serverless-framework}

[Serverless Framework](https://serverless.com/) では、AWS Lambda 向けのアプリの設定、デバッグ、デプロイを簡単に行うためのツールが用意されています。

Serverless でも macOS、Windows、Linux にインストールして利用できるコマンドラインインターフェイス（CLI）のツールが用意されています。インストールするには Serverless の[入門ガイド（英語）](https://www.serverless.com/framework/docs/getting-started/) をお読みください。

インストールが完了したら Serverless CLI をテストするため、利用可能なコマンドを表示してみましょう。

```shell
serverless help
```

Serverless のツールのセットアップが完了しました。次に、AWS Lambda 関数として実行する Bolt アプリの準備へと進みましょう。

---

## Bolt Slack アプリを入手する {#get-a-bolt-slack-app}

まだ Bolt アプリを自分で作成したことがない場合は、[入門ガイド](/getting-started)を参照してください。テンプレートのアプリをクローンするには、以下のコマンドを実行します。

```shell
git clone https://github.com/slackapi/bolt-js-getting-started-app.git
```

用意した Bolt アプリのディレクトリに移動します。

```shell
cd bolt-js-getting-started-app/
```

Bolt アプリを用意できました。次に AWS Lambda と Serverless Framework に対応するための準備をします。

---

## アプリをセットアップする {#prepare-the-app}

### 1. アプリを AWS Lambda に対応させる

デフォルトでは、入門ガイドの Bolt サンプルアプリはソケットモードを使用しています。WebSocket イベントの代わりに HTTP リクエストをリッスンするため、 `app.js` の設定を変更しましょう。

```javascript
// ボットトークンを使ってアプリを初期化します
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true, // この行を削除します
  appToken: process.env.SLACK_APP_TOKEN, // この行を削除します
});
```

次に Lambda 関数のイベントに応答するよう、Bolt アプリの [`receiver`](/concepts/receiver) をカスタマイズします。

`app.js` のソースコードの中で[モジュールのインポートを行う部分](https://github.com/slackapi/bolt-js-getting-started-app/blob/main/app.js#L1)を編集し、Bolt の `AwsLambdaReceiver` モジュールを require します。

```javascript
const { App, AwsLambdaReceiver } = require('@slack/bolt');
```

:::tip 

OAuth フローを実装するなら、現時点では [`ExpressReceiver`](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts) を使用する必要があります。

:::

その後、[ソースコードの中で Bolt アプリの初期化を行う部分](https://github.com/slackapi/bolt-js-getting-started-app/blob/4c29a21438b40f0cbca71ece0d39b356dfcf88d5/app.js#L10-L14)を編集して、`AwsLambdaReceiver` を使ったカスタムのレシーバーを作成します。

```javascript
// カスタムのレシーバーを初期化します
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// ボットトークンと、AWS Lambda に対応させたレシーバーを使ってアプリを初期化します。
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver: awsLambdaReceiver,
    
    // AwsLambdaReceiver を利用する場合は  `processBeforeResponse` は省略可能です。
    // OAuth フローに対応した ExpressReceiver など、他のレシーバーを使用する場合、
    // `processBeforeResponse: true` が必要になります。
    // このオプションは、ハンドラーの実行が完了するまで応答を返すのを遅延させます。
    // これによってハンドラーがトリガーとなった HTTP リクエストに応答を返すことでただちに終了されることを防ぐことができます。
    
    //processBeforeResponse: true
});
```

最後に、アプリのソースコードの末尾にある [HTTP サーバーを起動する部分](https://github.com/slackapi/bolt-js-getting-started-app/blob/main/app.js#L47-L52)を編集して、AWS Lambda 関数のイベントに応答するようにします。

```javascript
// Lambda 関数のイベントを処理します
module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}
```

完成したアプリのソースコードは、⚡️[deploy-aws-lambda](https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda/app.js) のサンプルのようになります。

### 2. serverless.yml を追加する

Serverless Framework のプロジェクトでは、アプリの設定とデプロイに `serverless.yml` ファイルを使用します。

アプリのルートディレクトリに `serverless.yml` という名前のファイルを新規作成し、次の内容を貼りつけます。

```yaml
service: serverless-bolt-js
frameworkVersion: '3'
provider:
  name: aws
  runtime: nodejs14.x
  environment:
    SLACK_SIGNING_SECRET: ${env:SLACK_SIGNING_SECRET}
    SLACK_BOT_TOKEN: ${env:SLACK_BOT_TOKEN}
functions:
  slack:
    handler: app.handler
    events:
      - http:
          path: slack/events
          method: post
plugins:
  - serverless-offline
```

:::tip 

`SLACK_SIGNING_SECRET` と `SLACK_BOT_TOKEN` の環境変数は、ローカルマシンで設定しておく必要があります。[Slack の環境変数をエクスポートする方法](/getting-started#setting-up-your-project)を入門ガイドで参照してください。

:::

### 3. serverless-offline モジュールをインストールする

ローカルでの開発を容易にするため、`serverless-offline` モジュールを使ってデプロイ対象の関数をエミュレートできるようにしましょう。

次のコマンドを実行して、開発用の devDependencies としてインストールします。

```bash
npm install --save-dev serverless-offline
```

これで Bolt アプリを AWS Lambda と Serverless に対応させることができました。次はアプリの実行とデプロイに進みます。

---

## アプリをローカルで実行する {#run-the-app-locally}

アプリを AWS Lambda 関数に応答させるための準備が完了したので、次にローカルでアプリを実行できるように環境を設定します。

### 1. ローカルのサーバーを起動する

まず、アプリの起動と AWS Lambda 関数のイベントをリッスンするため、`serverless offline` コマンドを実行します。

```zsh
serverless offline --noPrependStageInUrl
```

:::tip
 
 別のターミナルで上記のコマンドを実行しておくことで、ターミナル上でアプリのコードを変更することができます。コードの変更を保存する度、アプリは自動的にリロードされます。

:::

次に、ngrok を使って Slack のイベントをローカルマシンに転送します。

```zsh
ngrok http 3000
```

:::tip 

パブリック URL の作成方法と、ローカルマシンへのリクエストの転送方法については、[ngrok の使い方](/getting-started#setting-up-events)を参照してください。

:::

### 2. リクエスト URL を変更する

次に、[Slack アプリの設定](https://api.slack.com/apps)を開き、**リクエスト URL** を ngrok のウェブアドレスに変更します。

:::tip

**リクエスト URL** は `/slack/events` で終わる文字列で、例えば `https://abc123.ngrok.io/slack/events` のようになります。

:::

まず、サイドバーの「**Interactivity & Shortcuts**」を選択し、**リクエスト URL** を更新します。

![「Interactivity & Shortcuts」ページ](/img/interactivity-and-shortcuts-page.png "「Interactivity & Shortcuts」ページ")

次に、サイドバーの「**Event Subscriptions**」を選択し、**リクエスト URL** を更新します。

![「Event Subscriptions」ページ](/img/event-subscriptions-page.png "「Event Subscriptions」ページ")

### 3. Slack アプリをテストする

Slack アプリをテストします。今作った Bolt アプリを Slack のチャンネルに招待し、半角の小文字で「hello」と入力してみましょう。[入門ガイド](/getting-started)のとおり、アプリから応答があるはずです。

> 👩‍💻 hello<br/>
> 🤖 Hey there @Jane!

応答がない場合、**リクエスト URL** を確認してからもう一度試してみてください。

:::tip 

**動作の仕組み** : ngrok と Serverless のコマンドは同じポートを使用するように設定されています（デフォルトでは「3000」）。**リクエスト URL** に向けて送信された Slack イベントは、ローカルマシンの ngrok で受信されます。このリクエストはさらに Serverless Offline に転送されます。Serverless Offline は AWS Lambda 関数のイベントをエミュレートしていて、Bolt アプリのレシーバーをトリガーさせます。 🛫🛬 長旅ですね。

:::

---

## アプリをデプロイする {#deploy-the-app}

今までローカルでアプリを実行し、 Slack ワークスペースでテストをしてきました。さて、動作するアプリができたので、デプロイしてみましょう!

AWS Lambda 向けのアプリのプロビジョニング、パッケージング、デプロイには、Serverless Framework のツールが利用できます。アプリのデプロイが完了したら、アプリのリクエスト URL を更新して、「hello」と入力した時にアプリが応答できるようにします。✨

### 1. AWS Lambda にアプリをデプロイする

次のコマンドを使って AWS Lambda にアプリをデプロイします。

```shell
serverless deploy
# Serverless:Packaging service...
# ...
# endpoints:
#   POST - https://atuzelnkvd.execute-api.us-east-1.amazonaws.com/dev/slack/events
# ...
```

アプリのデプロイが成功すると、**エンドポイント**が発行されます。これをアプリの**リクエスト URL** に指定します。発行された**エンドポイント**をコピーして、次のセクションで使います。

:::tip 

**エンドポイント**は、`/slack/events` で終わる文字列です。

:::

### 2. Slack アプリの設定を更新する

Slack からのイベントやアクションの送信先となる**リクエスト URL** に、発行された AWS Lambda の**エンドポイント**を指定します。[Slack アプリの構成](https://api.slack.com/apps)を開き、先ほどコピーしたエンドポイントを**リクエスト URL** に貼りつけます。

まず、サイドバーの「**Interactivity & Shortcuts**」を選択し、**リクエスト URL** を更新します。

![「Interactivity & Shortcuts」ページ](/img/interactivity-and-shortcuts-page.png "「Interactivity & Shortcuts」ページ")

次に、サイドバーの「**Event Subscriptions**」を選択し、**リクエスト URL** を更新します。

![「Event Subscriptions」ページ](/img/event-subscriptions-page.png "「Event Subscriptions」ページ")

### 3. Slack アプリをテストする

アプリのデプロイと、Slack の設定の更新が完了しました。動作を試してみましょう。

「[アプリをローカルで実行する](#run-the-app-locally)」のセクションで行った操作と同様に、アプリを招待した Slack チャンネルを開いて「hello」と入力します。アプリが応答し、同じように挨拶してくれるはずです。

> 👩‍💻 hello<br/>
> 🤖 Hey there @Jane!

### 4. 更新をデプロイする

Slack アプリの開発を継続していくなら、更新したアプリをデプロイする必要が出てくるでしょう。それをやってみるために、「goodbye」というメッセージに応答するようにアプリを変更してみましょう。

次のコードを `app.js` に追加します（[GitHub でソースコードを確認できます](https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda/app.js)）。

```javascript
// 「goodbye」というメッセージの着信をリッスンします
app.message('goodbye', async ({ message, say }) => {
  // イベントがトリガーされたチャンネルに向けて say() でメッセージを送信します
  await say(`See ya later, <@${message.user}> :wave:`);
});
```

先ほどと同じコマンドを使って更新をデプロイします。

```shell
serverless deploy
```

デプロイが完了したら、アプリを参加させた Slack チャンネルを開いて、半角の小文字で「goodbye」と入力してみましょう。Slack アプリに「See you later」と表示されるはずです。

:::tip

一つの関数に小さな変更を加える場合、その関数だけをデプロイするためにより高速な `serverless deploy function -f my-function` を実行することができます。より詳細なヘルプを見るには `serverless help deploy function` を実行してください。

:::

---

## 次のステップ {#next-steps}

⚡️[AWS Lambda を使った最初の Bolt for JavaScript アプリ](https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda)をデプロイできました。🚀

基本的なアプリのデプロイができましたので、次はアプリのカスタマイズやモニタリングを行う方法を調べてみましょう。

- [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) と [Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/intro/) の理解を深める。
- Bolt の基本的な概念と [Serverless のプラグイン](https://www.serverless.com/framework/docs/providers/aws/guide/plugins/)を活用してアプリを拡張する。
- [Bolt の応用コンセプト](/concepts/logging)でログの記録についての知識を深めたり、[Serverless でのログメッセージの表示方法](https://www.serverless.com/framework/docs/providers/aws/cli-reference/logs/)について確認したりする。
- Serverless の [AWS Lambda のテスト環境](https://www.serverless.com/framework/docs/providers/aws/guide/testing/)や[デプロイ環境](https://www.serverless.com/framework/docs/providers/aws/guide/deploying/)を本格的に活用する。