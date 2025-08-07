[@slack/bolt](../../../../index.md) / [webApi](../index.md) / OAuthV2ExchangeArguments

# Interface: OAuthV2ExchangeArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/oauth.d.ts:8

## Extends

- `Pick`\<`OAuthCredentials`, `"client_id"` \| `"client_secret"`\>

## Properties

### client\_id

```ts
client_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:110

#### Description

Issued when you created your application.

#### Inherited from

[`OpenIDConnectTokenArguments`](OpenIDConnectTokenArguments.md).[`client_id`](OpenIDConnectTokenArguments.md#client_id)

***

### client\_secret

```ts
client_secret: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:112

#### Description

Issued when you created your application.

#### Inherited from

[`OpenIDConnectTokenArguments`](OpenIDConnectTokenArguments.md).[`client_secret`](OpenIDConnectTokenArguments.md#client_secret)

***

### token

```ts
token: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/oauth.d.ts:10

#### Description

The legacy xoxb or xoxp token being migrated.
