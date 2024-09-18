import type { AppMentionEvent, MessageEvent } from '@slack/types';
import type {
  AckFn,
  BaseSlackEvent,
  BlockAction,
  BlockElementAction,
  EnvelopedEvent,
  GlobalShortcut,
  MessageShortcut,
  ReceiverEvent,
  RespondFn,
  SayFn,
  SlackActionMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackShortcutMiddlewareArgs,
  SlackViewMiddlewareArgs,
  ViewSubmitAction,
  ViewOutput,
} from '../../../src/types';

const ts = '1234.56';
const user = 'U1234';
const team = 'T1234';
const channel = 'C1234';
const token = 'xoxb-1234';
const app_id = 'A1234';
const say: SayFn = (_msg) => Promise.resolve({ ok: true });
const respond: RespondFn = (_msg) => Promise.resolve();
const ack: AckFn<void> = (_r?) => Promise.resolve();

export function createDummyMessageEventMiddlewareArgs(
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
  event?: MessageEvent,
): SlackEventMiddlewareArgs<'message'> {
  const payload: MessageEvent = event || {
    type: 'message',
    subtype: undefined,
    event_ts: ts,
    channel,
    channel_type: 'channel',
    user,
    ts,
  };
  return {
    payload,
    event: payload,
    message: payload,
    body: envelopeEvent(payload, bodyOverrides),
    say,
  };
}

export function createDummyAppMentionEventMiddlewareArgs(
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
  event?: AppMentionEvent,
): SlackEventMiddlewareArgs<'app_mention'> {
  const payload: AppMentionEvent = event || {
    type: 'app_mention',
    text: 'hi',
    channel,
    ts,
    event_ts: ts,
  };
  return {
    payload,
    event: payload,
    message: undefined,
    body: envelopeEvent(payload, bodyOverrides),
    say,
  };
}

export function createDummyBlockActionEventMiddlewareArgs(
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
  action?: BlockElementAction,
): SlackActionMiddlewareArgs<BlockAction> {
  const act: BlockElementAction = action || {
    type: 'button',
    action_id: 'mybutton',
    block_id: 'bid',
    action_ts: ts,
    text: { type: 'plain_text', text: 'hi' },
  };
  const payload: BlockAction = {
    type: 'block_actions',
    actions: [act],
    team: { id: team, domain: 'slack.com' },
    user: { id: user, username: 'filmaj' },
    token,
    response_url: 'https://slack.com',
    trigger_id: ts,
    api_app_id: app_id,
    container: {},
    ...bodyOverrides,
  };
  return {
    payload: act,
    action: act,
    body: payload,
    respond,
    say,
    ack,
  };
}

export function createDummyViewSubmissionMiddlewareArgs(
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
  viewOverrides?: Partial<ViewOutput>,
  viewEvent?: ViewSubmitAction,
): SlackViewMiddlewareArgs<ViewSubmitAction> {
  const payload: ViewOutput = {
    type: 'view',
    id: 'V1234',
    callback_id: 'Cb1234',
    team_id: team,
    app_id,
    bot_id: 'B1234',
    title: { type: 'plain_text', text: 'hi' },
    blocks: [],
    close: null,
    submit: null,
    hash: ts,
    state: { values: {} },
    private_metadata: '',
    root_view_id: null,
    previous_view_id: null,
    clear_on_close: false,
    notify_on_close: false,
    ...viewOverrides,
  };
  const event: ViewSubmitAction = {
    ...(viewEvent || {
      type: 'view_submission',
      team: { id: team, domain: 'slack.com' },
      user: { id: user, name: 'filmaj' },
    }),
    view: payload,
    api_app_id: app_id,
    token,
    trigger_id: ts,
    ...bodyOverrides,
  };
  return {
    payload,
    view: payload,
    body: event,
    respond,
    ack: () => Promise.resolve(),
  };
}

export function createDummyMessageShortcutMiddlewareArgs(
  shortcut?: MessageShortcut,
): SlackShortcutMiddlewareArgs<MessageShortcut> {
  const payload: MessageShortcut = shortcut || {
    type: 'message_action',
    callback_id: 'Cb1234',
    trigger_id: ts,
    message_ts: ts,
    response_url: 'https://slack.com',
    message: {
      type: 'message',
      ts,
    },
    user: { id: user, name: 'filmaj' },
    channel: { id: channel, name: '#random' },
    team: { id: team, domain: 'slack.com' },
    token,
    action_ts: ts,
  };
  return {
    payload,
    shortcut: payload,
    body: payload,
    respond,
    ack: () => Promise.resolve(),
    say,
  };
}

export function createDummyGlobalShortcutMiddlewareArgs(
  shortcut?: GlobalShortcut,
): SlackShortcutMiddlewareArgs<GlobalShortcut> {
  const payload: GlobalShortcut = shortcut || {
    type: 'shortcut',
    callback_id: 'Cb1234',
    trigger_id: ts,
    user: { id: user, username: 'filmaj', team_id: team },
    team: { id: team, domain: 'slack.com' },
    token,
    action_ts: ts,
  };
  return {
    payload,
    shortcut: payload,
    body: payload,
    respond,
    ack: () => Promise.resolve(),
    say: undefined,
  };
}

function envelopeEvent<SlackEvent extends BaseSlackEvent>(
  evt: SlackEvent,
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  overrides?: Record<string, any>,
): EnvelopedEvent<SlackEvent> {
  const obj: EnvelopedEvent<SlackEvent> = {
    token: 'xoxb-1234',
    team_id: 'T1234',
    api_app_id: 'A1234',
    event: evt,
    type: 'event_callback',
    event_id: '1234',
    event_time: 1234,
    ...overrides,
  };
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
