// tslint:disable:no-implicit-dependencies
import 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';
import { ErrorCode, ContextMissingPropertyError } from '../errors';
import { Override, createFakeLogger } from '../test-helpers';
import rewiremock from 'rewiremock';
import {
  SlackEventMiddlewareArgs,
  NextFn,
  Context,
  SlackEvent,
  MessageEvent,
  SlackCommandMiddlewareArgs,
} from '../types';
import { onlyCommands, onlyEvents, matchCommandName, matchEventType, subtype } from './builtin';
import { SlashCommand } from '../types/command';
import { AppMentionEvent, AppHomeOpenedEvent } from '../types/events';
import { GenericMessageEvent } from '../types/events/message-events';
import { WebClient } from '@slack/web-api';
import { Logger } from '@slack/logger';

describe('matchMessage()', () => {
  function initializeTestCase(pattern: string | RegExp): Mocha.AsyncFunc {
    return async () => {
      // Arrange
      const { matchMessage } = await importBuiltin();

      // Act
      const middleware = matchMessage(pattern);

      // Assert
      assert.isOk(middleware);
    };
  }

  function matchesPatternTestCase(
    pattern: string | RegExp,
    matchingText: string,
    buildFakeEvent: (content: string) => SlackEvent,
  ): Mocha.AsyncFunc {
    return async () => {
      // Arrange
      const dummyContext: DummyContext = {};
      const fakeNext = sinon.fake();
      const fakeArgs = {
        next: fakeNext,
        event: buildFakeEvent(matchingText),
        context: dummyContext,
      } as unknown as MessageMiddlewareArgs;
      const { matchMessage } = await importBuiltin();

      // Act
      const middleware = matchMessage(pattern);
      await middleware(fakeArgs);

      // Assert
      assert(fakeNext.called);
      // The following assertion(s) check behavior that is only targeted at RegExp patterns
      if (typeof pattern !== 'string') {
        if (dummyContext.matches !== undefined) {
          assert.lengthOf(dummyContext.matches, 1);
        } else {
          assert.fail();
        }
      }
    };
  }

  function notMatchesPatternTestCase(
    pattern: string | RegExp,
    nonMatchingText: string,
    buildFakeEvent: (content: string) => SlackEvent,
  ): Mocha.AsyncFunc {
    return async () => {
      // Arrange
      const dummyContext = {};
      const fakeNext = sinon.fake();
      const fakeArgs = {
        event: buildFakeEvent(nonMatchingText),
        context: dummyContext,
        next: fakeNext,
      } as unknown as MessageMiddlewareArgs;
      const { matchMessage } = await importBuiltin();

      // Act
      const middleware = matchMessage(pattern);
      await middleware(fakeArgs);

      // Assert
      assert(fakeNext.notCalled);
      assert.notProperty(dummyContext, 'matches');
    };
  }

  function noTextMessageTestCase(pattern: string | RegExp): Mocha.AsyncFunc {
    return async () => {
      // Arrange
      const dummyContext = {};
      const fakeNext = sinon.fake();
      const fakeArgs = {
        event: createFakeMessageEvent([{ type: 'divider' }]),
        context: dummyContext,
        next: fakeNext,
      } as unknown as MessageMiddlewareArgs;
      const { matchMessage } = await importBuiltin();

      // Act
      const middleware = matchMessage(pattern);
      await middleware(fakeArgs);

      // Assert
      assert(fakeNext.notCalled);
      assert.notProperty(dummyContext, 'matches');
    };
  }

  describe('using a string pattern', () => {
    const pattern = 'foo';
    const matchingText = 'foobar';
    const nonMatchingText = 'bar';
    it('should initialize', initializeTestCase(pattern));
    it(
      'should match message events with a pattern that matches',
      matchesPatternTestCase(pattern, matchingText, createFakeMessageEvent),
    );
    it(
      'should match app_mention events with a pattern that matches',
      matchesPatternTestCase(pattern, matchingText, createFakeAppMentionEvent),
    );
    it(
      'should filter out message events with a pattern that does not match',
      notMatchesPatternTestCase(pattern, nonMatchingText, createFakeMessageEvent),
    );
    it(
      'should filter out app_mention events with a pattern that does not match',
      notMatchesPatternTestCase(pattern, nonMatchingText, createFakeAppMentionEvent),
    );
    it('should filter out message events which do not have text (block kit)', noTextMessageTestCase(pattern));
  });

  describe('using a RegExp pattern', () => {
    const pattern = /foo/;
    const matchingText = 'foobar';
    const nonMatchingText = 'bar';
    it('should initialize', initializeTestCase(pattern));
    it(
      'should match message events with a pattern that matches',
      matchesPatternTestCase(pattern, matchingText, createFakeMessageEvent),
    );
    it(
      'should match app_mention events with a pattern that matches',
      matchesPatternTestCase(pattern, matchingText, createFakeAppMentionEvent),
    );
    it(
      'should filter out message events with a pattern that does not match',
      notMatchesPatternTestCase(pattern, nonMatchingText, createFakeMessageEvent),
    );
    it(
      'should filter out app_mention events with a pattern that does not match',
      notMatchesPatternTestCase(pattern, nonMatchingText, createFakeAppMentionEvent),
    );
    it('should filter out message events which do not have text (block kit)', noTextMessageTestCase(pattern));
  });
});

