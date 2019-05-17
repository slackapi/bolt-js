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

  function matchesPatternTestCase(pattern: string | RegExp): Mocha.AsyncFunc {
    return async () => {
      // Arrange
      const dummyMatchingMessageEvent: MessageEvent = {
        text: 'foobar',
        type: 'message',
        channel: 'CHANNEL_ID',
        user: 'USER_ID',
        ts: 'MESSAGE_ID',
      };
      const dummyContext: DummyContext = {};
      const { fn: next, promise: onNextFirstCall } = wrapToResolveOnFirstCall(assertions);
      const fakeArgs = {
        next,
        message: dummyMatchingMessageEvent,
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

  function notMatchesPatternTestCase(pattern: string | RegExp): Mocha.AsyncFunc {
    return async () => {
      // Arrange
      const dummyMismatchingMessageEvent: MessageEvent = {
        text: 'bar',
        type: 'message',
        channel: 'CHANNEL_ID',
        user: 'USER_ID',
        ts: 'MESSAGE_ID',
      };
      const dummyContext = {};
      const fakeNext = sinon.fake();
      const fakeArgs = {
        message: dummyMismatchingMessageEvent,
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
      const dummyMismatchingMessageEvent: MessageEvent = {
        type: 'message',
        blocks: [{ type: 'divider' }],
        channel: 'CHANNEL_ID',
        user: 'USER_ID',
        ts: 'MESSAGE_ID',
      };
      const dummyContext = {};
      const fakeNext = sinon.fake();
      const fakeArgs = {
        message: dummyMismatchingMessageEvent,
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
    it('should initialize', initializeTestCase(pattern));
    it('should match message events with a pattern that matches', matchesPatternTestCase(pattern));
    it('should filter out message events with a pattern that does not match', notMatchesPatternTestCase(pattern));
    it('should filter out message events which do not have text (block kit)', noTextMessageTestCase(pattern));
  });

  describe('using a RegExp pattern', () => {
    const pattern = /foo/;
    it('should initialize', initializeTestCase(pattern));
    it('should match message events with a pattern that matches', matchesPatternTestCase(pattern));
    it('should filter out message events with a pattern that does not match', notMatchesPatternTestCase(pattern));
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
