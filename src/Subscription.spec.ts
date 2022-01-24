import 'mocha';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { Block, View } from '@slack/types';
import { PlainTextElement, WebClient } from '@slack/web-api';
import {
  Subscription,
  SubscriptionOptions,
  SubscriptionMiddleware,
} from './Subscription';
import { Override } from './test-helpers';
import {
  SlackSubscriptionMiddlewareArgs,
  AllMiddlewareArgs,
  SubscriptionOnCreateMiddlewareArgs,
} from './types';

async function importSubscription(overrides: Override = {}): Promise<typeof import('./Subscription')> {
  return rewiremock.module(() => import('./Subscription'), overrides);
}

const NOOP_FXN = async () => {};

const MOCK_SUBSCRIPTION_CONFIG_SINGLE = {
  onCreate: NOOP_FXN,
  onConfigure: NOOP_FXN,
  onDeleted: NOOP_FXN,
};

const MOCK_SUBSCRIPTION_CONFIG_MULTIPLE = {
  onCreate: [NOOP_FXN, NOOP_FXN],
  onConfigure: [NOOP_FXN, NOOP_FXN],
  onDeleted: [NOOP_FXN, NOOP_FXN, NOOP_FXN],
};

describe('Subscription', () => {
  describe('constructor()', () => {
    it('should accept config as single functions', async () => {
      const sub = new Subscription('id', MOCK_SUBSCRIPTION_CONFIG_SINGLE as unknown as SubscriptionOptions);
      assert.isNotNull(sub);
    });
    it('should accept config as multiple functions', async () => {
      const sub = new Subscription('id', MOCK_SUBSCRIPTION_CONFIG_MULTIPLE as unknown as SubscriptionOptions);
      assert.isNotNull(sub);
    });
  });

  describe('validate()', () => {
    it('should throw an error if id supplied is not a string', async () => {
      const { validate } = await importSubscription();

      const badId = {} as string;
      const tryValidate = () => validate(badId, MOCK_SUBSCRIPTION_CONFIG_SINGLE);
      assert.throws(tryValidate, Error, 'Subscription id must be a string');
    });
    it('should throw an error if config object missing required keys', async () => {
      const { validate } = await importSubscription();
      const badConfig = {
        onConfigure: NOOP_FXN,
        onDeleted: NOOP_FXN,
      } as unknown as SubscriptionOptions;
      const tryValidate = () => validate('id', badConfig);
      assert.throws(tryValidate, Error, 'Subscription handling options provided are missing required keys: onCreate');
    });
    it('keys must contain a middleware fxn or array', async () => {
      const { validate } = await importSubscription();
      const badConfig = {
        onCreate: 'not a middleware fxn',
        onConfigure: NOOP_FXN,
        onDeleted: NOOP_FXN,
      } as unknown as SubscriptionOptions;
      const tryValidate = () => validate('id', badConfig);
      assert.throws(tryValidate, Error, 'Subscription handling option onCreate must be a function or an array of functions');

      const badConfig2 = {
        onCreate: false,
        onConfigure: NOOP_FXN,
        onDeleted: NOOP_FXN,
      } as unknown as SubscriptionOptions;
      const tryValidate2 = () => validate('id', badConfig2);
      assert.throws(tryValidate2, Error, 'You must supply a middleware for onCreate');

      const badConfig3 = {
        onCreate: NOOP_FXN,
        onConfigure: [NOOP_FXN, 'not a middleware fxn'],
      } as unknown as SubscriptionOptions;
      const tryValidate3 = () => validate('id', badConfig3);
      assert.throws(tryValidate3, Error, 'Subscription handling option(s) supplied as arrays must contain only functions');
    });
  });

  describe('getMiddleware()', () => {
    it('should NOT call next() for notification_subscription_* event', async () => {
      const ws = new Subscription('id', MOCK_SUBSCRIPTION_CONFIG_SINGLE as unknown as SubscriptionOptions);
      const middleware = ws.getMiddleware();
      const mockValidCreateArgs = mockNotificationSubscriptionCreateRequested(true) as unknown as
      SlackSubscriptionMiddlewareArgs & AllMiddlewareArgs;
      const mockNext = sinon.spy();
      mockValidCreateArgs.next = mockNext;

      await middleware(mockValidCreateArgs);
      assert(mockNext.notCalled);
    });
    it('should call next() if NOT a notification_subscription_* event', async () => {
      const ws = new Subscription('id', MOCK_SUBSCRIPTION_CONFIG_SINGLE as unknown as SubscriptionOptions);
      const middleware = ws.getMiddleware();
      const mockInvalidCreateArgs = mockNotificationSubscriptionCreateRequested(false) as unknown as
      SlackSubscriptionMiddlewareArgs & AllMiddlewareArgs;
      const mockNext = sinon.spy();
      mockInvalidCreateArgs.next = mockNext;

      await middleware(mockInvalidCreateArgs);
      assert(mockNext.called);
    });
  });

  describe('isSubscriptionInteraction', () => {
    it('returns true for valid types', async () => {
      const { isSubscriptionInteraction } = await importSubscription();
      const mockValidCreateArgs = mockNotificationSubscriptionCreateRequested(true) as unknown as
      SlackSubscriptionMiddlewareArgs & AllMiddlewareArgs;
      assert.isTrue(isSubscriptionInteraction(mockValidCreateArgs));
    });
    it('returns false for invalid types', async () => {
      const { isSubscriptionInteraction } = await importSubscription();
      const mockInvalidCreateArgs = mockNotificationSubscriptionCreateRequested(false) as unknown as
      SlackSubscriptionMiddlewareArgs & AllMiddlewareArgs;
      assert.isFalse(isSubscriptionInteraction(mockInvalidCreateArgs));
    });
  });

  describe('matchesConstraints()', () => {
    // TODO: Implement
  });

  describe('processSubMiddleware()', () => {
    it('should invoke each provided middleware supplied by user', async () => {
      // setup mock middleware
      const mw1 = sinon.spy();
      const mw2 = sinon.spy();
      const mockMiddleware = [mw1, mw2] as SubscriptionMiddleware;

      // setup mock args
      const mockArgs = mockNotificationSubscriptionCreateRequested(true) as unknown as
      SlackSubscriptionMiddlewareArgs & AllMiddlewareArgs;
      const { processSubMiddleware } = await importSubscription();
      await processSubMiddleware(mockArgs, mockMiddleware);

      // assert
      assert(mw1.called);
      assert(mw2.called);
    });
  });

  describe('prepareSubArgs()', () => {
    it('should remove next() from original args', async () => {
      const { prepareSubArgs } = await importSubscription();
      const mockValidCreateArgs = mockNotificationSubscriptionCreateRequested(true) as unknown as AllMiddlewareArgs;
      const mockPreparedArgs = prepareSubArgs(mockValidCreateArgs);
      assert.isUndefined(mockPreparedArgs.next);
    });
    describe('notification_subscription_create_requested args', () => {
      it('should contain the configure() utility method', async () => {
        const { prepareSubArgs } = await importSubscription();
        const mockValidCreateArgs = mockNotificationSubscriptionCreateRequested(true) as unknown as AllMiddlewareArgs;
        const mockPreparedArgs = prepareSubArgs(mockValidCreateArgs) as SubscriptionOnCreateMiddlewareArgs;
        assert.exists(mockPreparedArgs.configure);
      });
    });
    describe('notification_subscription_configure_requested args', () => {
      it('should contain the configure() utility method', async () => {
        const { prepareSubArgs } = await importSubscription();
        const mockValidCreateArgs = mockNotificationSubscriptionConfigureRequested(true) as
        unknown as AllMiddlewareArgs;
        const mockPreparedArgs = prepareSubArgs(mockValidCreateArgs) as SubscriptionOnCreateMiddlewareArgs;
        assert.exists(mockPreparedArgs.configure);
      });
    });
  });

  describe('configure()', () => {
    it('should call views.open', async () => {
      const mockClient = { views: { open: sinon.spy() } };
      // setup mock args
      const mockValidCreateArgs = mockNotificationSubscriptionCreateRequested(true) as unknown as
      SlackSubscriptionMiddlewareArgs & AllMiddlewareArgs;
      mockValidCreateArgs.client = mockClient as unknown as WebClient;
      // setup configure() function
      const { createConfigure } = await importSubscription();
      const mockConfigureFxn = createConfigure(mockValidCreateArgs);
      // mock view
      const mockView = {
        type: 'app_notification_subscription_configuration',
        title: {} as PlainTextElement,
        blocks: [] as Block[],
      } as unknown as View;
      await mockConfigureFxn(mockView);
      assert(mockClient.views.open.called);
    });
  });
});

function mockNotificationSubscriptionCreateRequested(isValid: boolean) {
  return {
    body: {
      type: isValid ? 'notification_subscription_create_requested' : 'something_else',
    },
    payload: {
      type: isValid ? 'notification_subscription_create_requested' : 'something_else',
      action_id: 'action_id',
    },
    context: {},
    next: NOOP_FXN,
  };
}

function mockNotificationSubscriptionConfigureRequested(isValid: boolean) {
  return {
    body: {
      type: isValid ? 'notification_subscription_configure_requested' : 'something_else',
    },
    payload: {
      type: isValid ? 'notification_subscription_configure_requested' : 'something_else',
      action_id: 'action_id',
    },
    context: {},
    next: NOOP_FXN,
  };
}