describe('directMention()', () => {
  it('should bail when the context does not provide a bot user ID', async () => {
    // Arrange
    const fakeArgs = {
      next: () => Promise.resolve(),
      message: createFakeMessageEvent(),
      context: {},
    } as unknown as MessageMiddlewareArgs;
    const { directMention } = await importBuiltin();

    // Act
    const middleware = directMention();

    let error;

    try {
      await middleware(fakeArgs);
    } catch (err) {
      error = err;
    }

    assert.instanceOf(error, Error);
    assert.propertyVal(error, 'code', ErrorCode.ContextMissingPropertyError);
    assert.propertyVal(error, 'missingProperty', 'botUserId');
  });

  it('should match message events that mention the bot user ID at the beginning of message text', async () => {
    // Arrange
    const fakeBotUserId = 'B123456';
    const messageText = `<@${fakeBotUserId}> hi`;
    const fakeNext = sinon.fake();
    const fakeArgs = {
      next: fakeNext,
      message: createFakeMessageEvent(messageText),
      context: { botUserId: fakeBotUserId },
    } as unknown as MessageMiddlewareArgs;
    const { directMention } = await importBuiltin();

    // Act
    const middleware = directMention();
    await middleware(fakeArgs);

    // Assert
    assert(fakeNext.called);
  });

  it('should not match message events that do not mention the bot user ID', async () => {
    // Arrange
    const fakeBotUserId = 'B123456';
    const messageText = 'hi';
    const fakeNext = sinon.fake();
    const fakeArgs = {
      next: fakeNext,
      message: createFakeMessageEvent(messageText),
      context: { botUserId: fakeBotUserId },
    } as unknown as MessageMiddlewareArgs;
    const { directMention } = await importBuiltin();

    // Act
    const middleware = directMention();
    await middleware(fakeArgs);

    // Assert
    assert(fakeNext.notCalled);
  });

  it('should not match message events that mention the bot user ID NOT at the beginning of message text', async () => {
    // Arrange
    const fakeBotUserId = 'B123456';
    const messageText = `hello <@${fakeBotUserId}>`;
    const fakeNext = sinon.fake();
    const fakeArgs = {
      next: fakeNext,
      message: createFakeMessageEvent(messageText),
      context: { botUserId: fakeBotUserId },
    } as unknown as MessageMiddlewareArgs;
    const { directMention } = await importBuiltin();

    // Act
    const middleware = directMention();
    await middleware(fakeArgs);

    // Assert
    assert(fakeNext.notCalled);
  });

  it('should not match message events which do not have text (block kit)', async () => {
    // Arrange
    const fakeBotUserId = 'B123456';
    const fakeNext = sinon.fake();
    const fakeArgs = {
      next: fakeNext,
      message: createFakeMessageEvent([{ type: 'divider' }]),
      context: { botUserId: fakeBotUserId },
    } as unknown as MessageMiddlewareArgs;
    const { directMention } = await importBuiltin();

    // Act
    const middleware = directMention();
    await middleware(fakeArgs);

    // Assert
    assert(fakeNext.notCalled);
  });

  it('should not match message events that contain a link to a conversation at the beginning', async () => {
    // Arrange
    const fakeBotUserId = 'B123456';
    const messageText = '<#C12345> hi';
    const fakeNext = sinon.fake();
    const fakeArgs = {
      next: fakeNext,
      message: createFakeMessageEvent(messageText),
      context: { botUserId: fakeBotUserId },
    } as unknown as MessageMiddlewareArgs;
    const { directMention } = await importBuiltin();

    // Act
    const middleware = directMention();
    await middleware(fakeArgs);

    // Assert
    assert(fakeNext.notCalled);
  });
});

