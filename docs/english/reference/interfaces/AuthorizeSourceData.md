[@slack/bolt](../index.md) / AuthorizeSourceData

# Interface: AuthorizeSourceData\<IsEnterpriseInstall\>

Defined in: [src/App.ts:157](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L157)

Authorization function inputs - authenticated data about an event for the authorization function

## Type Parameters

### IsEnterpriseInstall

`IsEnterpriseInstall` *extends* `boolean` = `false`

## Properties

### conversationId?

```ts
optional conversationId: string;
```

Defined in: [src/App.ts:161](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L161)

***

### enterpriseId

```ts
enterpriseId: IsEnterpriseInstall extends true ? string : undefined | string;
```

Defined in: [src/App.ts:159](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L159)

***

### isEnterpriseInstall

```ts
isEnterpriseInstall: IsEnterpriseInstall;
```

Defined in: [src/App.ts:162](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L162)

***

### teamId

```ts
teamId: IsEnterpriseInstall extends true ? undefined | string : string;
```

Defined in: [src/App.ts:158](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L158)

***

### userId?

```ts
optional userId: string;
```

Defined in: [src/App.ts:160](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L160)
