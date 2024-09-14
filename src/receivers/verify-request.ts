import { createHmac } from 'node:crypto';
import type { Logger } from '@slack/logger';
import tsscmp from 'tsscmp';

// ------------------------------
// HTTP module independent methods
// ------------------------------

const verifyErrorPrefix = 'Failed to verify authenticity';

export interface SlackRequestVerificationOptions {
  signingSecret: string;
  body: string;
  headers: {
    'x-slack-signature': string;
    'x-slack-request-timestamp': number;
  };
  nowMilliseconds?: number;
  logger?: Logger;
}

/**
 * Verifies the signature of an incoming request from Slack.
 * If the request is invalid, this method throws an exception with the error details.
 */
export function verifySlackRequest(options: SlackRequestVerificationOptions): void {
  const requestTimestampSec = options.headers['x-slack-request-timestamp'];
  const signature = options.headers['x-slack-signature'];
  if (Number.isNaN(requestTimestampSec)) {
    throw new Error(
      `${verifyErrorPrefix}: header x-slack-request-timestamp did not have the expected type (${requestTimestampSec})`,
    );
  }

  // Calculate time-dependent values
  const nowMs = options.nowMilliseconds ?? Date.now();
  const requestTimestampMaxDeltaMin = 5;
  const fiveMinutesAgoSec = Math.floor(nowMs / 1000) - 60 * requestTimestampMaxDeltaMin;

  // Enforce verification rules

  // Rule 1: Check staleness
  if (requestTimestampSec < fiveMinutesAgoSec) {
    throw new Error(
      `${verifyErrorPrefix}: x-slack-request-timestamp must differ from system time by no more than ${requestTimestampMaxDeltaMin
      } minutes or request is stale`,
    );
  }

  // Rule 2: Check signature
  // Separate parts of signature
  const [signatureVersion, signatureHash] = signature.split('=');
  // Only handle known versions
  if (signatureVersion !== 'v0') {
    throw new Error(`${verifyErrorPrefix}: unknown signature version`);
  }
  // Compute our own signature hash
  const hmac = createHmac('sha256', options.signingSecret);
  hmac.update(`${signatureVersion}:${requestTimestampSec}:${options.body}`);
  const ourSignatureHash = hmac.digest('hex');
  if (!signatureHash || !tsscmp(signatureHash, ourSignatureHash)) {
    throw new Error(`${verifyErrorPrefix}: signature mismatch`);
  }
}

/**
 * Verifies the signature of an incoming request from Slack.
 * If the request is invalid, this method returns false.
 */
export function isValidSlackRequest(options: SlackRequestVerificationOptions): boolean {
  try {
    verifySlackRequest(options);
    return true;
  } catch (e) {
    if (options.logger) {
      options.logger.debug(`Signature verification error: ${e}`);
    }
  }
  return false;
}