describe('ignoreSelf()', () => {
  it('should handle context missing error', async () => {
    // Arrange
    const fakeNext = sinon.fake.resolves(null);
    const fakeBotUserId = undefined;
    const fakeArgs = {
      next: fakeNext,
      context: { botUserId: fakeBotUserId, botId: fakeBotUserId },
    } as unknown as MemberJoinedOrLeftChannelMiddlewareArgs;

    const { ignoreSelf: getIgnoreSelfMiddleware } = await importBuiltin();

    // Act
    const middleware = getIgnoreSelfMiddleware();

    let error;
    try {
      await middleware(fakeArgs);
    } catch (err) {
      error = err;
    }

    // Assert
    const expectedError = new ContextMissingPropertyError(
      'botId',
      'Cannot ignore events from the app without a bot ID. Ensure authorize callback returns a botId.',
    );

    assert.equal(error.code, expectedError.code);
    assert.equal(error.missingProperty, expectedError.missingProperty);
  });

  it("should immediately call next(), because incoming middleware args don't contain event", async () => {
    // Arrange
    const fakeNext = sinon.fake();
    const fakeBotUserId = 'BUSER1';
    const fakeArgs = {
      next: fakeNext,
      context: { botUserId: fakeBotUserId, botId: fakeBotUserId },
      command: {
        command: '/fakeCommand',
      },
    } as unknown as CommandMiddlewareArgs;

    const { ignoreSelf: getIgnoreSelfMiddleware } = await importBuiltin();

    // Act
    const middleware = getIgnoreSelfMiddleware();
    await middleware(fakeArgs);

    // Assert
    assert(fakeNext.calledOnce);
  });

  it('should look for an event identified as a bot message from the same bot ID as this app and skip it', async () => {
    // Arrange
    const fakeNext = sinon.fake();
    const fakeBotUserId = 'BUSER1';
    // TODO: Fix typings here
    const fakeArgs = {
      next: fakeNext,
      context: { botUserId: fakeBotUserId, botId: fakeBotUserId },
      event: {
        type: 'message',
        subtype: 'bot_message',
        bot_id: fakeBotUserId,
      },
      message: {
        type: 'message',
        subtype: 'bot_message',
        bot_id: fakeBotUserId,
      },
    } as any;

    const { ignoreSelf: getIgnoreSelfMiddleware } = await importBuiltin();

    // Act
    const middleware = getIgnoreSelfMiddleware();
    await middleware(fakeArgs);

    // Assert
    assert(fakeNext.notCalled);
  });

  it("should filter an event out, because it matches our own app and shouldn't be retained", async () => {
    // Arrange
    const fakeNext = sinon.fake();
    const fakeBotUserId = 'BUSER1';
    const fakeArgs = {
      next: fakeNext,
      context: { botUserId: fakeBotUserId, botId: fakeBotUserId },
      event: {
        type: 'tokens_revoked',
        user: fakeBotUserId,
      },
    } as unknown as TokensRevokedMiddlewareArgs;

    const { ignoreSelf: getIgnoreSelfMiddleware } = await importBuiltin();

    // Act
    const middleware = getIgnoreSelfMiddleware();
    await middleware(fakeArgs);

    // Assert
    assert(fakeNext.notCalled);
  });

  it("should filter an event out, because it matches our own app and shouldn't be retained", async () => {
    // Arrange
    const fakeNext = sinon.fake();
    const fakeBotUserId = 'BUSER1';
    const fakeArgs = {
      next: fakeNext,
      context: { botUserId: fakeBotUserId, botId: fakeBotUserId },
      event: {
        type: 'tokens_revoked',
        user: fakeBotUserId,
      },
    } as unknown as TokensRevokedMiddlewareArgs;

    const { ignoreSelf: getIgnoreSelfMiddleware } = await importBuiltin();

    // Act
    const middleware = getIgnoreSelfMiddleware();
    await middleware(fakeArgs);

    // Assert
    assert(fakeNext.notCalled);
  });

  it("shouldn't filter an event out, because it should be retained", async () => {
    // Arrange
    const fakeNext = sinon.fake();
    const fakeBotUserId = 'BUSER1';
    const eventsWhichShouldNotBeFilteredOut = ['member_joined_channel', 'member_left_channel'];

    const listOfFakeArgs = eventsWhichShouldNotBeFilteredOut.map((eventType) => {
      return {
        next: fakeNext,
        context: { botUserId: fakeBotUserId, botId: fakeBotUserId },
        event: {
          type: eventType,
          user: fakeBotUserId,
        },
      } as unknown as MemberJoinedOrLeftChannelMiddlewareArgs;
    });

    const { ignoreSelf: getIgnoreSelfMiddleware } = await importBuiltin();

    // Act
    const middleware = getIgnoreSelfMiddleware();
    await Promise.all(listOfFakeArgs.map(middleware));

    // Assert
    assert.equal(fakeNext.callCount, listOfFakeArgs.length);
  });
});

