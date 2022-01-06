import 'mocha';
// import { assert } from 'chai';
// import sinon from 'sinon';
// import rewiremock from 'rewiremock';
// import { WebClient } from '@slack/web-api';
// import { Subscription } from './Subscription';
// import { Override } from './test-helpers';
// import { AllMiddlewareArgs, AnyMiddlewareArgs, Middleware } from './types';

// async function importSubscription(overrides: Override = {}): Promise<typeof import('./Subscription')> {
//   return rewiremock.module(() => import('./Subscription'), overrides);
// }

// const NOOP_FXN = sinon.stub();

// const MOCK_SUBSCRIPTION_CONFIG_SINGLE = {
//   onCreate: NOOP_FXN,
//   onConfigure: NOOP_FXN,
//   onDeleted: NOOP_FXN,
// };

// const MOCK_SUBSCRIPTION_CONFIG_MULTIPLE = {
//   onCreate: [NOOP_FXN, NOOP_FXN],
//   onConfigure: [NOOP_FXN, NOOP_FXN],
//   onDeleted: [NOOP_FXN, NOOP_FXN, NOOP_FXN],
// };

describe('Subscription', () => {
  describe('constructor()', () => {
    it('should accept config as single functions', async () => {
    });
    it('should accept config as multiple functions', async () => {
    });
  });

  describe('validate()', () => {
    it('should throw an error if id supplied is not a string', async () => {
    });
    it('should throw an error if config object missing required keys', async () => {
    });
    it('should throw an error if missing middleware fxn', async () => {
    });
    it('keys must contain a middleware fxn or array', async () => {
    });
    it('if array, it must contain middleware fxns', async () => {
    });
  });

  describe('getMiddleware()', () => {
    it('should not call next() if a notification_subscription_* event', async () => {
    });
    it('should call next if not a notification_subscription_* event', async () => {
    });
  });

  describe('isSubscriptionInteraction', () => {
    it('returns true for valid types', async () => {
    });
    it('returns false for invalid types', async () => {});
  });

  describe('matchesConstraints()', () => {
    // TODO: Implement
  });

  describe('getSubMiddleware', () => {
    it('handles create requested', async () => {});
    it('handles configure requested', async () => {});
    it('handles deleted', async () => {});
  });

  describe('processSubMiddleware()', () => {
    it('should invoke each provided middleware supplied by user', async () => {});
  });

  describe('prepareSubArgs()', () => {
    it('should remove next() from original args', async () => {});
    describe('create_requested args', () => {
      it('should contain the configure() utility method', async () => {});
      it('should contain the say() utility method', async () => {});
    });
    describe('configure_requested args', () => {
      it('should contain the configure() utility method', async () => {});
    });
  });

  describe('createConfigure', () => {
    it('should call views.open', async () => {});
  });
});

// function mockNotificationSubscriptionCreateRequested() {
//   return {
//     body: {},
//     payload: {},
//     context: {},
//   };
// }

// function mockNotificationSubscriptionConfigureRequested() {
//   return {
//     body: {},
//     payload: {},
//     context: {},
//   };
// }

// function mockNotificationSubscriptionDeleted() {
//   return {
//     body: {},
//   };
// }
