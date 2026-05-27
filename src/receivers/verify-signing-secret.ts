import { AppInitializationError } from '../errors';

export function verifySigningSecret(signingSecret: unknown, signatureVerification: boolean): void {
  if (signatureVerification && !signingSecret) {
    throw new AppInitializationError(
      'signingSecret is required when signature verification is enabled. ' +
        'You can find your Signing Secret in your Slack App Settings.',
    );
  }
}
