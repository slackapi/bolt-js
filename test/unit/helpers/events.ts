import type { GenericMessageEvent } from '@slack/types';
import type { BaseSlackEvent, EnvelopedEvent, ReceiverEvent, SlackEventMiddlewareArgs } from '../../../src/types';

export function createDummyMessageEvent(isEnterprise?: boolean): SlackEventMiddlewareArgs<'message'> {
  const payload: GenericMessageEvent = {
    type: 'message',
    subtype: undefined,
    event_ts: '1234.56',
    channel: 'C1234',
    channel_type: 'channel',
    user: 'U1234',
    ts: '1234.56',
  };
  return {
    payload,
    event: payload,
    message: payload,
    body: envelopeEvent(payload, isEnterprise),
    say: (_msg) => Promise.resolve({ ok: true }),
  };
}

/*
export function createDummyAppMentionEvent(): SlackEventMiddlewareArgs<'app_mention'> { }
export function createDummyTokensRevokedEvent(): SlackEventMiddlewareArgs<'tokens_revoked'> { }
export function createDummyAppUninstalledEvent(): SlackEventMiddlewareArgs<'app_uninstalled'> { }
export function createDummyViewSubmissionEvent(): SlackEventMiddlewareArgs<'view_submission'> { }
export function createDummyAppHomeOpenedEvent(): SlackEventMiddlewareArgs<'app_home_opened'> { }
*/

function envelopeEvent<SlackEvent extends BaseSlackEvent>(
  evt: SlackEvent,
  isEnterprise?: boolean,
): EnvelopedEvent<SlackEvent> {
  const obj: EnvelopedEvent<SlackEvent> = {
    token: 'xoxb-1234',
    team_id: 'T1234',
    api_app_id: 'A1234',
    event: evt,
    type: 'event_callback',
    event_id: '1234',
    event_time: 1234,
  };
  if (isEnterprise) {
    obj.enterprise_id = 'E1234';
  }
  return obj;
}
// Dummies (values that have no real behavior but pass through the system opaquely)
export function createDummyReceiverEvent(type = 'dummy_event_type'): ReceiverEvent {
  // NOTE: this is a degenerate ReceiverEvent that would successfully pass through the App. it happens to look like a
  // IncomingEventType.Event
  return {
    body: {
      event: {
        type,
      },
    },
    ack: () => Promise.resolve(),
  };
}
