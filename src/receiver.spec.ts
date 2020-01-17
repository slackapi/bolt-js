// tslint:disable:no-implicit-dependencies
import { assert } from 'chai';
import querystring from 'querystring';
import sinon, { SinonFakeTimers } from 'sinon';
import { parseRequestBody } from '../dist';
import { CodedError, ReceiverAuthenticityError } from './errors';
import { verifyRequestSignature } from './receiver';
import { StringIndexed } from './types/helpers';

describe('receiver', () => {
  describe('verifyRequestSignature', () => {
    let clock: SinonFakeTimers;

    beforeEach(() => {
      // requestTimestamp = 1531420618 means this timestamp
      clock = sinon.useFakeTimers(new Date('Thu Jul 12 2018 11:36:58 GMT-0700').getTime());
    });

    afterEach(() => {
      clock.restore();
    });

    // These values are example data in the official doc
    // https://api.slack.com/docs/verifying-requests-from-slack
    const signingSecret = '8f742231b10e8888abcd99yyyzzz85a5';
    const signature = 'v0=a2114d57b48eac39b9ad189dd8316235a7b4a8d21a10bd27519666489c69b503';
    const requestTimestamp = 1531420618;
    const body = 'token=xyzz0WbapA4vBCDEFasx0q6G&team_id=T1DC2JH3J&team_domain=testteamnow&channel_id=G8PSS9T3V&channel_name=foobar&user_id=U2CERLKJA&user_name=roadrunner&command=%2Fwebhook-collect&text=&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT1DC2JH3J%2F397700885554%2F96rGlfmibIGlgcZRskXaIFfN&trigger_id=398738663015.47445629121.803a0bc887a14d10d2c447fce8b6703c';
    const headers = {
      'x-slack-signature': signature,
      'x-slack-request-timestamp': requestTimestamp,
    };

    function catchVerifyErrors(headers: StringIndexed): CodedError | undefined {
      const  {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': requestTimestamp,
      } = headers;

      let error;

      try {
        verifyRequestSignature(signingSecret, body, signature, requestTimestamp);
      } catch (err) {
        error = err;
      }

      return error;
    }

    it('should verify requests', () => {
      const error = catchVerifyErrors(headers);
      // Assert
      assert.isUndefined(error);
    });

    it('should detect headers missing signature', () => {
      const error = catchVerifyErrors({
        // 'x-slack-signature': signature ,
        'x-slack-request-timestamp': requestTimestamp,
      }) as CodedError;
      assert.instanceOf(error, ReceiverAuthenticityError);
      assert.include(error.message, 'Some headers are missing.');
    });

    it('should detect headers missing timestamp', () => {
      const error = catchVerifyErrors({
        'x-slack-signature': signature,
        /*'x-slack-request-timestamp': requestTimestamp*/
      });

      assert.instanceOf(error, ReceiverAuthenticityError);
      assert.include(error?.message, 'Some headers are missing.');
    });

    it('should detect invalid timestamp header', () => {
      const error = catchVerifyErrors({
        ...headers,
        'x-slack-request-timestamp': 'Hello there!',
      });

      assert.instanceOf(error, ReceiverAuthenticityError);
      assert.include(error?.message, 'Timestamp is invalid.');
    });

    it('should detect too old timestamp', () => {
      const error = catchVerifyErrors({
        ...headers,
        'x-slack-request-timestamp': 0,
      });

      assert.instanceOf(error, ReceiverAuthenticityError);
      assert.include(error?.message, 'Timestamp is too old.');
    });

    it('should detect signature mismatch', () => {
      const error = catchVerifyErrors({
        ...headers,
        'x-slack-request-timestamp': requestTimestamp + 10,
      });

      assert.instanceOf(error, ReceiverAuthenticityError);
      assert.include(error?.message, 'Signature mismatch.');
    });
  });

  describe('parseRequestBody', () => {
    const stringBody = 'token=xyzz0WbapA4vBCDEFasx0q6G&team_id=T1DC2JH3J&team_domain=testteamnow&channel_id=G8PSS9T3V&channel_name=foobar&user_id=U2CERLKJA&user_name=roadrunner&command=%2Fwebhook-collect&text=&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT1DC2JH3J%2F397700885554%2F96rGlfmibIGlgcZRskXaIFfN&trigger_id=398738663015.47445629121.803a0bc887a14d10d2c447fce8b6703c';
    const jsonBody = querystring.parse(stringBody);

    it('parses form-urlencoded bodies', () => {
      assert.deepEqual(parseRequestBody(stringBody, 'application/x-www-form-urlencoded'), jsonBody);
    });

    it('parses form-urlencoded bodies with a payload', () => {
      const payload = `payload=${JSON.stringify(jsonBody)}`;
      assert.deepEqual(parseRequestBody(payload, 'application/x-www-form-urlencoded'), jsonBody);
    });

    it('parses json bodies', () => {
      assert.deepEqual(parseRequestBody(JSON.stringify(jsonBody), 'application/json'), jsonBody);
    });
  });
});
