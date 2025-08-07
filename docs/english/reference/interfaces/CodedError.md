[@slack/bolt](../index.md) / CodedError

# Interface: CodedError

Defined in: [src/errors.ts:4](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L4)

## Extends

- `Error`

## Properties

### cause?

```ts
optional cause: unknown;
```

Defined in: node\_modules/typescript/lib/lib.es2022.error.d.ts:24

#### Inherited from

```ts
Error.cause
```

***

### code

```ts
code: string;
```

Defined in: [src/errors.ts:5](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L5)

***

### message

```ts
message: string;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

```ts
Error.message
```

***

### missingProperty?

```ts
optional missingProperty: string;
```

Defined in: [src/errors.ts:8](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L8)

***

### name

```ts
name: string;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1075

#### Inherited from

```ts
Error.name
```

***

### original?

```ts
optional original: Error;
```

Defined in: [src/errors.ts:6](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L6)

***

### originals?

```ts
optional originals: Error[];
```

Defined in: [src/errors.ts:7](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L7)

***

### req?

```ts
optional req: 
  | IncomingMessage
  | BufferedIncomingMessage;
```

Defined in: [src/errors.ts:9](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L9)

***

### res?

```ts
optional res: ServerResponse<IncomingMessage>;
```

Defined in: [src/errors.ts:10](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L10)

***

### stack?

```ts
optional stack: string;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

```ts
Error.stack
```