describe('onlyCommands', () => {
  const logger = createFakeLogger();
  const client = new WebClient(undefined, { logger, slackApiUrl: undefined });

  it('should detect valid requests', async () => {
    const payload: SlashCommand = { ...validCommandPayload };
    const fakeNext = sinon.fake();
    await onlyCommands({
      logger,
      client,
      payload,
      command: payload,
      body: payload,
      say: sayNoop,
      respond: noop,
      ack: noop,
      next: fakeNext,
      context: {},
    });
    assert.isTrue(fakeNext.called);
  });

  it('should skip other requests', async () => {
    const payload: any = {};
    const fakeNext = sinon.fake();
    await onlyCommands({
      logger,
      client,
      payload,
      action: payload,
      command: undefined,
      body: payload,
      say: sayNoop,
      respond: noop,
      ack: noop,
      next: fakeNext,
      context: {},
    });
    assert.isTrue(fakeNext.notCalled);
  });
});

describe('matchCommandName', () => {
  const logger = createFakeLogger();
  const client = new WebClient(undefined, { logger, slackApiUrl: undefined });

  function buildArgs(fakeNext: NextFn): SlackCommandMiddlewareArgs & MiddlewareCommonArgs {
    const payload: SlashCommand = { ...validCommandPayload };
    return {
      payload,
      logger,
      client,
      command: payload,
      body: payload,
      say: sayNoop,
      respond: noop,
      ack: noop,
      next: fakeNext,
      context: {},
    };
  }

  it('should detect requests that match exactly', async () => {
    const fakeNext = sinon.fake();
    await matchCommandName('/hi')(buildArgs(fakeNext));
    assert.isTrue(fakeNext.called);
  });

  it('should detect requests that match a pattern', async () => {
    const fakeNext = sinon.fake();
    await matchCommandName(/h/)(buildArgs(fakeNext));
    assert.isTrue(fakeNext.called);
  });

  it('should skip other requests', async () => {
    const fakeNext = sinon.fake();
    await matchCommandName('/hello')(buildArgs(fakeNext));
    assert.isTrue(fakeNext.notCalled);
  });
});

