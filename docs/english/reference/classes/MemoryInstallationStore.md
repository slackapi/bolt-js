[@slack/bolt](../index.md) / MemoryInstallationStore

# Class: MemoryInstallationStore

Defined in: node\_modules/@slack/oauth/dist/installation-stores/memory-store.d.ts:6

## Implements

- [`InstallationStore`](../interfaces/InstallationStore.md)

## Constructors

### Constructor

```ts
new MemoryInstallationStore(): MemoryInstallationStore;
```

#### Returns

`MemoryInstallationStore`

## Properties

### devDB

```ts
devDB: DevDatabase;
```

Defined in: node\_modules/@slack/oauth/dist/installation-stores/memory-store.d.ts:7

## Methods

### deleteInstallation()

```ts
deleteInstallation(query, logger?): Promise<void>;
```

Defined in: node\_modules/@slack/oauth/dist/installation-stores/memory-store.d.ts:10

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

Defined in: node\_modules/@slack/oauth/dist/installation-stores/memory-store.d.ts:9

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

Defined in: node\_modules/@slack/oauth/dist/installation-stores/memory-store.d.ts:8

#### Parameters

##### installation

[`Installation`](../interfaces/Installation.md)

##### logger?

[`Logger`](../interfaces/Logger.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`InstallationStore`](../interfaces/InstallationStore.md).[`storeInstallation`](../interfaces/InstallationStore.md#storeinstallation)
