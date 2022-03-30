import 'mocha';
import { assert } from 'chai';
import { SocketModeFunctions as func } from './SocketModeFunctions';
import {
  ReceiverMultipleAckError,
  AuthorizationError,
} from '../errors';
import { createFakeLogger } from '../test-helpers';
import { ReceiverEvent } from '../types';

describe('SocketModeFunctions', async () => {
  describe('Error handlers for event processing', async () => {
    const logger = createFakeLogger();

    describe('defaultProcessEventErrorHandler', async () => {
      it('should properly handle ReceiverMultipleAckError', async () => {
        const event: ReceiverEvent = {
          ack: async () => {},
          body: {},
        };
        const shouldBeAcked = await func.defaultProcessEventErrorHandler({
          error: new ReceiverMultipleAckError(),
          logger,
          event,
        });
        assert.isFalse(shouldBeAcked);
      });
      it('should properly handle AuthorizationError', async () => {
        const event: ReceiverEvent = {
          ack: async () => {},
          body: {},
        };
        const shouldBeAcked = await func.defaultProcessEventErrorHandler({
          error: new AuthorizationError('msg', new Error()),
          logger,
          event,
        });
        assert.isTrue(shouldBeAcked);
      });
    });
  });
});