describe('onlyEvents', () => {
  const logger = createFakeLogger();
  const client = new WebClient(undefined, { logger, slackApiUrl: undefined });

  it('should detect valid requests', async () => {
    const fakeNext = sinon.fake();
    const args: SlackEventMiddlewareArgs<'app_mention'> & { event?: SlackEvent } = {
      payload: appMentionEvent,
      event: appMentionEvent,
      message: null as never, // a bit hackey to satisfy TS compiler as 'null' cannot be assigned to type 'never'
      body: {
        token: 'token-value',
        team_id: 'T1234567',
        api_app_id: 'A1234567',
        event: appMentionEvent,
        type: 'event_callback',
        event_id: 'event-id-value',
        event_time: 123,
        authed_users: [],
      },
      say: sayNoop,
    };
    await onlyEvents({
      logger,
      client,
      next: fakeNext,
      context: {},
      ...args,
    });
    assert.isTrue(fakeNext.called);
  });

  it('should skip other requests', async () => {
    const payload: SlashCommand = { ...validCommandPayload };
    const fakeNext = sinon.fake();
    await onlyEvents({
      logger,
      client,
      payload,
      command: payload,
      body: payload,
      say: sayNoop,
      respond: noop,
      ack: noop,
      next: fakeNext,
      context: {},
    });
    assert.isFalse(fakeNext.called);
  });
});

describe('matchEventType', () => {
  const logger = createFakeLogger();
  const client = new WebClient(undefined, { logger, slackApiUrl: undefined });

  function buildArgs(): SlackEventMiddlewareArgs<'app_mention'> & { event?: SlackEvent } {
    return {
      payload: appMentionEvent,
      event: appMentionEvent,
      message: null as never, // a bit hackey to satisfy TS compiler as 'null' cannot be assigned to type 'never'
      body: {
        token: 'token-value',
        team_id: 'T1234567',
        api_app_id: 'A1234567',
        event: appMentionEvent,
        type: 'event_callback',
        event_id: 'event-id-value',
        event_time: 123,
        authed_users: [],
      },
      say: sayNoop,
    };
  }

  function buildArgsAppHomeOpened(): SlackEventMiddlewareArgs<'app_home_opened'> & {
    event?: SlackEvent;
  } {
    return {
      payload: appHomeOpenedEvent,
      event: appHomeOpenedEvent,
      message: null as never, // a bit hackey to satisfy TS compiler as 'null' cannot be assigned to type 'never'
      body: {
        token: 'token-value',
        team_id: 'T1234567',
        api_app_id: 'A1234567',
        event: appHomeOpenedEvent,
        type: 'event_callback',
        event_id: 'event-id-value',
        event_time: 123,
        authed_users: [],
      },
      say: sayNoop,
    };
  }

  it('should detect valid requests', async () => {
    const fakeNext = sinon.fake();
    await matchEventType('app_mention')({
      logger,
      client,
      next: fakeNext,
      context: {},
      ...buildArgs(),
    });
    assert.isTrue(fakeNext.called);
  });

  it('should detect valid RegExp requests with app_mention', async () => {
    const fakeNext = sinon.fake();
    await matchEventType(/app_mention|app_home_opened/)({
      logger,
      client,
      next: fakeNext,
      context: {},
      ...buildArgs(),
    });
    assert.isTrue(fakeNext.called);
  });

  it('should detect valid RegExp requests with app_home_opened', async () => {
    const fakeNext = sinon.fake();
    await matchEventType(/app_mention|app_home_opened/)({
      logger,
      client,
      next: fakeNext,
      context: {},
      ...buildArgsAppHomeOpened(),
    });
    assert.isTrue(fakeNext.called);
  });

  it('should skip other requests', async () => {
    const fakeNext = sinon.fake();
    await matchEventType('app_home_opened')({
      logger,
      client,
      next: fakeNext,
      context: {},
      ...buildArgs(),
    });
    assert.isFalse(fakeNext.called);
  });

  it('should skip other requests for RegExp', async () => {
    const fakeNext = sinon.fake();
    await matchEventType(/foo/)({
      logger,
      client,
      next: fakeNext,
      context: {},
      ...buildArgs(),
    });
    assert.isFalse(fakeNext.called);
  });
});

