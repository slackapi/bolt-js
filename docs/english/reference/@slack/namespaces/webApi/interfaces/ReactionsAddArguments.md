[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ReactionsAddArguments

# Interface: ReactionsAddArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/reactions.d.ts:11

## Extends

- `MessageArgument`.`TokenOverridable`.`ReactionName`

## Properties

### channel

```ts
channel: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:92

#### Description

Channel where the message was posted.

#### Inherited from

```ts
MessageArgument.channel
```

***

### name

```ts
name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/reactions.d.ts:9

#### Description

Reaction (emoji) name.

#### Inherited from

```ts
ReactionName.name
```

***

### timestamp

```ts
timestamp: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:94

#### Description

Timestamp of the message.

#### Inherited from

```ts
MessageArgument.timestamp
```

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
