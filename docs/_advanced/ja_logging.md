---
title: ログの表示
lang: ja-jp
slug: logging
order: 7
---

<div class="section-content">
Bolt はデフォルトの設定では、標準出力のコンソールにログ上を出力します。どれくらいのどれくらいのログが出力されるかは、コンストラクターの引数の `logLevel` を指定して、カスタマイズできます。使用可能なログレベルは、頻度の高い方から順に、`DEBUG`、`INFO`、`WARN`、`ERROR` です。
</div>

```javascript
// パッケージから LogLevel をインポート
const { App, LogLevel } = require('@slack/bolt');

// オプションとして、コンストラクタで Log level を設定可能
const app = new App({
  token,
  signingSecret,
  logLevel: LogLevel.DEBUG,
});
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">コンソール以外へのログ出力の送信</h4>
</summary>

<div class="secondary-content" markdown="0">
ログの送信先をコンソール以外に設定したり、よりロガーを細かくコントロールしたい場合は、カスタムロガーを実装します。カスタムロガーは、以下のメソッド (`Logger` インターフェイスに定義されているもの) を実装する必要があります。

| メソッド      | パラメーター        | 戻り値の型    |
|--------------|-------------------|-------------|
| `setLevel()` | `level: LogLevel` | `void`      |
| `getLevel()` | なし               | `string` (値は `error`, `warn`, `info`, `debug` のいずれか)  |
| `setName()`  | `name: string`    | `void`      |
| `debug()`    | `...msgs: any[]`  | `void`      |
| `info()`     | `...msgs: any[]`  | `void`      |
| `warn()`     | `...msgs: any[]`  | `void`      |
| `error()`    | `...msgs: any[]`  | `void`      |

非常に単純なカスタム logger では、名前やレベルが無視され、すべてのメッセージがファイルに書き込まれることがあります。
</div>

```javascript
const { App } = require('@slack/bolt');
const { createWriteStream } = require('fs');
const logWritable = createWriteStream('/var/my_log_file');

const app = new App({
  token,
  signingSecret,
  // リテラルオブジェクトとして logger を設定（必要なメソッドを持つクラスを指定するイメージで）
  logger: {
    debug(...msgs): { logWritable.write('debug: ' + JSON.stringify(msgs)); },
    info(...msgs): { logWritable.write('info: ' + JSON.stringify(msgs)); },
    warn(...msgs): { logWritable.write('warn: ' + JSON.stringify(msgs)); },
    error(...msgs): { logWritable.write('error: ' + JSON.stringify(msgs)); },
    setLevel(): { },
    setName(): { },
  },
});
```

</details>