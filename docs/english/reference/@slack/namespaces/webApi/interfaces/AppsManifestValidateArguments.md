[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AppsManifestValidateArguments

# Interface: AppsManifestValidateArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/apps.d.ts:18

## Extends

- `Partial`\<`AppID`\>.`TokenOverridable`

## Properties

### app\_id?

```ts
optional app_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:84

#### Description

The ID of the app.

#### Inherited from

[`AppsManifestDeleteArguments`](AppsManifestDeleteArguments.md).[`app_id`](AppsManifestDeleteArguments.md#app_id)

***

### manifest

```ts
manifest: Manifest;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/apps.d.ts:19

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
