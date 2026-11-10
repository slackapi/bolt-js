import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  AppInitializationError,
  AuthorizationError,
  asCodedError,
  type CodedError,
  ContextMissingPropertyError,
  ErrorCode,
  ReceiverAuthenticityError,
  ReceiverMultipleAckError,
  UnknownError,
} from '../../src/errors';

describe('Errors', () => {
  it('has errors matching codes', () => {
    const errorMap = {
      [ErrorCode.AppInitializationError]: new AppInitializationError(),
      [ErrorCode.AuthorizationError]: new AuthorizationError('auth failed', new Error('auth failed')),
      [ErrorCode.ContextMissingPropertyError]: new ContextMissingPropertyError('foo', "can't find foo"),
      [ErrorCode.ReceiverAuthenticityError]: new ReceiverAuthenticityError(),
      [ErrorCode.ReceiverMultipleAckError]: new ReceiverMultipleAckError(),
      [ErrorCode.UnknownError]: new UnknownError(new Error('It errored')),
    };

    for (const [code, error] of Object.entries(errorMap)) {
      assert.equal((error as CodedError).code, code);
    }
  });

  it('wraps non-coded errors', () => {
    assert.ok(asCodedError(new Error('AHH!')) instanceof UnknownError);
  });

  it('passes coded errors through', () => {
    const error = new AppInitializationError();
    assert.equal(asCodedError(error), error);
  });
});
