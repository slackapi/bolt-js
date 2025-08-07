[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminAnalyticsGetFileResponse

# Type Alias: AdminAnalyticsGetFileResponse

```ts
type AdminAnalyticsGetFileResponse = WebAPICallResult & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/response/AdminAnalyticsGetFileResponse.d.ts:2

## Type declaration

### error?

```ts
optional error: string;
```

### file\_data?

```ts
optional file_data: (
  | AdminAnalyticsMemberDetails
  | AdminAnalyticsPublicChannelDetails
  | AdminAnalyticsPublicChannelMetadataDetails)[];
```

### needed?

```ts
optional needed: string;
```

### ok?

```ts
optional ok: boolean;
```

### provided?

```ts
optional provided: string;
```

### response\_metadata?

```ts
optional response_metadata: ResponseMetadata;
```
