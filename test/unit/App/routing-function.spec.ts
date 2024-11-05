import { assert } from 'chai';
import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import {
  FakeReceiver,
  type Override,
  createDummyCustomFunctionMiddlewareArgs,
  createFakeLogger,
  importApp,
  mergeOverrides,
  noopMiddleware,
  withConversationContext,
  withMemoryStore,
  withNoopAppMetadata,
  withNoopWebClient,
} from '../helpers';

function buildOverrides(secondOverrides: Override[]): Override {
  return mergeOverrides(
    withNoopAppMetadata(),
    withNoopWebClient(),
    ...secondOverrides,
    withMemoryStore(sinon.fake()),
    withConversationContext(sinon.fake.returns(noopMiddleware)),
  );
}

describe('App function() routing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeHandler: SinonSpy;
  const fakeLogger = createFakeLogger();
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;

  beforeEach(async () => {
    fakeLogger.error.reset();
    fakeReceiver = new FakeReceiver();
    fakeHandler = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botId: '' };
    MockApp = await importApp(buildOverrides([]));
    app = new MockApp({
      logger: fakeLogger,
      receiver: fakeReceiver,
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
    });
  });
  describe('for function executed events', () => {
    it('should route a function executed event to a handler registered with `function(string)` that matches the callback ID', async () => {
      app.function('my_id', fakeHandler);
      const args = createDummyCustomFunctionMiddlewareArgs({
        callbackId: 'my_id',
        options: { autoAcknowledge: false },
      });
      await fakeReceiver.sendEvent({
        ack: args.ack,
        body: args.body,
      });
      sinon.assert.called(fakeHandler);
    });

    it('should route a function executed event to a handler with the proper arguments', async () => {
      const testInputs = { test: true };
      const testHandler = sinon.spy(async ({ inputs, complete, fail, client }) => {
        assert.equal(inputs, testInputs);
        assert.typeOf(complete, 'function');
        assert.typeOf(fail, 'function');
        assert.equal(client.token, 'xwfp-valid');
      });
      app.function('my_id', testHandler);
      const args = createDummyCustomFunctionMiddlewareArgs({
        callbackId: 'my_id',
        inputs: testInputs,
        options: { autoAcknowledge: false },
      });
      await fakeReceiver.sendEvent({
        ack: args.ack,
        body: args.body,
      });
      sinon.assert.called(testHandler);
    });

    it('should route a function executed event to a handler and auto ack by default', async () => {
      app.function('my_id', fakeHandler);
      const args = createDummyCustomFunctionMiddlewareArgs({ callbackId: 'my_id' });
      let isAck = false;
      await fakeReceiver.sendEvent({
        ack: async () => {
          isAck = true;
        },
        body: args.body,
      });
      sinon.assert.called(fakeHandler);
      assert.isTrue(isAck);
    });

    it('should route a function executed event to a handler and NOT auto ack if autoAcknowledge is false', async () => {
      app.function('my_id', { autoAcknowledge: false }, fakeHandler);
      const args = createDummyCustomFunctionMiddlewareArgs({ callbackId: 'my_id' });
      let isAck = false;
      await fakeReceiver.sendEvent({
        ack: async () => {
          isAck = true;
        },
        body: args.body,
      });
      sinon.assert.called(fakeHandler);
      assert.isFalse(isAck);
    });
  });
});