describe('subtype', () => {
  const logger = createFakeLogger();
  const client = new WebClient(undefined, { logger, slackApiUrl: undefined });

  function buildArgs(): SlackEventMiddlewareArgs<'message'> & { event?: SlackEvent } {
    return {
      payload: botMessageEvent,
      event: botMessageEvent,
      message: botMessageEvent,
      body: {
        token: 'token-value',
        team_id: 'T1234567',
        api_app_id: 'A1234567',
        event: botMessageEvent,
        type: 'event_callback',
        event_id: 'event-id-value',
        event_time: 123,
        authed_users: [],
      },
      say: sayNoop,
    };
  }

  it('should detect valid requests', async () => {
    const fakeNext = sinon.fake();
    await subtype('bot_message')({
      logger,
      client,
      next: fakeNext,
      context: {},
      ...buildArgs(),
    });
    assert.isTrue(fakeNext.called);
  });

  it('should skip other requests', async () => {
    const fakeNext = sinon.fake();
    await subtype('me_message')({
      logger,
      client,
      next: fakeNext,
      context: {},
      ...buildArgs(),
    });
    assert.isFalse(fakeNext.called);
  });
});

/* Testing Harness */

interface DummyContext {
  matches?: RegExpExecArray;
}

interface MiddlewareCommonArgs {
  next: NextFn;
  context: Context;
  logger: Logger;
  client: WebClient;
}
type MessageMiddlewareArgs = SlackEventMiddlewareArgs<'message'> & MiddlewareCommonArgs;
type TokensRevokedMiddlewareArgs = SlackEventMiddlewareArgs<'tokens_revoked'> & MiddlewareCommonArgs;

type MemberJoinedOrLeftChannelMiddlewareArgs = SlackEventMiddlewareArgs<
  'member_joined_channel' | 'member_left_channel'
> &
  MiddlewareCommonArgs;

type CommandMiddlewareArgs = SlackCommandMiddlewareArgs & MiddlewareCommonArgs;

async function importBuiltin(overrides: Override = {}): Promise<typeof import('./builtin')> {
  return rewiremock.module(() => import('./builtin'), overrides);
}

function createFakeMessageEvent(content: string | GenericMessageEvent['blocks'] = ''): MessageEvent {
  const event: Partial<GenericMessageEvent> = {
    type: 'message',
    channel: 'CHANNEL_ID',
    user: 'USER_ID',
    ts: 'MESSAGE_ID',
  };
  if (typeof content === 'string') {
    event.text = content;
  } else {
    event.blocks = content;
  }
  return event as MessageEvent;
}

function createFakeAppMentionEvent(text: string = ''): AppMentionEvent {
  const event: Partial<AppMentionEvent> = {
    text,
    type: 'app_mention',
    user: 'USER_ID',
    ts: 'MESSAGE_ID',
    channel: 'CHANNEL_ID',
    event_ts: 'MESSAGE_ID',
  };
  return event as AppMentionEvent;
}

const validCommandPayload: SlashCommand = {
  token: 'token-value',
  command: '/hi',
  text: 'Steve!',
  response_url: 'https://hooks.slack.com/foo/bar',
  trigger_id: 'trigger-id-value',
  user_id: 'U1234567',
  user_name: 'steve',
  team_id: 'T1234567',
  team_domain: 'awesome-eng-team',
  channel_id: 'C1234567',
  channel_name: 'random',
  api_app_id: 'A123456',
};

const appMentionEvent: AppMentionEvent = {
  type: 'app_mention',
  username: 'USERNAME',
  user: 'U1234567',
  text: 'this is my message',
  ts: '123.123',
  channel: 'C1234567',
  event_ts: '123.123',
  thread_ts: '123.123',
};

const appHomeOpenedEvent: AppHomeOpenedEvent = {
  type: 'app_home_opened',
  user: 'USERNAME',
  channel: 'U1234567',
  tab: 'home',
  view: {
    type: 'home',
    blocks: [],
    clear_on_close: false,
    notify_on_close: false,
    external_id: '',
  },
  event_ts: '123.123',
};

const botMessageEvent: MessageEvent = {
  type: 'message',
  subtype: 'bot_message',
  channel: 'CHANNEL_ID',
  event_ts: '123.123',
  user: 'U1234567',
  ts: '123.123',
  text: 'this is my message',
  bot_id: 'B1234567',
  channel_type: 'channel',
};

const noop = () => Promise.resolve(undefined);
const sayNoop = () => Promise.resolve({ ok: true });
