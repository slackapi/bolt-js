import { Logger } from '@slack/logger';
import { IncomingMessage, ServerResponse } from 'http';
import { AckFn } from '../types';
import { ReceiverMultipleAckError } from '../errors';
import { HTTPModuleFunctions as httpFunc, ReceiverUnhandledRequestHandlerArgs } from './HTTPModuleFunctions';

export interface AckArgs {
  logger: Logger;
  processBeforeResponse: boolean;
  unhandledRequestHandler?: (args: ReceiverUnhandledRequestHandlerArgs) => void;
  unhandledRequestTimeoutMillis?: number;
  httpRequest: IncomingMessage,
  httpResponse: ServerResponse,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HTTResponseBody = any | string | undefined;

export class HTTPResponseAck {
  private logger: Logger;

  private isAcknowledged: boolean;

  private processBeforeResponse: boolean;

  private unhandledRequestHandler: (args: ReceiverUnhandledRequestHandlerArgs) => void;

  private unhandledRequestTimeoutMillis: number;

  private httpRequest: IncomingMessage;

  private httpResponse: ServerResponse;

  private noAckTimeoutId?: NodeJS.Timeout;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public storedResponse: any | string | undefined;

  public constructor(args: AckArgs) {
    this.logger = args.logger;
    this.isAcknowledged = false;
    this.processBeforeResponse = args.processBeforeResponse;
    this.unhandledRequestHandler = args.unhandledRequestHandler ?? httpFunc.defaultUnhandledRequestHandler;
    this.unhandledRequestTimeoutMillis = args.unhandledRequestTimeoutMillis ?? 3001;
    this.httpRequest = args.httpRequest;
    this.httpResponse = args.httpResponse;
    this.storedResponse = undefined;
    this.noAckTimeoutId = undefined;
    this.init();
  }

  private init(): HTTPResponseAck {
    this.noAckTimeoutId = setTimeout(() => {
      if (!this.isAcknowledged) {
        this.unhandledRequestHandler({
          logger: this.logger,
          request: this.httpRequest,
          response: this.httpResponse,
        });
      }
    }, this.unhandledRequestTimeoutMillis);
    return this;
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
