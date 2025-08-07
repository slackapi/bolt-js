[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AppsManifestUpdateArguments

# Interface: AppsManifestUpdateArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/apps.d.ts:15

## Extends

- `AppID`.`TokenOverridable`

## Properties

### app\_id

```ts
app_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:84

#### Description

The ID of the app.

#### Inherited from

```ts
AppID.app_id
```

***

### manifest

```ts
manifest: Manifest;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/apps.d.ts:16

***

### token?

```ts
optional token: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:37

#### Description

Overridable authentication token bearing required scopes.

#### Inherited from

```ts
TokenOverridable.token
```
