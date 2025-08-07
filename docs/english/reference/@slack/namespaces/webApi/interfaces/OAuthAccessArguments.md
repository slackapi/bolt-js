[@slack/bolt](../../../../index.md) / [webApi](../index.md) / OAuthAccessArguments

# Interface: OAuthAccessArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/oauth.d.ts:2

## Extends

- `OAuthCredentials`

## Properties

### client\_id

```ts
client_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:110

#### Description

Issued when you created your application.

#### Inherited from

```ts
OAuthCredentials.client_id
```

***

### client\_secret

```ts
client_secret: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:112

#### Description

Issued when you created your application.

#### Inherited from

```ts
OAuthCredentials.client_secret
```

***

### code?

```ts
optional code: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:114

#### Description

The `code` parameter returned via the OAuth callback.

#### Inherited from

```ts
OAuthCredentials.code
```

***

### redirect\_uri?

```ts
optional redirect_uri: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:119

#### Description

While optional, it is _required_ if your app passed it as a parameter to the OpenID/OAuth flow's
first step and must match the originally submitted URI.

#### Inherited from

```ts
OAuthCredentials.redirect_uri
```

***

### single\_channel?

```ts
optional single_channel: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/oauth.d.ts:4

#### Description

Request the user to add your app only to a single channel. Only valid with a [legacy workspace app](https://api.slack.com/legacy-workspace-apps). Defaults to `false`.
