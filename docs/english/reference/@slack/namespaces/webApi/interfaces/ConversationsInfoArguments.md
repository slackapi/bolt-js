[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsInfoArguments

# Interface: ConversationsInfoArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:68

## Extends

- `Channel`.`TokenOverridable`.`LocaleAware`

## Properties

### channel

```ts
channel: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:5

#### Description

ID of conversation.

#### Inherited from

```ts
Channel.channel
```

***

### include\_locale?

```ts
optional include_locale: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:44

#### Description

Set this to `true` to receive the locale with the response.

#### Inherited from

```ts
LocaleAware.include_locale
```

***

### include\_num\_members?

```ts
optional include_num_members: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:72

#### Description

Set to `true` to include the member count for the specified conversation. Defaults to `false`.

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
