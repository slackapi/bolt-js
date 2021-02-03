---
title: 3.x マイグレーションガイド
order: 2
slug: migration-v3
lang: ja-jp
layout: tutorial
permalink: /ja-jp/tutorial/migration-v3
---
# 3.x マイグレーションガイド

<div class="section-content">
このガイドは Bolt 2.x を利用しているアプリを 3.x にアップグレードするための手順について説明します。いくつかの変更が必要とはなりますが、ほとんどのアプリの場合で、おそらく対応に必要な時間は 5 〜 15 分程度です。

*注: もしすぐにアップグレードをしない場合は、[Bolt 2.x に関するサポートスケジュール](#slackbolt2x-support-schedule)をご確認ください*
</div> 

---

### InstallationStore と orgAuthorize での OrG レベルでのインストール対応に関する変更

[Bolt for JavaScript 2.5.0](https://github.com/slackapi/bolt-js/releases/tag/%40slack%2Fbolt%402.5.0) で、私たちは [OrG レベルでのインストール](https://api.slack.com/enterprise/apps)のサポートを追加しました。このサポートをあなたのアプリケーションに追加するには、OAuth フローの中で使用される `fetchOrgInstallation`、`storeOrgInstallation` という二つの新しいメソッドを導入する必要がありました。 3.x では、よりシンプルなインタフェースの実現と Bolt for Python、Bolt for Java との互換性を考慮して、これらの二つの新しいメソッドのサポートを廃止しました。マイグレーションに必要となる変更については以下のコード例を参考にしてください。

これまで:

```javascript
installationStore: {
    storeInstallation: async (installation) => {
      // change the line below so it saves to your database
      return await database.set(installation.team.id, installation);
    },
    fetchInstallation: async (installQuery) => {
      // change the line below so it fetches from your database
      return await database.get(installQuery.teamId);
    },
    storeOrgInstallation: async (installation) => {
      // include this method if you want your app to support org wide installations
      // change the line below so it saves to your database
      return await database.set(installation.enterprise.id, installation);
    },
    fetchOrgInstallation: async (installQuery) => {
      // include this method if you want your app to support org wide installations
      // change the line below so it fetches from your database
      return await database.get(installQuery.enterpriseId);
    },
  },
```

これから:

```javascript
installationStore: {
    storeInstallation: async (installation) => {
      if (installation.isEnterpriseInstall) {
        // support for org wide app installation
        return await database.set(installation.enterprise.id, installation);
      } else {
        // single team app installation
        return await database.set(installation.team.id, installation);
      }
      throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
      // replace database.get so it fetches from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation lookup
        return await database.get(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        return await database.get(installQuery.teamId);
      }
      throw new Error('Failed fetching installation');
    },
  },
```

この変更に合わせて `orgAuthorize` 関数のサポートも廃止しました。もし、組み込みの OAuth 機能を利用されていない場合は、代わりに `authorize` だけを単一のワークスペースへのインストールでも OrG レベルでのインストールでも使うように変更することを推奨します。マイグレーションの手順については、以下のコード例を参考にしてください。

これまで:

```javascript
const app = new App({ authorize: authorizeFn, orgAuthorize: orgAuthorizeFn, signingSecret: process.env.SLACK_SIGNING_SECRET });
const authorizeFn = async ({ teamId, enterpriseId}) => { 
  // Use teamId to fetch installation details from database
}
const orgAuthorizeFn = async ({ teamId, enterpriseId }) => { 
  // Use enterpriseId to fetch installation details from database
}
```

これから:
```javascript
const app = new App({ authorize: authorizeFn, signingSecret: process.env.SLACK_SIGNING_SECRET });
const authorizeFn = async ({ teamId, enterpriseId, isEnterpriseInstall}) => { 
  // if isEnterpriseInstall is true, use enterpriseId to fetch installation details from database
  // else, use teamId to fetch installation details from database
}
```

### デフォルトのレシーバーを HTTPReceiver に変更

3.x から新しい [`HTTPReceiver`](https://github.com/slackapi/bolt-js/issues/670) というレシーバーを導入し、デフォルトのレシーバー実装を、これまでの `ExpressReceiver` からこのレシーバーに変更します。この変更は、Bolt for JavaScript を Express.js 以外の人気のある Web フレームワーク（Hapi.js や Koa など）とともに動作させることを容易にします。`ExpressReceiver` は引き続き Bolt for JavaScript のリリースに含まれます。また、`HTTPReceiver` は `ExpressReceiver` が提供する全ての機能を提供するわけではありません。例えば、一つのユースケースとしては、`HTTPReceiver` ではカスタムの HTTP ルート（例: ヘルスチェックのための URL を追加する）を追加する機能はサポートされていません。このようなユースケースに対応するためには、引き続き `ExpressReceiver` を利用することを推奨します。その場合はクラスを import して、インスタンス化したものを `App` のコンストラクタに渡してください。詳細は[カスタム HTTP ルートの追加](https://slack.dev/bolt-js/ja-jp/concepts#custom-routes)を参考にしてください。

### Bolt 2.x のサポートスケジュール

`@slack/bolt@2.x` は **2021 年 1 月 12 日** より非推奨となります。それまでの期間はケースバイケースでバグ修正や新機能のバックポートを対応を継続します。`@slack/bolt@2.x` が非推奨となった後は、End of life（正式サポートの終了日）まで **クリティカルなバグ修正のみ** を実装し、クリティカルではない issue や pull request はクローズします。End of life は **2021 年 5 月 31 日** の予定です。この日からは `@slack/bolt@2.x` の開発は完全に終了となり、残っている open issue や pull request もクローズされます。

### Node の最低必須バージョン

`@slack/bolt@3.x` は Node は `12.13.0` 以上、npm は `6.12.0` 以上が必須バージョンです。

### TypeScript の最低必須バージョン

[TypeScript 利用ガイド]({{ site.url | append: site.baseurl }}/ja-jp/tutorial/using-typescript) でも説明していますが、`@slack/bolt@3.x` は TypeScirpt 4.1 以上が必須バージョンです。
