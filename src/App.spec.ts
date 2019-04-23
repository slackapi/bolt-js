// tslint:disable:ter-prefer-arrow-callback typedef no-implicit-dependencies no-this-assignment
import 'mocha';
import sinon from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import { ErrorCode } from './errors';

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
    it('should fail without a token for single team authorization', async function () {
      const { App } = await importApp();
      try {
        new App({ signingSecret: '' }); // tslint:disable-line:no-unused-expression
        throw new Error('should not reach');
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
        throw new Error('should not reach');
      } catch (error) {
        assert.instanceOf(error, Error);
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        assert(authorizeCallback.notCalled);
      }
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
  const App = (await rewiremock.module(() => import('./App'), { // tslint:disable-line:variable-name
    '@slack/web-api': {
      WebClient: class {
        public readonly chat = {
          postMessage: sinon.fake.resolves({}),
        };
      },
      addAppMetadata: sinon.fake(),
    },
  })).default;

  return {
    App,
  };
}
