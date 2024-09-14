/**
 * Helper to verify redirect uri and redirect uri path exist and are consistent
 * when supplied.
 */
import { AppInitializationError } from '../errors';
import type { HTTPReceiverInstallerOptions, HTTPReceiverOptions } from './HTTPReceiver';

export interface RedirectOptions {
  redirectUri?: HTTPReceiverOptions['redirectUri'];
  redirectUriPath?: HTTPReceiverInstallerOptions['redirectUriPath'];
}

export function verifyRedirectOpts({ redirectUri, redirectUriPath }: RedirectOptions): void {
  // if redirectUri is supplied, redirectUriPath is required
  if (redirectUri && !redirectUriPath) {
    throw new AppInitializationError(
      ' You have set a redirectUri but not a matching redirectUriPath.' +
        ' Please provide this via installerOptions.redirectUriPath' +
        ' Note: These should be consistent, e.g. https://example.com/redirect and /redirect',
    );
  }
  // if both redirectUri and redirectUri are supplied, they must be consistent
  if (redirectUri && redirectUriPath && !redirectUri?.endsWith(redirectUriPath)) {
    throw new AppInitializationError(
      'redirectUri and installerOptions.redirectUriPath should be consistent' +
        ' e.g. https://example.com/redirect and /redirect',
    );
  }
}
