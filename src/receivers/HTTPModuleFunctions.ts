/* eslint-disable import/prefer-default-export */
import { parse as qsParse } from 'querystring';
import type { IncomingMessage, ServerResponse } from 'http';
import rawBody from 'raw-body';
import type { Logger } from '@slack/logger';
import { CodedError, ErrorCode } from '../errors';
import { BufferedIncomingMessage } from './BufferedIncomingMessage';
import { verifySlackRequest } from './verify-request';

const verifyErrorPrefix = 'Failed to verify authenticity';

export class HTTPModuleFunctions {
  // ------------------------------------------
  // Request header extraction
  // ------------------------------------------

  public static extractRetryNumFromHTTPRequest(req: IncomingMessage): number | undefined {
    let retryNum;
    const retryNumHeaderValue = req.headers['x-slack-retry-num'];
    if (retryNumHeaderValue === undefined) {
      retryNum = undefined;
    } else if (typeof retryNumHeaderValue === 'string') {
      retryNum = parseInt(retryNumHeaderValue, 10);
    } else if (Array.isArray(retryNumHeaderValue) && retryNumHeaderValue.length > 0) {
      retryNum = parseInt(retryNumHeaderValue[0], 10);
    }
    return retryNum;
  }

  public static extractRetryReasonFromHTTPRequest(req: IncomingMessage): string | undefined {
    let retryReason;
    const retryReasonHeaderValue = req.headers['x-slack-retry-reason'];
    if (retryReasonHeaderValue === undefined) {
      retryReason = undefined;
    } else if (typeof retryReasonHeaderValue === 'string') {
      retryReason = retryReasonHeaderValue;
    } else if (Array.isArray(retryReasonHeaderValue) && retryReasonHeaderValue.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      retryReason = retryReasonHeaderValue[0];
    }
    return retryReason;
  }

