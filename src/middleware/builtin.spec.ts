// tslint:disable:no-implicit-dependencies
import 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';
import { ErrorCode } from '../errors';
import { Override, delay, wrapToResolveOnFirstCall } from '../test-helpers';
import rewiremock from 'rewiremock';
import {
  SlackEventMiddlewareArgs,
  NextMiddleware,
  Context,
  MessageEvent,
  ContextMissingPropertyError,
  SlackCommandMiddlewareArgs,
} from '../types';
import { onlyCommands, onlyEvents, matchCommandName, matchEventType, subtype } from './builtin';
import { SlashCommand } from '../types/command/index';
import { SlackEvent, AppMentionEvent, BotMessageEvent } from '../types/events/base-events';

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

  function matchesPatternTestCase(pattern: string | RegExp, matchingText: string): Mocha.AsyncFunc {
    return async () => {
      // Arrange
      const dummyContext: DummyContext = {};
      const { fn: next, promise: onNextFirstCall } = wrapToResolveOnFirstCall(assertions);
      const fakeArgs = {
        next,
        message: createFakeMessageEvent(matchingText),
        context: dummyContext,
      } as unknown as MessageMiddlewareArgs;
      const { matchMessage } = await importBuiltin();

      // Act
      const middleware = matchMessage(pattern);
      middleware(fakeArgs);
      await delay();

      // Assert
      async function assertions(...args: any[]): Promise<void> {
        // Assert that there is no error
        assert.notExists(args[0]);
        // The following assertion(s) check behavior that is only targeted at RegExp patterns
        if (typeof pattern !== 'string') {
          if (dummyContext.matches !== undefined) {
            assert.lengthOf(dummyContext.matches, 1);
          } else {
            assert.fail();
          }
        }
      }
      return onNextFirstCall;
    };
  }

  function notMatchesPatternTestCase(pattern: string | RegExp, nonMatchingText: string): Mocha.AsyncFunc {
    return async () => {
      // Arrange
      const dummyContext = {};
      const fakeNext = sinon.fake();
      const fakeArgs = {
        message: createFakeMessageEvent(nonMatchingText),
        context: dummyContext,
        next: fakeNext,
      } as unknown as MessageMiddlewareArgs;
      const { matchMessage } = await importBuiltin();

      // Act
      const middleware = matchMessage(pattern);
      middleware(fakeArgs);
      await delay();

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
        message: createFakeMessageEvent([{ type: 'divider' }]),
        context: dummyContext,
        next: fakeNext,
      } as unknown as MessageMiddlewareArgs;
      const { matchMessage } = await importBuiltin();

      // Act
      const middleware = matchMessage(pattern);
      middleware(fakeArgs);
      await delay();

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
    it('should match message events with a pattern that matches', matchesPatternTestCase(pattern, matchingText));
    it('should filter out message events with a pattern that does not match', notMatchesPatternTestCase(
      pattern, nonMatchingText,
    ));
    it('should filter out message events which do not have text (block kit)', noTextMessageTestCase(pattern));
  });

  describe('using a RegExp pattern', () => {
    const pattern = /foo/;
    const matchingText = 'foobar';
    const nonMatchingText = 'bar';
    it('should initialize', initializeTestCase(pattern));
    it('should match message events with a pattern that matches', matchesPatternTestCase(pattern, matchingText));
    it('should filter out message events with a pattern that does not match', notMatchesPatternTestCase(
      pattern, nonMatchingText,
    ));
    it('should filter out message events which do not have text (block kit)', noTextMessageTestCase(pattern));
  });
});

