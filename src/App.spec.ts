// tslint:disable:ter-prefer-arrow-callback typedef no-implicit-dependencies no-this-assignment
import 'mocha';
import sinon from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';

describe('App', function () {
  describe('constructor', function () {
    describe('with successful single team authorization results', function () {
      beforeEach(async function () {
        this.App = (await createAppWhichFetchesOwnBotIds()).App;
      });
      it('should succeed for single team authorization', function () {
        const { App } = this;
        new App({ token: '', signingSecret: '' }); // tslint:disable-line:no-unused-expression
      });
      it('should fail without a token for single team authorization', function () {
        const { App } = this;
        // assert.throws(() => {
        try {
          new App({ signingSecret: '' }); // tslint:disable-line:no-unused-expression
          throw new Error('should not reach');
        } catch (error) {
          assert.instanceOf(error, Error);
          // assert.propertyVal(error, 'code', ErrorCode.);
        }
        // });
      });
    });
  });
});

/* Test Helpers */

async function createAppWhichFetchesOwnBotIds() {
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
