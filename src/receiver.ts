import crypto from 'crypto';
import tsscmp from 'tsscmp';
import querystring from 'querystring';
import App from './App';
import { AckFn, AnyMiddlewareArgs } from './types';
import { ReceiverAuthenticityError } from './errors';

export interface ReceiverEvent {
  body: Record<string, any>;
  // TODO: there should maybe be some more help for implementors of Receiver to know what kind of argument the AckFn
  // is expected to deal with.
  ack: AckFn<any>;
}

export interface Receiver {
  init(app: App): void;
  start(...args: any[]): Promise<unknown>;
  stop(...args: any[]): Promise<unknown>;
}

export function verifyRequestSignature(
    signingSecret: string,
    body: string,
    signature: string | undefined,
    requestTimestamp: string | undefined,
): void {
  if (signature === undefined || requestTimestamp === undefined) {
    throw new ReceiverAuthenticityError(
        'Slack request signing verification failed. Some headers are missing.',
    );
  }

  const ts = Number(requestTimestamp);
  if (isNaN(ts)) {
    throw new ReceiverAuthenticityError(
        'Slack request signing verification failed. Timestamp is invalid.',
    );
  }

  // Divide current date to match Slack ts format
  // Subtract 5 minutes from current time
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - (60 * 5);

  if (ts < fiveMinutesAgo) {
    throw new ReceiverAuthenticityError(
        'Slack request signing verification failed. Timestamp is too old.',
    );
  }

  const hmac = crypto.createHmac('sha256', signingSecret);
  const [version, hash] = signature.split('=');
  hmac.update(`${version}:${ts}:${body}`);

  if (!tsscmp(hash, hmac.digest('hex'))) {
    throw new ReceiverAuthenticityError(
        'Slack request signing verification failed. Signature mismatch.',
    );
  }
}

/**
 * This request handler has two responsibilities:
 * - Verify the request signature
 * - Parse request.body and assign the successfully parsed object to it.
 */
export function verifySignatureAndParseBody(
    signingSecret: string,
    body: string,
    headers: Record<string, any>,
): AnyMiddlewareArgs['body'] {
  // *** Request verification ***
  const {
    'x-slack-signature': signature,
    'x-slack-request-timestamp': requestTimestamp,
    'content-type': contentType,
  } = headers;

  verifyRequestSignature(
      signingSecret,
      body,
      signature,
      requestTimestamp,
  );

  return parseRequestBody(body, contentType);
}

export function parseRequestBody(
    stringBody: string,
    contentType: string | undefined,
): any {
  if (contentType === 'application/x-www-form-urlencoded') {
    const parsedBody = querystring.parse(stringBody);

    if (typeof parsedBody.payload === 'string') {
      return JSON.parse(parsedBody.payload);
    }

    return parsedBody;
  }

  return JSON.parse(stringBody);
}
