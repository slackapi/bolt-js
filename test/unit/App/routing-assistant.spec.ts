import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import { Assistant } from '../../../src/Assistant';
import {
  FakeReceiver,
  type Override,
  createDummyAssistantThreadContextChangedEventMiddlewareArgs,
  createDummyAssistantThreadStartedEventMiddlewareArgs,
  createDummyAssistantUserMessageEventMiddlewareArgs,
  createFakeLogger,
  importApp,
  mergeOverrides,
  noopMiddleware,
  withConversationContext,
  withMemoryStore,
  withNoopAppMetadata,
  withNoopWebClient,
} from '../helpers';

type singleFakeConfig = {
  threadStarted: SinonSpy;
  threadContextChanged: SinonSpy;
  userMessage: SinonSpy;
};

function buildOverrides(secondOverrides: Override[]): Override {
  return mergeOverrides(
    withNoopAppMetadata(),
    withNoopWebClient(),
    ...secondOverrides,
    withMemoryStore(sinon.fake()),
    withConversationContext(sinon.fake.returns(noopMiddleware)),
  );
}

describe('App event() routing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeAck: SinonSpy;
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;
  let singleFakeConfig: singleFakeConfig;

  beforeEach(async () => {
    fakeReceiver = new FakeReceiver();
    fakeAck = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botId: '' };
    MockApp = await importApp(buildOverrides([]));
    app = new MockApp({
      logger: createFakeLogger(),
      receiver: fakeReceiver,
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
    });

    singleFakeConfig = {
      threadStarted: sinon.fake(),
      threadContextChanged: sinon.fake(),
      userMessage: sinon.fake(),
    };
  });

  it('should route `assistant_thread_started` event to a registered handler registered', async () => {
    const assistant = new Assistant(singleFakeConfig);
    app.assistant(assistant);
    await fakeReceiver.sendEvent({
      ...createDummyAssistantThreadStartedEventMiddlewareArgs(),
      ack: fakeAck,
    });

    sinon.assert.calledOnce(fakeAck);
    sinon.assert.calledOnce(singleFakeConfig.threadStarted);
    sinon.assert.notCalled(singleFakeConfig.threadContextChanged);
    sinon.assert.notCalled(singleFakeConfig.userMessage);
  });

  it('should route `assistant_thread_context_changed` event to a registered handler registered', async () => {
    const assistant = new Assistant(singleFakeConfig);
    app.assistant(assistant);
    await fakeReceiver.sendEvent({
      ...createDummyAssistantThreadContextChangedEventMiddlewareArgs(),
      ack: fakeAck,
    });

    sinon.assert.calledOnce(fakeAck);
    sinon.assert.notCalled(singleFakeConfig.threadStarted);
    sinon.assert.calledOnce(singleFakeConfig.threadContextChanged);
    sinon.assert.notCalled(singleFakeConfig.userMessage);
  });

  it('should route `message` event to a registered handler registered', async () => {
    const assistant = new Assistant(singleFakeConfig);
    app.assistant(assistant);
    await fakeReceiver.sendEvent({
      ...createDummyAssistantUserMessageEventMiddlewareArgs(),
      ack: fakeAck,
    });

    sinon.assert.calledOnce(fakeAck);
    sinon.assert.notCalled(singleFakeConfig.threadStarted);
    sinon.assert.notCalled(singleFakeConfig.threadContextChanged);
    sinon.assert.calledOnce(singleFakeConfig.userMessage);
  });

  it('should not execute handler if no routing found, but acknowledge event', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyAssistantThreadStartedEventMiddlewareArgs(),
      ack: fakeAck,
    });

    sinon.assert.calledOnce(fakeAck);
    sinon.assert.notCalled(singleFakeConfig.threadStarted);
    sinon.assert.notCalled(singleFakeConfig.threadContextChanged);
    sinon.assert.notCalled(singleFakeConfig.userMessage);
  });
});
