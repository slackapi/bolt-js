[@slack/bolt](../index.md) / InstallationStore

# Interface: InstallationStore

Defined in: node\_modules/@slack/oauth/dist/installation-stores/interface.d.ts:3

## Properties

### deleteInstallation()?

```ts
optional deleteInstallation: (query, logger?) => Promise<void>;
```

Defined in: node\_modules/@slack/oauth/dist/installation-stores/interface.d.ts:6

#### Parameters

##### query

[`InstallationQuery`](InstallationQuery.md)\<`boolean`\>

##### logger?

[`Logger`](Logger.md)

#### Returns

`Promise`\<`void`\>

***

### fetchInstallation()

```ts
fetchInstallation: (query, logger?) => Promise<Installation<"v1" | "v2", boolean>>;
```

Defined in: node\_modules/@slack/oauth/dist/installation-stores/interface.d.ts:5

#### Parameters

##### query

[`InstallationQuery`](InstallationQuery.md)\<`boolean`\>

##### logger?

[`Logger`](Logger.md)

#### Returns

`Promise`\<[`Installation`](Installation.md)\<`"v1"` \| `"v2"`, `boolean`\>\>

## Methods

### storeInstallation()

```ts
storeInstallation<AuthVersion>(installation, logger?): Promise<void>;
```

Defined in: node\_modules/@slack/oauth/dist/installation-stores/interface.d.ts:4

#### Type Parameters

##### AuthVersion

`AuthVersion` *extends* `"v1"` \| `"v2"`

#### Parameters

##### installation

[`Installation`](Installation.md)\<`AuthVersion`, `boolean`\>

##### logger?

[`Logger`](Logger.md)

#### Returns

`Promise`\<`void`\>
