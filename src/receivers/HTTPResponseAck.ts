import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Logger } from '@slack/logger';
import { CustomFunction } from '../CustomFunction';
import { ReceiverMultipleAckError } from '../errors';
import type { AckFn, ResponseAck, StringIndexed } from '../types';
import * as httpFunc from './HTTPModuleFunctions';

export interface AckArgs {
  logger: Logger;
  processBeforeResponse: boolean;
  unhandledRequestHandler?: (args: httpFunc.ReceiverUnhandledRequestHandlerArgs) => void;
  unhandledRequestTimeoutMillis?: number;
  httpRequest: IncomingMessage;
  httpRequestBody?: StringIndexed;
  httpResponse: ServerResponse;
}

// TODO: (semver:major) change this to "HTTPResponseBody"
// biome-ignore lint/suspicious/noExplicitAny: response bodies can be anything
export type HTTResponseBody = any;

export class HTTPResponseAck implements ResponseAck {
  private logger: Logger;

  private isAcknowledged: boolean;

  private processBeforeResponse: boolean;

  private unhandledRequestHandler: (args: httpFunc.ReceiverUnhandledRequestHandlerArgs) => void;

  private unhandledRequestTimeoutMillis: number;

  private unhandledFunctionRequestTimeoutMillis: number;

  private httpRequest: IncomingMessage;

  private httpRequestBody: StringIndexed;

  private httpResponse: ServerResponse;

  private noAckTimeoutId?: NodeJS.Timeout;

  // biome-ignore lint/suspicious/noExplicitAny: response bodies can be anything
  public storedResponse: any;

  public constructor(args: AckArgs) {
    this.logger = args.logger;
    this.isAcknowledged = false;
    this.processBeforeResponse = args.processBeforeResponse;
    this.unhandledRequestHandler = args.unhandledRequestHandler ?? httpFunc.defaultUnhandledRequestHandler;
    this.unhandledFunctionRequestTimeoutMillis = 10001;
    this.unhandledRequestTimeoutMillis = args.unhandledRequestTimeoutMillis ?? 3001;
    this.httpRequest = args.httpRequest;
    this.httpRequestBody = args.httpRequestBody ?? {};
    this.httpResponse = args.httpResponse;
    this.storedResponse = undefined;
    this.noAckTimeoutId = undefined;
    this.init();
  }

  private init(): HTTPResponseAck {
    /**
     * TODO: Major refactoring needed
     *
     * 1. For function_executed events, the acknowledgment timeout can vary from 3 to 60 seconds
     *    depending on the function context. Currently we only allow users to set a fixed
     *    timeout for all function_executed events, but this may not satisfy all use cases.
     *
     * 2. Refactor Bolt App and Receiver logic to implement proper Request and Response abstractions:
     *    - Receivers should translate their specific request types to standardized Bolt Requests/Responses
     *    - All acknowledgment behaviors and default routing should be handled by the App, not the receivers
     *    - Prevent multiple request body parsing happening both here and again in the App
     *
     * Goal: Define clear separation between protocol-specific and application-level concerns
     */
    const requestTimeout = this.determineRequestTimeout();

    this.noAckTimeoutId = setTimeout(() => {
      if (!this.isAcknowledged) {
        this.unhandledRequestHandler({
          logger: this.logger,
          request: this.httpRequest,
          response: this.httpResponse,
        });
      }
    }, requestTimeout);
    return this;
  }

  private determineRequestTimeout(): number {
    if (this.httpRequestBody?.event?.type === CustomFunction.EVENT_TYPE) {
      return this.unhandledFunctionRequestTimeoutMillis;
    }

    return this.unhandledRequestTimeoutMillis;
  }

  public bind(): AckFn<HTTResponseBody> {
    return async (responseBody) => {
      this.logger.debug(`ack() call begins (body: ${responseBody})`);
      if (this.isAcknowledged) {
        throw new ReceiverMultipleAckError();
      }
      this.ack();
      if (this.processBeforeResponse) {
        // In the case where processBeforeResponse: true is enabled,
        // we don't send the HTTP response immediately. We hold off until the listener execution is completed.
        if (!responseBody) {
          this.storedResponse = '';
        } else {
          this.storedResponse = responseBody;
        }
        this.logger.debug(`ack() response stored (body: ${responseBody})`);
      } else {
        httpFunc.buildContentResponse(this.httpResponse, responseBody);
        this.logger.debug(`ack() response sent (body: ${responseBody})`);
      }
    };
  }

  public ack(): void {
    this.isAcknowledged = true;
    if (this.noAckTimeoutId) {
      clearTimeout(this.noAckTimeoutId);
    }
  }
}
