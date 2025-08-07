[@slack/bolt](../index.md) / InstallationQuery

# Interface: InstallationQuery\<isEnterpriseInstall\>

Defined in: node\_modules/@slack/oauth/dist/installation-query.d.ts:1

## Type Parameters

### isEnterpriseInstall

`isEnterpriseInstall` *extends* `boolean`

## Properties

### conversationId?

```ts
optional conversationId: string;
```

Defined in: node\_modules/@slack/oauth/dist/installation-query.d.ts:5

***

### enterpriseId

```ts
enterpriseId: isEnterpriseInstall extends true ? string : undefined | string;
```

Defined in: node\_modules/@slack/oauth/dist/installation-query.d.ts:3

***

### isEnterpriseInstall

```ts
isEnterpriseInstall: isEnterpriseInstall;
```

Defined in: node\_modules/@slack/oauth/dist/installation-query.d.ts:1

***

### teamId

```ts
teamId: isEnterpriseInstall extends false ? string : undefined;
```

Defined in: node\_modules/@slack/oauth/dist/installation-query.d.ts:2

***

### userId?

```ts
optional userId: string;
```

Defined in: node\_modules/@slack/oauth/dist/installation-query.d.ts:4
