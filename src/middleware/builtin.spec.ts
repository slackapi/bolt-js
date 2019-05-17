// tslint:disable:no-implicit-dependencies
import 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';
import { Override, delay, wrapToResolveOnFirstCall } from '../test-helpers';
import rewiremock from 'rewiremock';
import { SlackEventMiddlewareArgs, NextMiddleware, Context, MessageEvent } from '../types';

describe('matchMessage()', () => {
  it('should initialize with a string', async () => {
    // Arrange
    const { matchMessage } = await importBuiltin();

    // Act
    const middleware = matchMessage('string pattern');

    // Assert
    assert.isOk(middleware);
  });

  it('should initialize with a RegExp', async () => {
    // Arrange
    const { matchMessage } = await importBuiltin();

    // Act
    const middleware = matchMessage(/a RegExp pattern/);

    // Assert
    assert.isOk(middleware);
  });

  it('should match message events in which the text matches the string pattern', async () => {
    // Arrange
    const dummyPattern = 'foo';
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
    const middleware = matchMessage(dummyPattern);
    middleware(fakeArgs);
    await delay();

    // Assert
    async function assertions(...args: any[]): Promise<void> {
      assert.notExists(args[0]);
    }
    return onNextFirstCall;
  });

  it('should match message events in which the text matches the RegExp pattern', async () => {
    // Arrange
    const dummyPattern = /foo/;
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
    const middleware = matchMessage(dummyPattern);
    middleware(fakeArgs);
    await delay();

    // Assert
    async function assertions(...args: any[]): Promise<void> {
      assert.notExists(args[0]);
      if (dummyContext.matches !== undefined) {
        assert.lengthOf(dummyContext.matches, 1);
      } else {
        assert.fail();
      }
    }
    return onNextFirstCall;
  });

  it('should filter out message events which do not match a string pattern', async () => {
    // Arrange
    const dummyPattern = 'foo';
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
    const middleware = matchMessage(dummyPattern);
    middleware(fakeArgs);
    await delay();

    // Assert
    assert(fakeNext.notCalled);
    assert.notProperty(dummyContext, 'matches');
  });

  it('should filter out message events which do not match a RegExp pattern', async () => {
    // Arrange
    const dummyPattern = /foo/;
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
    const middleware = matchMessage(dummyPattern);
    middleware(fakeArgs);
    await delay();

    // Assert
    assert(fakeNext.notCalled);
    assert.notProperty(dummyContext, 'matches');
  });

  it('should filter out message events which do not have text (block kit messages) with a string pattern', async () => {
    // Arrange
    const dummyPattern = 'foo';
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
    const middleware = matchMessage(dummyPattern);
    middleware(fakeArgs);
    await delay();

    // Assert
    assert(fakeNext.notCalled);
    assert.notProperty(dummyContext, 'matches');
  });

  it('should filter out message events which do not have text (block kit messages) with a RegExp pattern', async () => {
    // Arrange
    const dummyPattern = /foo/;
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
    const middleware = matchMessage(dummyPattern);
    middleware(fakeArgs);
    await delay();

    // Assert
    assert(fakeNext.notCalled);
    assert.notProperty(dummyContext, 'matches');
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
