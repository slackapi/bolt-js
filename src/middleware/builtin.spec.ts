// tslint:disable:no-implicit-dependencies
import 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';
import { Override, delay, wrapToResolveOnFirstCall } from '../test-helpers';
import rewiremock from 'rewiremock';
import { SlackEventMiddlewareArgs, NextMiddleware, Context, MessageEvent } from '../types';

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

/* Testing Harness */

interface DummyContext {
  matches?: RegExpExecArray;
}

type MessageMiddlewareArgs = SlackEventMiddlewareArgs<'message'> & { next: NextMiddleware, context: Context };

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
