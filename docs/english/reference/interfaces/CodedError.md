---
sidebar_label: "CodedError"
---

[@slack/bolt](../index.md) / CodedError

# Interface: CodedError

Defined in: [src/errors.ts:4](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L4)

## Extends

- `Error`

## Properties

### code

```ts
code: string;
```

Defined in: [src/errors.ts:5](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L5)

***

### missingProperty?

```ts
optional missingProperty?: string;
```

Defined in: [src/errors.ts:8](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L8)

***

### original?

```ts
optional original?: Error;
```

Defined in: [src/errors.ts:6](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L6)

***

### originals?

```ts
optional originals?: Error[];
```

Defined in: [src/errors.ts:7](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L7)

***

### req?

```ts
optional req?: 
  | IncomingMessage
  | BufferedIncomingMessage;
```

Defined in: [src/errors.ts:9](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L9)

***

### res?

```ts
optional res?: ServerResponse<IncomingMessage>;
```

Defined in: [src/errors.ts:10](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L10)
