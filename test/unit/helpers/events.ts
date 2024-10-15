import type {
  AppHomeOpenedEvent,
  AppMentionEvent,
  Block,
  KnownBlock,
  MessageEvent,
  ReactionAddedEvent,
} from '@slack/types';
import { WebClient } from '@slack/web-api';
import sinon, { type SinonSpy } from 'sinon';
import { createFakeLogger } from '.';
import type { SlackCustomFunctionMiddlewareArgs } from '../../../src/CustomFunction';
import type {
  AckFn,
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  BaseSlackEvent,
  BlockAction,
  BlockElementAction,
  BlockSuggestion,
  Context,
  EnvelopedEvent,
  GlobalShortcut,
  MessageShortcut,
  ReceiverEvent,
  RespondFn,
  SayFn,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackEventMiddlewareArgsOptions,
  SlackOptionsMiddlewareArgs,
  SlackShortcutMiddlewareArgs,
  SlackViewMiddlewareArgs,
  SlashCommand,
  ViewClosedAction,
  ViewOutput,
  ViewSubmitAction,
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

export function wrapMiddleware<Args extends AnyMiddlewareArgs>(
  args: Args,
  ctx?: Context,
): Args & AllMiddlewareArgs & { next: SinonSpy } {
  const wrapped = {
    ...args,
    context: ctx || { isEnterpriseInstall: false },
    logger: createFakeLogger(),
    client: new WebClient(),
    next: sinon.fake(),
  };
  return wrapped;
}

interface DummyAppHomeOpenedOverrides {
  channel?: string;
  user?: string;
}
export function createDummyAppHomeOpenedEventMiddlewareArgs(
  eventOverrides?: DummyAppHomeOpenedOverrides,
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
): SlackEventMiddlewareArgs<'app_home_opened'> {
  const event: AppHomeOpenedEvent = {
    type: 'app_home_opened',
    channel: eventOverrides?.channel || channel,
    user: eventOverrides?.user || user,
    tab: 'home',
    event_ts: ts,
  };
  return {
    payload: event,
    event,
    body: envelopeEvent(event, bodyOverrides),
    say,
  };
}

interface DummyMemberChannelOverrides<T> {
  type: T;
  channel?: string;
  user?: string;
  team?: string;
}
type MemberChannelEventTypes = 'member_joined_channel' | 'member_left_channel';
export function createDummyMemberChannelEventMiddlewareArgs(
  eventOverrides: DummyMemberChannelOverrides<MemberChannelEventTypes>,
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
): SlackEventMiddlewareArgs<MemberChannelEventTypes> {
  const event = {
    type: eventOverrides.type,
    user: eventOverrides?.user || user,
    channel: eventOverrides?.channel || channel,
    channel_type: 'channel',
    team: eventOverrides?.team || team,
    event_ts: ts,
  };
  return {
    payload: event,
    event,
    body: envelopeEvent(event, bodyOverrides),
    say,
  };
}

interface DummyReactionAddedOverrides {
  channel?: string;
  user?: string;
  reaction?: string;
}
export function createDummyReactionAddedEventMiddlewareArgs(
  eventOverrides?: DummyReactionAddedOverrides,
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
): SlackEventMiddlewareArgs<'reaction_added'> {
  const event: ReactionAddedEvent = {
    type: 'reaction_added',
    user: eventOverrides?.user || user,
    reaction: eventOverrides?.reaction || 'lol',
    item_user: 'wut',
    item: {
      type: 'message',
      channel: eventOverrides?.channel || channel,
      ts,
    },
    event_ts: ts,
  };
  return {
    payload: event,
    event,
    body: envelopeEvent(event, bodyOverrides),
    say,
  };
}

interface DummyMessageOverrides {
  message?: MessageEvent;
  text?: string;
  user?: string;
  blocks?: (KnownBlock | Block)[];
}
export function createDummyMessageEventMiddlewareArgs(
  msgOverrides?: DummyMessageOverrides,
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
): SlackEventMiddlewareArgs<'message'> {
  const payload: MessageEvent = msgOverrides?.message || {
    type: 'message',
    subtype: undefined,
    event_ts: ts,
    channel,
    channel_type: 'channel',
    user: msgOverrides?.user || user,
    ts,
    text: msgOverrides?.text || 'hi',
    blocks: msgOverrides?.blocks || [],
  };
  return {
    payload,
    event: payload,
    message: payload,
    body: envelopeEvent(payload, bodyOverrides),
    say,
  };
}

interface DummyAppMentionOverrides {
  event?: AppMentionEvent;
  text?: string;
}
export function createDummyAppMentionEventMiddlewareArgs(
  eventOverrides?: DummyAppMentionOverrides,
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
): SlackEventMiddlewareArgs<'app_mention'> {
  const payload: AppMentionEvent = eventOverrides?.event || {
    type: 'app_mention',
    text: eventOverrides?.text || 'hi',
    channel,
    ts,
    event_ts: ts,
  };
  return {
    payload,
    event: payload,
    body: envelopeEvent(payload, bodyOverrides),
    say,
  };
}

interface DummyCommandOverride {
  command?: string;
  slashCommand?: SlashCommand;
}
export function createDummyCommandMiddlewareArgs(commandOverrides?: DummyCommandOverride): SlackCommandMiddlewareArgs {
  const payload: SlashCommand = commandOverrides?.slashCommand || {
    token,
    command: commandOverrides?.command || '/slash',
    text: 'yo',
    response_url: 'https://slack.com',
    trigger_id: ts,
    user_id: user,
    user_name: 'filmaj',
    team_id: team,
    team_domain: 'slack.com',
    channel_id: channel,
    channel_name: '#random',
    api_app_id: app_id,
  };
  return {
    payload,
    command: payload,
    body: payload,
    respond,
    say,
    ack: () => Promise.resolve(),
  };
}

interface DummyBlockActionOverride {
  action_id?: string;
  block_id?: string;
  action?: BlockElementAction;
}
export function createDummyBlockActionEventMiddlewareArgs(
  actionOverrides?: DummyBlockActionOverride,
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
): SlackActionMiddlewareArgs<BlockAction> {
  const act: BlockElementAction = actionOverrides?.action || {
    type: 'button',
    action_id: actionOverrides?.action_id || 'action_id',
    block_id: actionOverrides?.block_id || 'block_id',
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

export function createDummyCustomFunctionMiddlewareArgs<
  Options extends SlackEventMiddlewareArgsOptions = { autoAcknowledge: true },
>(
  data: {
    callbackId?: string;
    inputs?: Record<string, string | number | boolean>;
    options?: Options;
  } = { callbackId: 'reverse', inputs: { stringToReverse: 'hello' }, options: { autoAcknowledge: true } as Options },
): SlackCustomFunctionMiddlewareArgs<Options> {
  data.callbackId = data.callbackId ? data.callbackId : 'reverse';
  data.inputs = data.inputs ? data.inputs : { stringToReverse: 'hello' };
  data.options = data.options ? data.options : ({ autoAcknowledge: true } as Options);
  const testFunction = {
    id: 'Fn111',
    callback_id: data.callbackId,
    title: data.callbackId,
    description: 'Takes a string and reverses it',
    type: 'app',
    input_parameters: [
      {
        type: 'string',
        name: 'stringToReverse',
        description: 'The string to reverse',
        title: 'String To Reverse',
        is_required: true,
      },
    ],
    output_parameters: [
      {
        type: 'string',
        name: 'reverseString',
        description: 'The string in reverse',
        title: 'Reverse String',
        is_required: true,
      },
    ],
    app_id: 'A111',
    date_updated: 1659054991,
    date_deleted: 0,
    date_created: 1725987754,
  };

  const event = {
    type: 'function_executed',
    function: testFunction,
    inputs: data.inputs,
    function_execution_id: 'Fx111',
    workflow_execution_id: 'Wf111',
    event_ts: '1659055013.509853',
    bot_access_token: 'xwfp-valid',
  } as const;

  const body = {
    token: 'verification_token',
    team_id: 'T111',
    api_app_id: 'A111',
    event,
    event_id: 'Ev111',
    event_time: 1659055013,
    type: 'event_callback',
  } as const;

  if (data.options.autoAcknowledge) {
    return {
      body,
      complete: () => Promise.resolve({ ok: true }),
      event,
      fail: () => Promise.resolve({ ok: true }),
      inputs: data.inputs,
      payload: event,
    } as SlackCustomFunctionMiddlewareArgs<Options>;
  }
  return {
    ack: () => Promise.resolve(),
    body,
    complete: () => Promise.resolve({ ok: true }),
    event,
    fail: () => Promise.resolve({ ok: true }),
    inputs: data.inputs,
    payload: event,
  };
}

interface DummyBlockSuggestionOverride {
  action_id?: string;
  block_id?: string;
  options?: BlockSuggestion;
}
export function createDummyBlockSuggestionsMiddlewareArgs(
  optionsOverrides?: DummyBlockSuggestionOverride,
): SlackOptionsMiddlewareArgs<BlockSuggestion['type']> {
  const options: BlockSuggestion = optionsOverrides?.options || {
    type: 'block_suggestion',
    action_id: optionsOverrides?.action_id || 'action_id',
    block_id: optionsOverrides?.block_id || 'block_id',
    value: 'value',
    action_ts: ts,
    api_app_id: app_id,
    team: { id: team, domain: 'slack.com' },
    user: { id: user, name: 'filmaj' },
    token,
    container: {},
  };
  return {
    payload: options,
    body: options,
    options,
    ack: () => Promise.resolve(),
  };
}

function createDummyViewOutput(viewOverrides?: Partial<ViewOutput>): ViewOutput {
  return {
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
}

export function createDummyViewSubmissionMiddlewareArgs(
  viewOverrides?: Partial<ViewOutput>,
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
): SlackViewMiddlewareArgs<ViewSubmitAction> {
  const payload = createDummyViewOutput(viewOverrides);
  const event: ViewSubmitAction = {
    type: 'view_submission',
    team: { id: team, domain: 'slack.com' },
    user: { id: user, name: 'filmaj' },
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

export function createDummyViewClosedMiddlewareArgs(
  viewOverrides?: Partial<ViewOutput>,
  // biome-ignore lint/suspicious/noExplicitAny: allow mocking tools to provide any override
  bodyOverrides?: Record<string, any>,
): SlackViewMiddlewareArgs<ViewClosedAction> {
  const payload = createDummyViewOutput(viewOverrides);
  const event: ViewClosedAction = {
    type: 'view_closed',
    team: { id: team, domain: 'slack.com' },
    user: { id: user, name: 'filmaj' },
    view: payload,
    api_app_id: app_id,
    token,
    is_cleared: false,
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
  callback_id = 'Cb1234',
  shortcut?: MessageShortcut,
): SlackShortcutMiddlewareArgs<MessageShortcut> {
  const payload: MessageShortcut = shortcut || {
    type: 'message_action',
    callback_id,
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
  callback_id = 'Cb1234',
  shortcut?: GlobalShortcut,
): SlackShortcutMiddlewareArgs<GlobalShortcut> {
  const payload: GlobalShortcut = shortcut || {
    type: 'shortcut',
    callback_id,
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
