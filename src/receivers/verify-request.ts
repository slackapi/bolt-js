/**
 * Functions used to verify the authenticity of incoming HTTP requests from Slack.
 *
 * The functions in this file are intentionally generic (don't depend on any particular web framework) and
 * time-independent (for testing) so they can be used in a wide variety of applications. The intention is to distribute
 * these functions in its own package.
 *
 * For now, there is some duplication between the contents of this file and ExpressReceiver.ts. Later, the duplication
 * can be reduced by implementing the equivalent functionality in terms of the functions in this file.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import type { Logger } from '@slack/logger';

import { createHmac } from 'crypto';
import rawBody from 'raw-body';
import tsscmp from 'tsscmp';

export interface VerifyOptions {
  signingSecret: string;
  nowMs?: () => number;
  logger?: Logger;
}

export interface BufferedIncomingMessage extends IncomingMessage {
  rawBody: Buffer;
}

/**
 * Verify the authenticity of an incoming HTTP request from Slack and buffer the HTTP body.
 *
 * When verification succeeds, the returned promise is resolved. When verification fails, the returned promise is
 * rejected with an error describing the reason. IMPORTANT: The error messages may contain sensitive information about
 * failures, do not return the error message text to users in a production environment. It's recommended to catch all
 * errors and return an opaque failure (HTTP status code 401, no body).
 *
 * Verification requires consuming `req` as a Readable stream. If the `req` was consumed before this function is called,
 * then this function expects it to be stored as a Buffer at `req.rawBody`. This is a convention used by infrastructure
 * platforms such as Google Cloud Platform. When the function returns, the buffered body is stored at the `req.rawBody`
 * property for further handling.
 *
 * The function is designed to be curry-able for use as a standard http RequestListener, and therefore keeps `req` and
 * `res` are the last arguments. However, the function is also async, which means when it is curried for use as a
 * RequestListener, the caller should also capture and use the return value.
 */
export async function verify(
  options: VerifyOptions,
  req: IncomingMessage,
  _res?: ServerResponse, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<BufferedIncomingMessage> {
  const { signingSecret } = options;

  // Consume the readable stream (or use the previously consumed readable stream)
  const bufferedReq = await bufferIncomingMessage(req);

  // Find the relevant request headers
  const signature = getHeader(req, 'x-slack-signature');
  const requestTimestampSec = Number(getHeader(req, 'x-slack-request-timestamp'));
  if (Number.isNaN(requestTimestampSec)) {
    throw new Error(
      `${verifyErrorPrefix}: header x-slack-request-timestamp did not have the expected type (${requestTimestampSec})`,
    );
  }

  // Calculate time-dependent values
  const nowMsFn = options.nowMs ?? (() => Date.now());
  const nowMs = nowMsFn();
  const fiveMinutesAgoSec = Math.floor(nowMs / 1000) - 60 * 5;

  // Enforce verification rules

  // Rule 1: Check staleness
  if (requestTimestampSec < fiveMinutesAgoSec) {
    throw new Error(`${verifyErrorPrefix}: stale`);
  }

  // Rule 2: Check signature
  // Separate parts of signature
  const [signatureVersion, signatureHash] = signature.split('=');
  // Only handle known versions
  if (signatureVersion !== 'v0') {
    throw new Error(`${verifyErrorPrefix}: unknown signature version`);
  }
  // Compute our own signature hash
  const hmac = createHmac('sha256', signingSecret);
  hmac.update(`${signatureVersion}:${requestTimestampSec}:${bufferedReq.rawBody.toString()}`);
  const ourSignatureHash = hmac.digest('hex');
  if (!tsscmp(signatureHash, ourSignatureHash)) {
    throw new Error(`${verifyErrorPrefix}: signature mismatch`);
  }

  // Checks have passed! Return the value that has a side effect (the buffered request)
  return bufferedReq;
}

async function bufferIncomingMessage(req: IncomingMessage): Promise<BufferedIncomingMessage> {
  if (isBufferedIncomingMessage(req)) {
    return req;
  }
  const bufferedRequest = req as BufferedIncomingMessage;
  bufferedRequest.rawBody = await rawBody(req);
  return bufferedRequest;
}

function isBufferedIncomingMessage(req: IncomingMessage): req is BufferedIncomingMessage {
  return Buffer.isBuffer((req as BufferedIncomingMessage).rawBody);
}

function getHeader(req: IncomingMessage, header: string): string {
  const value = req.headers[header];
  if (value === undefined || Array.isArray(value)) {
    throw new Error(`${verifyErrorPrefix}: header ${header} did not have the expected type (${value})`);
  }
  return value;
}

const verifyErrorPrefix = 'Failed to verify authenticity';
