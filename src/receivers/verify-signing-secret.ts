import { AppInitializationError } from '../errors';

export function verifySigningSecret(signingSecret: string | undefined | null, signatureVerification: boolean): void {
  if (signatureVerification && !signingSecret) {
    throw new AppInitializationError(
      'signingSecret is required when signature verification is enabled. ' +
        'You can find your Signing Secret in your Slack App Settings.',
    );
  }
}
