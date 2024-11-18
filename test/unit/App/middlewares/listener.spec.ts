import { assert } from 'chai';
import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../../src/App';
import { ErrorCode, isCodedError } from '../../../../src/errors';
import { FakeReceiver, createDummyReceiverEvent, importApp } from '../../helpers';

describe('App listener middleware processing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeErrorHandler: SinonSpy;
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let app: App;

  const eventType = 'some_event_type';
  const dummyReceiverEvent = createDummyReceiverEvent(eventType);

  beforeEach(async () => {
    fakeReceiver = new FakeReceiver();
    fakeErrorHandler = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botId: '' };

    const MockAppNoOverrides = await importApp();
    app = new MockAppNoOverrides({
      receiver: fakeReceiver,
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
    });
    app.error(fakeErrorHandler);
  });

  it('should bubble up errors in listeners to the global error handler', async () => {
    const errorToThrow = new Error('listener error');

    app.event(eventType, async () => {
      throw errorToThrow;
    });
    await fakeReceiver.sendEvent(dummyReceiverEvent);

    assert(fakeErrorHandler.calledOnce);
    const error = fakeErrorHandler.firstCall.args[0];
    assert.equal(error.code, ErrorCode.UnknownError);
    assert.equal(error.original, errorToThrow);
  });

  it('should aggregate multiple errors in listeners for the same incoming event', async () => {
    const errorsToThrow = [new Error('first listener error'), new Error('second listener error')];
    function createThrowingListener(toBeThrown: Error): () => Promise<void> {
      return async () => {
        throw toBeThrown;
      };
    }

    app.event(eventType, createThrowingListener(errorsToThrow[0]));
    app.event(eventType, createThrowingListener(errorsToThrow[1]));
    await fakeReceiver.sendEvent(dummyReceiverEvent);

    assert(fakeErrorHandler.calledOnce);
    const error = fakeErrorHandler.firstCall.args[0];
    assert.ok(isCodedError(error));
    assert(error.code === ErrorCode.MultipleListenerError);
    assert.isArray(error.originals);
    if (error.originals) assert.sameMembers(error.originals, errorsToThrow);
  });

  // https://github.com/slackapi/bolt-js/issues/1457
  it('should not cause a runtime exception if the last listener middleware invokes next()', async () => {
    await new Promise<void>((resolve, reject) => {
      app.event('app_mention', async ({ next }) => {
        try {
          await next();
          resolve();
        } catch (e) {
          reject(e);
        }
      });
      fakeReceiver.sendEvent(createDummyReceiverEvent('app_mention'));
    });
  });
});
