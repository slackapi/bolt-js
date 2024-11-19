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

function buildOverrides(secondOverrides: Override[]): Override {
  return mergeOverrides(
    withNoopAppMetadata(),
    withNoopWebClient(),
    ...secondOverrides,
    withMemoryStore(sinon.fake()),
    withConversationContext(sinon.fake.returns(noopMiddleware)),
  );
}

describe('App assistant routing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeAck: SinonSpy;
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;
  let fakeConfig: {
    threadStarted: SinonSpy;
    threadContextChanged: SinonSpy;
    userMessage: SinonSpy;
  };

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

    fakeConfig = {
      threadStarted: sinon.fake(),
      threadContextChanged: sinon.fake(),
      userMessage: sinon.fake(),
    };
  });

  it('should route `assistant_thread_started` event to a registered handler', async () => {
    const assistant = new Assistant(fakeConfig);
    app.assistant(assistant);
    await fakeReceiver.sendEvent({
      ...createDummyAssistantThreadStartedEventMiddlewareArgs(),
      ack: fakeAck,
    });

    sinon.assert.calledOnce(fakeAck);
    sinon.assert.calledOnce(fakeConfig.threadStarted);
    sinon.assert.notCalled(fakeConfig.threadContextChanged);
    sinon.assert.notCalled(fakeConfig.userMessage);
  });

  it('should route `assistant_thread_context_changed` event to a registered handler', async () => {
    const assistant = new Assistant(fakeConfig);
    app.assistant(assistant);
    await fakeReceiver.sendEvent({
      ...createDummyAssistantThreadContextChangedEventMiddlewareArgs(),
      ack: fakeAck,
    });

    sinon.assert.calledOnce(fakeAck);
    sinon.assert.notCalled(fakeConfig.threadStarted);
    sinon.assert.calledOnce(fakeConfig.threadContextChanged);
    sinon.assert.notCalled(fakeConfig.userMessage);
  });

  it('should route a message assistant scoped event to a registered handler', async () => {
    const assistant = new Assistant(fakeConfig);
    app.assistant(assistant);
    await fakeReceiver.sendEvent({
      ...createDummyAssistantUserMessageEventMiddlewareArgs(),
      ack: fakeAck,
    });

    sinon.assert.calledOnce(fakeAck);
    sinon.assert.notCalled(fakeConfig.threadStarted);
    sinon.assert.notCalled(fakeConfig.threadContextChanged);
    sinon.assert.calledOnce(fakeConfig.userMessage);
  });

  it('should not execute handler if no routing found, but acknowledge event', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyAssistantThreadStartedEventMiddlewareArgs(),
      ack: fakeAck,
    });

    sinon.assert.calledOnce(fakeAck);
    sinon.assert.notCalled(fakeConfig.threadStarted);
    sinon.assert.notCalled(fakeConfig.threadContextChanged);
    sinon.assert.notCalled(fakeConfig.userMessage);
  });
});
