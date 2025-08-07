[@slack/bolt](../../../../index.md) / [webApi](../index.md) / PageAccumulator

# Type Alias: PageAccumulator\<R\>

```ts
type PageAccumulator<R> = R extends (accumulator, page, index) => infer A ? A : never;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:76

## Type Parameters

### R

`R` *extends* [`PageReducer`](PageReducer.md)
