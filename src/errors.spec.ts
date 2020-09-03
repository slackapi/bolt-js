// tslint:disable:no-implicit-dependencies
import { assert } from 'chai';
import {
  asCodedError,
  ErrorCode,
  CodedError,
  AppInitializationError,
  AuthorizationError,
  ContextMissingPropertyError,
  ReceiverAuthenticityError,
  ReceiverMultipleAckError,
  UnknownError,
} from './errors';

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

    Object.entries(errorMap).forEach(([code, error]) => {
      assert.equal((error as CodedError).code, code);
    });
  });

  it('wraps non-coded errors', () => {
    assert.instanceOf(asCodedError(new Error('AHH!')), UnknownError);
  });

  it('passes coded errors through', () => {
    const error = new AppInitializationError();
    assert.equal(asCodedError(error), error);
  });
});
