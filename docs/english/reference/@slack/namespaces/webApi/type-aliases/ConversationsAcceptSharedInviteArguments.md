[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsAcceptSharedInviteArguments

# Type Alias: ConversationsAcceptSharedInviteArguments

```ts
type ConversationsAcceptSharedInviteArguments = TokenOverridable & OptionalTeamAssignable & ChannelID | InviteID & IsPrivate & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:41

## Type declaration

### channel\_name

```ts
channel_name: string;
```

#### Description

Name of the channel. If the channel does not exist already in your workspace,
this name is the one that the channel will take.

### free\_trial\_accepted?

```ts
optional free_trial_accepted: boolean;
```

#### Description

Whether you'd like to use your workspace's free trial to begin using Slack Connect.
