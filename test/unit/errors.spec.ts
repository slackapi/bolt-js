import { assert } from 'chai';
import {
  AppInitializationError,
  AuthorizationError,
  type CodedError,
  ContextMissingPropertyError,
  ErrorCode,
  ReceiverAuthenticityError,
  ReceiverMultipleAckError,
  UnknownError,
  asCodedError,
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
    assert.instanceOf(asCodedError(new Error('AHH!')), UnknownError);
  });

  it('passes coded errors through', () => {
    const error = new AppInitializationError();
    assert.equal(asCodedError(error), error);
  });
});
