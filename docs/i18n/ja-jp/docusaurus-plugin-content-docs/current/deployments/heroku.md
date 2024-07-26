---
title: Heroku へのデプロイ
lang: ja-jp
---

# Heroku へのデプロイ

このガイドでは、Bolt for JavaScriptと[Heroku プラットフォーム](https://heroku.com/)を使ってSlack アプリを用意して、デプロイするまでの手順を説明します。全体の流れとしては、Bolt Slack アプリをダウンロードし、Heroku 用の準備を済ませ、デプロイする流れになります。


この手順を全て終わらせたら、あなたはきっと️⚡️[getting-started-with-heroku](https://github.com/slackapi/bolt-js/tree/main/examples/deploy-heroku)のサンプルアプリを動作させたり、それに変更を加えたり、自分のアプリを作ったりすることができるようになるでしょう。

---

### Bolt Slack アプリを入手する {#get-a-bolt-slack-app}

Bolt アプリを作るのが初めてという場合は、まず[Bolt 入門ガイド](/getting-started)に沿って進めてみましょう。または、以下のテンプレートアプリをクローンしてもよいでしょう。

```shell
git clone https://github.com/slackapi/bolt-js-getting-started-app.git
```

ダウンロードしたBolt アプリのディレクトリに移動します。

```shell
cd bolt-js-getting-started-app/
```

次に、このアプリをHeroku で動かすための準備をします。

---

### アプリをHeroku で動かすための準備する {#prepare-the-app-for-heroku}

Heroku は、作ったアプリをホストできる柔軟性の高いプラットフォームで、少し設定が必要です。このセクションでは、Bolt アプリに変更を加え、Heroku に対応させます。

**1. Git リポジトリを使用する**

Heroku にアプリをデプロイするには、まずGit リポジトリが必要です。まだGit を使ったことがない場合は、[Git をインストール](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)し、[Git リポジトリを作成](https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository)します

:::tip

前のセクションで`git clone`を使用した場合、Git リポジトリはすでに存在しますので、この手順はスキップできます

:::

**2. Procfile を追加する**

Heroku アプリでは、必ず`Procfile`という専用のファイルが必要です。このファイルを使ってHeroku にアプリの起動方法を伝えます。Bolt Slack アプリは、公開されたWeb アドレスを持つWeb サーバーとして起動します。

アプリのルートディレクトリに、拡張子なしの`Procfile`という名前のファイルを作成し、次の内容を貼りつけます。内容はどのようにアプリを動かすかによって変わります。

デフォルトでは Bolt アプリは公開された Web アドレスを持つ Web サーバーとして起動するので、以下のように指定します：

```yaml
web: node app.js
```

ソケットモードを使ったアプリをデプロイするときは、ポートをリッスンしない worker として起動します：

```yaml
worker: node app.js
```

ファイルを保存したら、ローカルのGit リポジトリにコミットします。

```shell
git add Procfile
git commit -m "Add Procfile"
```

:::tip 

既存のBolt アプリを使ってこのガイドに沿って進めている場合は、[Preparing a Codebase for Heroku Deployment](https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment#4-listen-on-the-correct-port)のガイドを参考に、適切なポートをリッスンするようにしてください。

:::

---

### Heroku ツールをセットアップする {#set-up-the-heroku-tools}

ローカルマシンでHeroku ツールのセットアップを行います。このツールは、Heroku プラットフォームを使用するアプリの管理、デプロイ、デバッグを行う場合に便利です。

**1. Heroku CLI をインストールする**

Heroku ツールは、コマンドラインインターフェイス（CLI）の形で提供されています。さっそく[macOS、Windows、Linux 用のHeroku CLI](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up)をインストールしましょう。macOS では次のコマンドを実行します。

```shell
brew install heroku/brew/heroku
```

インストールが完了したら、Heroku CLI を試してみましょう。どのようなコマンドが使えるかを一覧表示してみます。

```shell
heroku help
```

:::tip 

`heroku`コマンドが見つからない場合は、パスを更新するため新しいターミナルセッションまたはターミナルタブを開いてください。

:::

**2. Heroku CLI にログインする**

Heroku CLI では、ローカルマシンからHeroku アカウントに接続します。[無料のHeroku アカウントを新規登録](https://heroku.com)して、次のコマンドでHeroku CLI にログインします。

```shell
heroku login
```
:::tip 

ファイアウォールを使っている場合、Heroku CLI で使用される[プロキシ環境変数](https://devcenter.heroku.com/articles/using-the-cli#using-an-http-proxy)の設定が必要なことがあります。

:::

**3. Heroku CLI へのログインが成功したか確認する**

ログインできたかどうか確認しましょう。次のコマンドを実行すると、Heroku CLI に現在接続されているアカウント名が表示されます。

```shell
heroku auth:whoami
```

これでHeroku ツールのセットアップが完了しました。それではHeroku アプリの作成の本編に進みましょう。

---

### Heroku アプリを作成する {#create-an-app-on-heroku}

先ほどインストールしたツールを使って、[Heroku アプリを作成](https://devcenter.heroku.com/articles/creating-apps)します。アプリを作成するときは、ユニークな名前を自分で指定するか、ランダムな名前を生成することができます。

:::tip 

[Heroku アプリはあとから名前を変更することもできます](https://devcenter.heroku.com/articles/renaming-apps)が、リモートのGit アドレスとパブリックのWeb アドレスも変更になります。

:::

**1. Heroku アプリを作成する**

ユニークな名前を指定してHeroku アプリを作成します。

```shell
heroku create my-unique-bolt-app-name
```

または、ランダムな名前を楽しむならこちらで。

```shell
heroku create
# Creating sharp-rain-871... done, stack is heroku-18
# https://sharp-rain-871.herokuapp.com/ | https://git.heroku.com/sharp-rain-871.git
```

Heroku アプリが作成されると、いくつかの情報が表示されます。これらの情報は次のセクションで使用します。この例では、次のようになります。

- アプリ名: `sharp-rain-871`
- Web アドレス: `https://sharp-rain-871.herokuapp.com/`
- 空のリモートGit リポジトリ: `https://git.heroku.com/sharp-rain-871.git`

**2. Heroku のリモートGit リポジトリを確認する**

Heroku CLI は、自動的に`heroku`という名前のリモートGit リポジトリをローカルに追加します。リモートGit リポジトリを一覧して、`heroku`が存在することを確認しましょう。

```shell
git remote -v
# heroku	https://git.heroku.com/sharp-rain-871.git (fetch)
# heroku	https://git.heroku.com/sharp-rain-871.git (push)
```

**3. アプリをデプロイする**

Slack アプリの認証情報をHeroku アプリに設定します。

```shell
heroku config:set SLACK_SIGNING_SECRET=<your-signing-secret>
heroku config:set SLACK_BOT_TOKEN=xoxb-<your-bot-token>
```

:::tip 

認証情報の入手場所がわからない場合、Bolt 入門ガイドで[署名シークレットとトークンのエクスポート](/getting-started)について参照してください。

:::

ローカルでのアプリの準備と、Heroku アプリの作成が完了しました。次のステップは、デプロイです。

---

### アプリをデプロイする {#deploy-the-app}

アプリをデプロイするため、ローカルのコードをHeroku にプッシュします。その後Slack アプリの設定を更新し、Heroku アプリに"hello" と声をかけてみましょう。 ✨

**1. Heroku にアプリをデプロイする**

Heroku へのアプリのデプロイには、通常`git push`コマンドを使用します。これにより、ローカルリポジトリのコードがリモートの`heroku`リポジトリにプッシュされます。

次のコマンドでアプリをデプロイしましょう。

```shell
git push heroku main
```
Heroku でデプロイされるのは、[master またはmain ブランチ](https://devcenter.heroku.com/articles/git-branches)のコードです。それ以外のブランチにプッシュした場合、デプロイ処理はトリガーされません

:::tip 

Heroku deploys code that's pushed to the [master or main branches](https://devcenter.heroku.com/articles/git-branches). Pushing to other branches will not trigger a deployment.

:::

最後に、Heroku CLI を使ってWeb サーバーインスタンスを起動します。

```shell
heroku ps:scale web=1
```

**2. Slack アプリの設定を更新する**

次に、Heroku のWeb アドレスをリクエストURL に指定し、Slack からのイベントやアクションがこのURL に送信されるようにします。

次のコマンドを使ってHeroku のWeb アドレスを取得します。

```shell
heroku info
# ...
# Web URL: https://sharp-rain-871.herokuapp.com/
```

この例では、`https://sharp-rain-871.herokuapp.com/`がWeb アドレスとなります。

[Slack アプリのページ](https://api.slack.com/apps)を開き、アプリ名を選択します。次に、リクエストURLを自分で確認したWeb アドレスに変更します。設定する場所は2 か所あります。

:::tip 

リクエストURL の末尾は`/slack/events`です。例えば`https://sharp-rain-871.herokuapp.com/slack/events`のようになります。

:::

つ目の場所は、サイドパネルの「**Interactivity & Shortcuts**」です。これを選択し、リクエスト**URLを**更新します。

![Interactivity & Shortcuts page](/img/interactivity-and-shortcuts-page.png "Interactivity & Shortcuts")

2 つ目の場所は、サイドパネルの「**Event Subscriptions**」です。これを選択し、リクエスト**URLを**更新します。

![Event Subscriptions page](/img/event-subscriptions-page.png "Event Subscriptions")

:::tip 

無料プランで使用するHeroku アプリは、非アクティブな状態が続くとスリープします。💤 認証が失敗した場合、すぐに再試行してみてください。

:::

**3. Slack アプリをテストする**

アプリのデプロイが完了し、Slack の設定変更も行いました。アプリを試してみましょう。

アプリが参加しているSlack チャンネルを開き、半角の小文字で"hello" と書き込みます。[Bolt 入門ガイド](/getting-started)のとおり、アプリから応答があるはずです。応答がない場合、リクエスト**URLを**確認し、もう一度試してください。

---

### 変更をデプロイする {#deploy-an-update}

Slack アプリを構築するなかで、変更を加えてデプロイする必要があります。一般的な流れでは、変更を加え、コミットし、Heroku にプッシュするという順番です。

この流れをつかむため、アプリが"goodbye" というメッセージに応答するように変更を加えてみましょう。次のコードを`app.js` に追加します（[GitHub のソースコードはこちら](https://github.com/slackapi/bolt-js/blob/main/examples/deploy-heroku/app.js)）。

```javascript
// "goodbye" が含まれるメッセージの着信をリッスン
app.message('goodbye', async ({ message, say }) => {
  // say() で、イベントがトリガーされたチャンネルにメッセージを送信する
  await say(`See ya later, <@${message.user}> :wave:`);
});
```

変更内容をローカルのGit リポジトリにコミットします。

```shell
git commit -am "ユーザーに'goodbye' を返す"
```

変更内容をリモートのherokuリポジトリにプッシュし、デプロイします。

```shell
git push heroku main
```

デプロイ処理が完了したら、アプリが参加しているSlack チャンネルを開き、半角の小文字で"goodbye" と書き込みます。Slack アプリから、さよならの挨拶が返ってくるはずです。

---

### 次のステップ {#next-steps}

これではじめて️⚡Bolt for JavaScript アプリをHerokuへデプロイすることに成功しました。🚀

基本的なアプリのデプロイができましたので、次はアプリのカスタマイズやモニタリングを行う方法を調べてみましょう。おすすめのステップをいくつか紹介します。

- [How Heroku Works](https://devcenter.heroku.com/articles/how-heroku-works)を読んでHeroku の動作の理解を深めたり、[Heroku アプリを無料で使う場合の制限](https://devcenter.heroku.com/articles/free-dyno-hours)をチェックしたりする。
- Bolt の基本的な概念を参考にしてアプリを拡張したり、[Heroku Add-ons](https://elements.heroku.com/addons)をアプリに取り入れたりする
- Bolt の応用コンセプトでログの表示について学習し、[Heroku でのログメッセージの確認方法](https://devcenter.heroku.com/articles/getting-started-with-nodejs#view-logs)を把握する。
- [Heroku アプリのスケール方法](https://devcenter.heroku.com/articles/getting-started-with-nodejs#scale-the-app)に従って、アクセスの増加に対処する。