  // ------------------------------------------
  // HTTP request parsing and verification
  // ------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static parseHTTPRequestBody(req: BufferedIncomingMessage): any {
    const bodyAsString = req.rawBody.toString();
    const contentType = req.headers['content-type'];
    if (contentType === 'application/x-www-form-urlencoded') {
      const parsedQs = qsParse(bodyAsString);
      const { payload } = parsedQs;
      if (typeof payload === 'string') {
        return JSON.parse(payload);
      }
      return parsedQs;
    }
    return JSON.parse(bodyAsString);
  }

  public static async parseAndVerifyHTTPRequest(
    options: RequestVerificationOptions,
    req: IncomingMessage,
    _res?: ServerResponse,
  ): Promise<BufferedIncomingMessage> {
    const { signingSecret } = options;

    // Consume the readable stream (or use the previously consumed readable stream)
    const bufferedReq = await HTTPModuleFunctions.bufferIncomingMessage(req);

    if (options.enabled !== undefined && !options.enabled) {
      // As the validation is disabled, immediately return the buffered request
      return bufferedReq;
    }
    const textBody = bufferedReq.rawBody.toString();

    const contentType = req.headers['content-type'];
    if (contentType === 'application/x-www-form-urlencoded') {
      // `ssl_check=1` requests do not require x-slack-signature verification
      const parsedQs = qsParse(textBody);
      if (parsedQs && parsedQs.ssl_check) {
        return bufferedReq;
      }
    }

    // Find the relevant request headers
    const signature = HTTPModuleFunctions.getHeader(req, 'x-slack-signature');
    const requestTimestampSec = Number(HTTPModuleFunctions.getHeader(req, 'x-slack-request-timestamp'));
    verifySlackRequest({
      signingSecret,
      body: textBody,
      headers: {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': requestTimestampSec,
      },
      logger: options.logger,
    });

    // Checks have passed! Return the value that has a side effect (the buffered request)
    return bufferedReq;
  }

  public static isBufferedIncomingMessage(req: IncomingMessage): req is BufferedIncomingMessage {
    return Buffer.isBuffer((req as BufferedIncomingMessage).rawBody);
  }

  public static getHeader(req: IncomingMessage, header: string): string {
    const value = req.headers[header];
    if (value === undefined || Array.isArray(value)) {
      throw new Error(`${verifyErrorPrefix}: header ${header} did not have the expected type (received ${typeof value}, expected string)`);
    }
    return value;
  }

  public static async bufferIncomingMessage(req: IncomingMessage): Promise<BufferedIncomingMessage> {
    if (HTTPModuleFunctions.isBufferedIncomingMessage(req)) {
      return req;
    }
    const bufferedRequest = req as BufferedIncomingMessage;
    bufferedRequest.rawBody = await rawBody(req);
    return bufferedRequest;
  }

  // ------------------------------------------
  // HTTP response builder methods
  // ------------------------------------------

  public static buildNoBodyResponse(res: ServerResponse, status: number): void {
    res.writeHead(status);
    res.end();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static buildUrlVerificationResponse(res: ServerResponse, body: any): void {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ challenge: body.challenge }));
  }

  public static buildSSLCheckResponse(res: ServerResponse): void {
    res.writeHead(200);
    res.end();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static buildContentResponse(res: ServerResponse, body: string | any | undefined): void {
    if (!body) {
      res.writeHead(200);
      res.end();
    } else if (typeof body === 'string') {
      res.writeHead(200);
      res.end(body);
    } else {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    }
  }

  // ------------------------------------------
  // Error handlers for event processing
  // ------------------------------------------

  // The default dispatchErrorHandler implementation:
  // Developers can customize this behavior by passing dispatchErrorHandler to the constructor
  // Note that it was not possible to make this function async due to the limitation of http module
  public static defaultDispatchErrorHandler(args: ReceiverDispatchErrorHandlerArgs): void {
    const { error, logger, request, response } = args;
    if ('code' in error) {
      if (error.code === ErrorCode.HTTPReceiverDeferredRequestError) {
        logger.info(`Unhandled HTTP request (${request.method}) made to ${request.url}`);
        response.writeHead(404);
        response.end();
        return;
      }
    }
    logger.error(`An unexpected error occurred during a request (${request.method}) made to ${request.url}`);
    logger.debug(`Error details: ${error}`);
    response.writeHead(500);
    response.end();
  }

  public static async defaultAsyncDispatchErrorHandler(args: ReceiverDispatchErrorHandlerArgs): Promise<void> {
    return HTTPModuleFunctions.defaultDispatchErrorHandler(args);
  }

  // The default processEventErrorHandler implementation:
  // Developers can customize this behavior by passing processEventErrorHandler to the constructor
  public static async defaultProcessEventErrorHandler(
    args: ReceiverProcessEventErrorHandlerArgs,
  ): Promise<boolean> {
    const { error, response, logger, storedResponse } = args;

    // Check if the response headers have already been sent
    if (response.headersSent) {
      logger.error('An unhandled error occurred after ack() called in a listener');
      logger.debug(`Error details: ${error}, storedResponse: ${storedResponse}`);
      return false;
    }

    if ('code' in error) {
    // CodedError has code: string
      const errorCode = (error as CodedError).code;
      if (errorCode === ErrorCode.AuthorizationError) {
      // authorize function threw an exception, which means there is no valid installation data
        response.writeHead(401);
        response.end();
        return true;
      }
    }
    logger.error('An unhandled error occurred while Bolt processed an event');
    logger.debug(`Error details: ${error}, storedResponse: ${storedResponse}`);
    response.writeHead(500);
    response.end();
    return false;
  }

  // The default unhandledRequestHandler implementation:
  // Developers can customize this behavior by passing unhandledRequestHandler to the constructor
  // Note that this method cannot be an async function to align with the implementation using setTimeout
  public static defaultUnhandledRequestHandler(args: ReceiverUnhandledRequestHandlerArgs): void {
    const { logger, response } = args;
    logger.error(
      'An incoming event was not acknowledged within 3 seconds. ' +
      'Ensure that the ack() argument is called in a listener.',
    );

    // Check if the response has already been sent
    if (!response.headersSent) {
      // If not, set the status code and end the response to close the connection
      response.writeHead(404); // Not Found
      response.end();
    }
  }
}

export interface RequestVerificationOptions {
  enabled?: boolean;
  signingSecret: string;
  nowMilliseconds?: () => number;
  logger?: Logger;
}

// which handles errors occurred while dispatching a request
export interface ReceiverDispatchErrorHandlerArgs {
  error: Error | CodedError;
  logger: Logger;
  request: IncomingMessage;
  response: ServerResponse;
}

// The arguments for the processEventErrorHandler,
// which handles errors `await app.processEvent(even)` method throws
export interface ReceiverProcessEventErrorHandlerArgs {
  error: Error | CodedError;
  logger: Logger;
  request: IncomingMessage;
  response: ServerResponse;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storedResponse: any;
}

// The arguments for the unhandledRequestHandler,
// which deals with any unhandled incoming requests from Slack.
// (The default behavior is just printing error logs)
export interface ReceiverUnhandledRequestHandlerArgs {
  logger: Logger;
  request: IncomingMessage;
  response: ServerResponse;
}