describe('directMention()', () => {
  it('should bail when the context does not provide a bot user ID', async () => {
    // Arrange
    const { fn: next, promise: onNextFirstCall } = wrapToResolveOnFirstCall(assertions);
    const fakeArgs = {
      next,
      message: createFakeMessageEvent(),
      context: {},
    } as unknown as MessageMiddlewareArgs;
    const { directMention } = await importBuiltin();

    // Act
    const middleware = directMention();
    middleware(fakeArgs);
    await delay();

    // Assert
    async function assertions(...args: any[]): Promise<void> {
      const firstArg = args[0];
      assert.instanceOf(firstArg, Error);
      assert.propertyVal(firstArg, 'code', ErrorCode.ContextMissingPropertyError);
      assert.propertyVal(firstArg, 'missingProperty', 'botUserId');
    }
    return onNextFirstCall;
  });

  it('should match message events that mention the bot user ID at the beginning of message text', async () => {
    // Arrange
    const fakeBotUserId = 'B123456';
    const messageText = `<@${fakeBotUserId}> hi`;
    const { fn: next, promise: onNextFirstCall } = wrapToResolveOnFirstCall(assertions);
    const fakeArgs = {
      next,
      message: createFakeMessageEvent(messageText),
      context: { botUserId: fakeBotUserId },
    } as unknown as MessageMiddlewareArgs;
    const { directMention } = await importBuiltin();

    // Act
    const middleware = directMention();
    middleware(fakeArgs);
    await delay();

    // Assert
    async function assertions(...args: any[]): Promise<void> {
      // Assert that there is no error
      assert.notExists(args[0]);
    }
    return onNextFirstCall;
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
    middleware(fakeArgs);
    await delay();

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
    middleware(fakeArgs);
    await delay();

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
    middleware(fakeArgs);
    await delay();

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
    middleware(fakeArgs);
    await delay();

    // Assert
    assert(fakeNext.notCalled);
  });
});

describe('ignoreSelf()', () => {
  it('should handle context missing error', async () => {
    // Arrange
    const fakeNext = sinon.fake();
    const fakeBotUserId = undefined;
    const fakeArgs = {
      next: fakeNext,
      context: { botUserId: fakeBotUserId },
    } as unknown as MemberJoinedOrLeftChannelMiddlewareArgs;

    const { ignoreSelf: getIgnoreSelfMiddleware, contextMissingPropertyError } = await importBuiltin();

    // Act
    const middleware = getIgnoreSelfMiddleware();
    middleware(fakeArgs);
    await delay();

    // Assert
    const expectedError = contextMissingPropertyError(
      'botId',
      'Cannot ignore events from the app without a bot ID. Ensure authorize callback returns a botId.',
    );

    const contextMissingError: ContextMissingPropertyError = fakeNext.getCall(0).lastArg;

    assert.equal(contextMissingError.code, expectedError.code);
    assert.equal(contextMissingError.missingProperty, expectedError.missingProperty);
  });

  it('should immediately call next(), because incoming middleware args don\'t contain event', async () => {
    // Arrange
    const fakeNext = sinon.fake();
    const fakeBotUserId = 'BUSER1';
    const fakeArgs = {
      next: fakeNext,
      context: { botUserId: fakeBotUserId },
      command: {
        command: '/fakeCommand',
      },
    } as unknown as CommandMiddlewareArgs;

    const { ignoreSelf: getIgnoreSelfMiddleware } = await importBuiltin();

    // Act
    const middleware = getIgnoreSelfMiddleware();
    middleware(fakeArgs);
    await delay();

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
    middleware(fakeArgs);
    await delay();

    // Assert
    assert(fakeNext.notCalled);
  });

  it('should filter an event out, because it matches our own app and shouldn\'t be retained', async () => {
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
    middleware(fakeArgs);
    await delay();

    // Assert
    assert(fakeNext.notCalled);
  });

  it('should filter an event out, because it matches our own app and shouldn\'t be retained', async () => {
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
    middleware(fakeArgs);
    await delay();

    // Assert
    assert(fakeNext.notCalled);
  });

  it('shouldn\'t filter an event out, because it should be retained', async () => {
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
    listOfFakeArgs.forEach(middleware);

    await delay();

    // Assert
    assert.equal(fakeNext.callCount, listOfFakeArgs.length);
  });
});

