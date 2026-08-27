---
sidebar_label: "ViewOutput"
---

[@slack/bolt](../index.md) / ViewOutput

# Interface: ViewOutput

Defined in: [src/types/view/index.ts:254](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L254)

## Properties

### app\_id

```ts
app_id: string | null;
```

Defined in: [src/types/view/index.ts:259](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L259)

***

### app\_installed\_team\_id?

```ts
optional app_installed_team_id?: string;
```

Defined in: [src/types/view/index.ts:258](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L258)

***

### app\_unfurl\_url?

```ts
optional app_unfurl_url?: string;
```

Defined in: [src/types/view/index.ts:282](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L282)

***

### blocks

```ts
blocks: (Block | KnownBlock)[];
```

Defined in: [src/types/view/index.ts:263](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L263)

***

### bot\_id

```ts
bot_id: string;
```

Defined in: [src/types/view/index.ts:260](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L260)

***

### callback\_id

```ts
callback_id: string;
```

Defined in: [src/types/view/index.ts:256](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L256)

***

### channel?

```ts
optional channel?: string;
```

Defined in: [src/types/view/index.ts:285](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L285)

***

### clear\_on\_close

```ts
clear_on_close: boolean;
```

Defined in: [src/types/view/index.ts:277](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L277)

***

### close

```ts
close: PlainTextElementOutput | null;
```

Defined in: [src/types/view/index.ts:264](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L264)

***

### entity\_url?

```ts
optional entity_url?: string;
```

Defined in: [src/types/view/index.ts:280](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L280)

***

### external\_id?

```ts
optional external_id?: string;
```

Defined in: [src/types/view/index.ts:279](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L279)

***

### external\_ref?

```ts
optional external_ref?: object;
```

Defined in: [src/types/view/index.ts:281](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L281)

#### id

```ts
id: string;
```

#### type?

```ts
optional type?: string;
```

***

### hash

```ts
hash: string;
```

Defined in: [src/types/view/index.ts:273](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L273)

***

### id

```ts
id: string;
```

Defined in: [src/types/view/index.ts:255](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L255)

***

### message\_ts?

```ts
optional message_ts?: string;
```

Defined in: [src/types/view/index.ts:283](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L283)

***

### notify\_on\_close

```ts
notify_on_close: boolean;
```

Defined in: [src/types/view/index.ts:278](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L278)

***

### previous\_view\_id

```ts
previous_view_id: string | null;
```

Defined in: [src/types/view/index.ts:276](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L276)

***

### private\_metadata

```ts
private_metadata: string;
```

Defined in: [src/types/view/index.ts:274](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L274)

***

### root\_view\_id

```ts
root_view_id: string | null;
```

Defined in: [src/types/view/index.ts:275](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L275)

***

### state

```ts
state: object;
```

Defined in: [src/types/view/index.ts:266](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L266)

#### values

```ts
values: object;
```

##### Index Signature

```ts
[blockId: string]: object
```

***

### submit

```ts
submit: PlainTextElementOutput | null;
```

Defined in: [src/types/view/index.ts:265](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L265)

***

### team\_id

```ts
team_id: string;
```

Defined in: [src/types/view/index.ts:257](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L257)

***

### thread\_ts?

```ts
optional thread_ts?: string;
```

Defined in: [src/types/view/index.ts:284](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L284)

***

### title

```ts
title: PlainTextElementOutput;
```

Defined in: [src/types/view/index.ts:261](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L261)

***

### type

```ts
type: string;
```

Defined in: [src/types/view/index.ts:262](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L262)
