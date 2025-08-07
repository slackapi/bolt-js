[@slack/bolt](../index.md) / ViewOutput

# Interface: ViewOutput

Defined in: [src/types/view/index.ts:290](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L290)

## Properties

### app\_id

```ts
app_id: null | string;
```

Defined in: [src/types/view/index.ts:295](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L295)

***

### app\_installed\_team\_id?

```ts
optional app_installed_team_id: string;
```

Defined in: [src/types/view/index.ts:294](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L294)

***

### blocks

```ts
blocks: (
  | Block
  | KnownBlock)[];
```

Defined in: [src/types/view/index.ts:299](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L299)

***

### bot\_id

```ts
bot_id: string;
```

Defined in: [src/types/view/index.ts:296](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L296)

***

### callback\_id

```ts
callback_id: string;
```

Defined in: [src/types/view/index.ts:292](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L292)

***

### clear\_on\_close

```ts
clear_on_close: boolean;
```

Defined in: [src/types/view/index.ts:313](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L313)

***

### close

```ts
close: null | PlainTextElementOutput;
```

Defined in: [src/types/view/index.ts:300](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L300)

***

### external\_id?

```ts
optional external_id: string;
```

Defined in: [src/types/view/index.ts:315](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L315)

***

### hash

```ts
hash: string;
```

Defined in: [src/types/view/index.ts:309](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L309)

***

### id

```ts
id: string;
```

Defined in: [src/types/view/index.ts:291](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L291)

***

### notify\_on\_close

```ts
notify_on_close: boolean;
```

Defined in: [src/types/view/index.ts:314](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L314)

***

### previous\_view\_id

```ts
previous_view_id: null | string;
```

Defined in: [src/types/view/index.ts:312](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L312)

***

### private\_metadata

```ts
private_metadata: string;
```

Defined in: [src/types/view/index.ts:310](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L310)

***

### root\_view\_id

```ts
root_view_id: null | string;
```

Defined in: [src/types/view/index.ts:311](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L311)

***

### state

```ts
state: object;
```

Defined in: [src/types/view/index.ts:302](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L302)

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
submit: null | PlainTextElementOutput;
```

Defined in: [src/types/view/index.ts:301](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L301)

***

### team\_id

```ts
team_id: string;
```

Defined in: [src/types/view/index.ts:293](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L293)

***

### title

```ts
title: PlainTextElementOutput;
```

Defined in: [src/types/view/index.ts:297](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L297)

***

### type

```ts
type: string;
```

Defined in: [src/types/view/index.ts:298](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L298)