describe('onlyCommands', () => {

  it('should detect valid requests', async () => {
    const payload: SlashCommand = { ...validCommandPayload };
    const fakeNext = sinon.fake();
    onlyCommands({
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
    onlyCommands({
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
  function buildArgs(fakeNext: NextMiddleware): SlackCommandMiddlewareArgs & { next: any, context: any } {
    const payload: SlashCommand = { ...validCommandPayload };
    return {
      payload,
      command: payload,
      body: payload,
      say: sayNoop,
      respond: noop,
      ack: noop,
      next: fakeNext,
      context: {},
    };
  }

  it('should detect valid requests', async () => {
    const fakeNext = sinon.fake();
    matchCommandName('/hi')(buildArgs(fakeNext));
    assert.isTrue(fakeNext.called);
  });

  it('should skip other requests', async () => {
    const fakeNext = sinon.fake();
    matchCommandName('/hello')(buildArgs(fakeNext));
    assert.isTrue(fakeNext.notCalled);
  });
});

describe('onlyEvents', () => {

  it('should detect valid requests', async () => {
    const fakeNext = sinon.fake();
    const args: SlackEventMiddlewareArgs<'app_mention'> & { event?: SlackEvent } = {
      payload: appMentionEvent,
      event: appMentionEvent,
      message: null as never, // a bit hackey to sartisfy TS compiler
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
    onlyEvents({ next: fakeNext, context: {}, ...args });
    assert.isTrue(fakeNext.called);
  });

  it('should skip other requests', async () => {
    const payload: SlashCommand = { ...validCommandPayload };
    const fakeNext = sinon.fake();
    onlyEvents({
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
  function buildArgs(): SlackEventMiddlewareArgs<'app_mention'> & { event?: SlackEvent } {
    return {
      payload: appMentionEvent,
      event: appMentionEvent,
      message: null as never, // a bit hackey to sartisfy TS compiler
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

  it('should detect valid requests', async () => {
    const fakeNext = sinon.fake();
    matchEventType('app_mention')({ next: fakeNext, context: {}, ...buildArgs() });
    assert.isTrue(fakeNext.called);
  });

  it('should skip other requests', async () => {
    const fakeNext = sinon.fake();
    matchEventType('app_home_opened')({ next: fakeNext, context: {}, ...buildArgs() });
    assert.isFalse(fakeNext.called);
  });
});

describe('subtype', () => {
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
    subtype('bot_message')({ next: fakeNext, context: {}, ...buildArgs() });
    assert.isTrue(fakeNext.called);
  });

  it('should skip other requests', async () => {
    const fakeNext = sinon.fake();
    subtype('me_message')({ next: fakeNext, context: {}, ...buildArgs() });
    assert.isFalse(fakeNext.called);
  });
});

/* Testing Harness */

interface DummyContext {
  matches?: RegExpExecArray;
}

type MessageMiddlewareArgs = SlackEventMiddlewareArgs<'message'> & { next: NextMiddleware, context: Context };
type TokensRevokedMiddlewareArgs = SlackEventMiddlewareArgs<'tokens_revoked'>
  & { next: NextMiddleware, context: Context };

type MemberJoinedOrLeftChannelMiddlewareArgs = SlackEventMiddlewareArgs<'member_joined_channel' | 'member_left_channel'>
  & { next: NextMiddleware, context: Context };

type CommandMiddlewareArgs = SlackCommandMiddlewareArgs & { next: NextMiddleware; context: Context };

async function importBuiltin(
  overrides: Override = {},
): Promise<typeof import('./builtin')> {
  return rewiremock.module(() => import('./builtin'), overrides);
}

function createFakeMessageEvent(content: string | MessageEvent['blocks'] = ''): MessageEvent {
  const event: Partial<MessageEvent> = {
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
};

const appMentionEvent: AppMentionEvent = {
  type: 'app_mention',
  user: 'U1234567',
  text: 'this is my message',
  ts: '123.123',
  channel: 'C1234567',
  event_ts: '123.123',
};

const botMessageEvent: BotMessageEvent & MessageEvent = {
  type: 'message',
  subtype: 'bot_message',
  channel: 'C1234567',
  user: 'U1234567',
  ts: '123.123',
  text: 'this is my message',
  bot_id: 'B1234567',
};

const noop = () => Promise.resolve(undefined);
const sayNoop = () => Promise.resolve({ ok: true });
