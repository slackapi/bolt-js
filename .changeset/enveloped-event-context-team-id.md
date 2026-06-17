---
"@slack/bolt": patch
---

Add `context_team_id` and `context_enterprise_id` as optional fields on the `EnvelopedEvent` type. Slack's Events API delivers these on the envelope for Slack Connect channels and Enterprise Grid org-wide apps, where `team_id` may refer to a workspace different from the one the bot is installed in. Without the typed fields, downstream code had to reach for `@ts-expect-error` or unsafe casts to route by the correct workspace.
