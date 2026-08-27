# AuthorizeSourceData\<IsEnterpriseInstall\>

Defined in: [src/App.ts:169](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L169)

Authorization function inputs - authenticated data about an event for the authorization function

## Type Parameters

### IsEnterpriseInstall

`IsEnterpriseInstall` *extends* `boolean` = `false`

## Properties

### conversationId?

```ts
optional conversationId?: string;
```

Defined in: [src/App.ts:173](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L173)

***

### enterpriseId

```ts
enterpriseId: IsEnterpriseInstall extends true ? string : string | undefined;
```

Defined in: [src/App.ts:171](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L171)

***

### isEnterpriseInstall

```ts
isEnterpriseInstall: IsEnterpriseInstall;
```

Defined in: [src/App.ts:174](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L174)

***

### teamId

```ts
teamId: IsEnterpriseInstall extends true ? string | undefined : string;
```

Defined in: [src/App.ts:170](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L170)

***

### userId?

```ts
optional userId?: string;
```

Defined in: [src/App.ts:172](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L172)
