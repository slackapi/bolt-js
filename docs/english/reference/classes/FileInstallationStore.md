[@slack/bolt](../index.md) / FileInstallationStore

# Class: FileInstallationStore

Defined in: node\_modules/@slack/oauth/dist/installation-stores/file-store.d.ts:8

## Implements

- [`InstallationStore`](../interfaces/InstallationStore.md)

## Constructors

### Constructor

```ts
new FileInstallationStore(__namedParameters?): FileInstallationStore;
```

Defined in: node\_modules/@slack/oauth/dist/installation-stores/file-store.d.ts:11

#### Parameters

##### \_\_namedParameters?

`FileInstallationOptions`

#### Returns

`FileInstallationStore`

## Methods

### deleteInstallation()

```ts
deleteInstallation(query, logger?): Promise<void>;
```

Defined in: node\_modules/@slack/oauth/dist/installation-stores/file-store.d.ts:14

#### Parameters

##### query

[`InstallationQuery`](../interfaces/InstallationQuery.md)\<`boolean`\>

##### logger?

[`Logger`](../interfaces/Logger.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`InstallationStore`](../interfaces/InstallationStore.md).[`deleteInstallation`](../interfaces/InstallationStore.md#deleteinstallation)

***

### fetchInstallation()

```ts
fetchInstallation(query, logger?): Promise<Installation<"v1" | "v2", boolean>>;
```

Defined in: node\_modules/@slack/oauth/dist/installation-stores/file-store.d.ts:13

#### Parameters

##### query

[`InstallationQuery`](../interfaces/InstallationQuery.md)\<`boolean`\>

##### logger?

[`Logger`](../interfaces/Logger.md)

#### Returns

`Promise`\<[`Installation`](../interfaces/Installation.md)\<`"v1"` \| `"v2"`, `boolean`\>\>

#### Implementation of

[`InstallationStore`](../interfaces/InstallationStore.md).[`fetchInstallation`](../interfaces/InstallationStore.md#fetchinstallation)

***

### storeInstallation()

```ts
storeInstallation(installation, logger?): Promise<void>;
```

Defined in: node\_modules/@slack/oauth/dist/installation-stores/file-store.d.ts:12

#### Parameters

##### installation

[`Installation`](../interfaces/Installation.md)

##### logger?

[`Logger`](../interfaces/Logger.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`InstallationStore`](../interfaces/InstallationStore.md).[`storeInstallation`](../interfaces/InstallationStore.md#storeinstallation)
