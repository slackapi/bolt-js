[@slack/bolt](../../../../index.md) / [webApi](../index.md) / PinsRemoveArguments

# Interface: PinsRemoveArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/pins.d.ts:8

## Extends

- `MessageArgument`.`TokenOverridable`

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
