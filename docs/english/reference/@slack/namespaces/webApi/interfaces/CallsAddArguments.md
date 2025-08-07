[@slack/bolt](../../../../index.md) / [webApi](../index.md) / CallsAddArguments

# Interface: CallsAddArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:25

## Extends

- `Partial`\<`Users`\>.`CallDetails`.`TokenOverridable`

## Properties

### created\_by?

```ts
optional created_by: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:34

#### Description

ID of the user who created this Call. When this method is called with a user token,
this field is optional and defaults to the authed user of the token. Otherwise, the field is required.

***

### date\_start?

```ts
optional date_start: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:36

#### Description

Unix timestamp of the call start time.

***

### desktop\_app\_join\_url?

```ts
optional desktop_app_join_url: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:21

#### Description

When supplied, available Slack clients will attempt to directly launch the 3rd-party Call
with this URL.

#### Inherited from

```ts
CallDetails.desktop_app_join_url
```

***

### external\_display\_id?

```ts
optional external_display_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:41

#### Description

An optional, human-readable ID supplied by the 3rd-party Call provider.
If supplied, this ID will be displayed in the Call object.

***

### external\_unique\_id

```ts
external_unique_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:29

#### Description

An ID supplied by the 3rd-party Call provider. It must be unique across all Calls from that service.

***

### join\_url

```ts
join_url: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:16

#### Description

The URL required for a client to join the Call.

#### Inherited from

```ts
CallDetails.join_url
```

***

### title?

```ts
optional title: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:23

#### Description

The name of the Call.

#### Inherited from

```ts
CallDetails.title
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

***

### users?

```ts
optional users: CallUser[];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:12

#### Description

The list of users to add/remove to/from the Call.

#### See

[Using the Calls API: a note on Users](https://api.slack.com/apis/calls#users).

#### Inherited from

[`CallsParticipantsAddArguments`](CallsParticipantsAddArguments.md).[`users`](CallsParticipantsAddArguments.md#users)
