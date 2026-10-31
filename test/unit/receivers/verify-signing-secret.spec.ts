import { assert } from 'chai';
import { ErrorCode } from '../../../src/errors';
import { verifySigningSecret } from '../../../src/receivers/verify-signing-secret';

describe('verifySigningSecret', () => {
  it('should throw AppInitializationError when signingSecret is empty string and verification enabled', () => {
    try {
      verifySigningSecret('', true);
      assert.fail();
    } catch (error) {
      assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
    }
  });

  it('should throw AppInitializationError when signingSecret is null and verification enabled', () => {
    try {
      verifySigningSecret(null, true);
      assert.fail();
    } catch (error) {
      assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
    }
  });

  it('should throw AppInitializationError when signingSecret is undefined and verification enabled', () => {
    try {
      verifySigningSecret(undefined, true);
      assert.fail();
    } catch (error) {
      assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
    }
  });

  it('should not throw when signingSecret is empty but signatureVerification is false', () => {
    assert.doesNotThrow(() => verifySigningSecret('', false));
    assert.doesNotThrow(() => verifySigningSecret(null, false));
    assert.doesNotThrow(() => verifySigningSecret(undefined, false));
  });

  it('should not throw when signingSecret is a valid string and verification enabled', () => {
    assert.doesNotThrow(() => verifySigningSecret('my-signing-secret', true));
  });
});
