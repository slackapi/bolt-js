// tslint:disable:ter-prefer-arrow-callback typedef no-implicit-dependencies no-this-assignment
import 'mocha';
import sinon from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import { ErrorCode } from './errors';
import { Receiver } from './types';
import { ConversationStore } from './conversation-store';

describe('App', function () {
  describe('constructor', function () {
    // TODO: test when the single team authorization results fail. that should still succeed but warn. it also means
    // that the `ignoreSelf` middleware will fail (or maybe just warn) a bunch.
    describe('with successful single team authorization results', function () {
      it('should succeed with a token for single team authorization', async function () {
        const { App } = await importAppWhichFetchesOwnBotIds();
        new App({ token: '', signingSecret: '' }); // tslint:disable-line:no-unused-expression
      });
    });
    it('should succeed with an authorize callback', async function () {
      const { App } = await importApp();
      const authorizeCallback = sinon.spy();
      new App({ authorize: authorizeCallback, signingSecret: '' }); // tslint:disable-line:no-unused-expression
      assert(authorizeCallback.notCalled);
    });
    it('should fail without a token  for single team authorization or authorize callback', async function () {
      const { App } = await importApp();
      try {
        new App({ signingSecret: '' }); // tslint:disable-line:no-unused-expression
        assert.fail();
      } catch (error) {
        assert.instanceOf(error, Error);
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should fail when both a token and authorize callback are specified', async function () {
      const { App } = await importApp();
      const authorizeCallback = sinon.spy();
      try {
         // tslint:disable-next-line:no-unused-expression
        new App({ token: '', authorize: authorizeCallback, signingSecret: '' });
        assert.fail();
      } catch (error) {
        assert.instanceOf(error, Error);
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        assert(authorizeCallback.notCalled);
      }
    });
    describe('with a custom receiver', function () {
      it('should succeed with no signing secret for the default receiver', async function () {
        const { App } = await importApp();
        const mockReceiver = createMockReceiver();
        new App({ authorize: sinon.spy(), receiver: mockReceiver }); // tslint:disable-line:no-unused-expression
      });
    });
    it('should fail when no signing secret for the default receiver is specified', async function () {
      const { App } = await importApp();
      try {
        new App({ authorize: sinon.spy() }); // tslint:disable-line:no-unused-expression
        assert.fail();
      } catch (error) {
        assert.instanceOf(error, Error);
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should initialize MemoryStore conversation store by default', async function () {
      const { App, memoryStoreStub, conversationContextStub } = await importApp();
      new App({ authorize: sinon.spy(), signingSecret: '' }); // tslint:disable-line:no-unused-expression
      assert(memoryStoreStub.calledWithNew);
      assert(conversationContextStub.called);
    });
    it('should initialize without a conversation store when option is false', async function () {
      const { App, conversationContextStub } = await importApp();
      // tslint:disable-next-line:no-unused-expression
      new App({ convoStore: false, authorize: sinon.spy(), signingSecret: '' });
      assert(conversationContextStub.notCalled);
    });
    describe('with a custom conversation store', function () {
      it('should initialize the conversation store', async function () {
        const { App, conversationContextStub } = await importApp();
        const mockConvoStore = createMockConvoStore();
        // tslint:disable-next-line:no-unused-expression
        new App({ convoStore: mockConvoStore, authorize: sinon.spy(), signingSecret: '' });
        assert(conversationContextStub.firstCall.calledWith(mockConvoStore));
      });
    });
  });
});

/* Test Helpers */

async function importAppWhichFetchesOwnBotIds() {
  const fakeBotUserId = 'fake_bot_user_id';
  const fakeBotId = 'fake_bot_id';
  const App = (await rewiremock.module(() => import('./App'), { // tslint:disable-line:variable-name
    '@slack/web-api': {
      WebClient: class {
        public readonly auth = {
          test: sinon.fake.resolves({ user_id: fakeBotUserId }),
        };
        public readonly users = {
          info: sinon.fake.resolves({
            user: {
              profile: {
                bot_id: fakeBotId,
              },
            },
          }),
        };
        public readonly chat = {
          postMessage: sinon.fake.resolves({}),
        };
      },
      addAppMetadata: sinon.fake(),
    },
  })).default;

  return {
    fakeBotId,
    fakeBotUserId,
    App,
  };
}

async function importApp() {
  const memoryStoreStub = sinon.stub();
  const conversationContextStub = sinon.stub();
  const App = (await rewiremock.module(() => import('./App'), { // tslint:disable-line:variable-name
    '@slack/web-api': {
      WebClient: class {
        public readonly chat = {
          postMessage: sinon.fake.resolves({}),
        };
      },
      addAppMetadata: sinon.fake(),
    },
    './conversation-store': {
      conversationContext: conversationContextStub,
      MemoryStore: memoryStoreStub,
    },
  })).default;

  return {
    App,
    memoryStoreStub,
    conversationContextStub,
  };
}

function createMockReceiver(): Receiver {
  const mock = {
    on: sinon.fake(),
    start: sinon.fake.resolves(undefined),
    stop: sinon.fake.resolves(undefined),
  };
  mock.on = sinon.fake.returns(mock);
  return mock;
}

function createMockConvoStore(): ConversationStore {
  return {
    set: sinon.fake.resolves(undefined),
    get: sinon.fake.resolves(undefined),
  };
}
