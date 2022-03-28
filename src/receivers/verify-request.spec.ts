import 'mocha';
import { assert } from 'chai';
import { createHmac } from 'crypto';
import { isValidSlackRequest, verifySlackRequest } from './verify-request';

describe('Request verification', async () => {
  const signingSecret = 'secret';

  describe('verifySlackRequest', async () => {
    it('should judge a valid request', async () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const rawBody = '{"foo":"bar"}';
      const hmac = createHmac('sha256', signingSecret);
      hmac.update(`v0:${timestamp}:${rawBody}`);
      const signature = hmac.digest('hex');
      verifySlackRequest({
        signingSecret,
        headers: {
          'x-slack-signature': `v0=${signature}`,
          'x-slack-request-timestamp': timestamp,
        },
        body: rawBody,
      });
    });
    it('should detect an invalid timestamp', async () => {
      const timestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes
      const rawBody = '{"foo":"bar"}';
      const hmac = createHmac('sha256', signingSecret);
      hmac.update(`v0:${timestamp}:${rawBody}`);
      const signature = hmac.digest('hex');
      try {
        verifySlackRequest({
          signingSecret,
          headers: {
            'x-slack-signature': `v0=${signature}`,
            'x-slack-request-timestamp': timestamp,
          },
          body: rawBody,
        });
      } catch (e) {
        assert.equal((e as any).message, 'Failed to verify authenticity: stale');
      }
    });
    it('should detect an invalid signature', async () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const rawBody = '{"foo":"bar"}';
      try {
        verifySlackRequest({
          signingSecret,
          headers: {
            'x-slack-signature': 'v0=invalid-signature',
            'x-slack-request-timestamp': timestamp,
          },
          body: rawBody,
        });
      } catch (e) {
        assert.equal((e as any).message, 'Failed to verify authenticity: signature mismatch');
      }
    });
  });

  describe('isValidSlackRequest', async () => {
    it('should judge a valid request', async () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const rawBody = '{"foo":"bar"}';
      const hmac = createHmac('sha256', signingSecret);
      hmac.update(`v0:${timestamp}:${rawBody}`);
      const signature = hmac.digest('hex');
      assert.isTrue(isValidSlackRequest({
        signingSecret,
        headers: {
          'x-slack-signature': `v0=${signature}`,
          'x-slack-request-timestamp': timestamp,
        },
        body: rawBody,
      }));
    });
    it('should detect an invalid timestamp', async () => {
      const timestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes
      const rawBody = '{"foo":"bar"}';
      const hmac = createHmac('sha256', signingSecret);
      hmac.update(`v0:${timestamp}:${rawBody}`);
      const signature = hmac.digest('hex');
      assert.isFalse(isValidSlackRequest({
        signingSecret,
        headers: {
          'x-slack-signature': `v0=${signature}`,
          'x-slack-request-timestamp': timestamp,
        },
        body: rawBody,
      }));
    });
    it('should detect an invalid signature', async () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const rawBody = '{"foo":"bar"}';
      assert.isFalse(isValidSlackRequest({
        signingSecret,
        headers: {
          'x-slack-signature': 'v0=invalid-signature',
          'x-slack-request-timestamp': timestamp,
        },
        body: rawBody,
      }));
    });
  });
});
