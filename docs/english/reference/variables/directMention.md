[@slack/bolt](../index.md) / directMention

# Variable: directMention

```ts
const directMention: Middleware<SlackEventMiddlewareArgs<"message">>;
```

Defined in: [src/middleware/builtin.ts:359](https://github.com/slackapi/bolt-js/blob/main/src/middleware/builtin.ts#L359)

Filters out any message event whose text does not start with an @-mention of the handling app.
