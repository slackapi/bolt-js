/* eslint-disable import/prefer-default-export */
import type { Logger } from '@slack/logger';
import { CodedError, ErrorCode } from '../errors';
import { ReceiverEvent } from '../types';

export class SocketModeFunctions {
  // ------------------------------------------
  // Error handlers for event processing
  // ------------------------------------------

  // The default processEventErrorHandler implementation:
  // Developers can customize this behavior by passing processEventErrorHandler to the constructor
  public static async defaultProcessEventErrorHandler(
    args: SocketModeReceiverProcessEventErrorHandlerArgs,
  ): Promise<boolean> {
    const { error, logger, event } = args;
    // TODO: more details like envelop_id, payload type etc. here
    // To make them available, we need to enhance underlying SocketModeClient
    // to return more properties to 'slack_event' listeners
    logger.error(`An unhandled error occurred while Bolt processed (type: ${event.body.type}, error: ${error})`);
    logger.debug(`Error details: ${error}, retry num: ${event.retryNum}, retry reason: ${event.retryReason}`);
    const errorCode = (error as CodedError).code;
    if (errorCode === ErrorCode.AuthorizationError) {
      // The `authorize` function threw an exception, which means there is no valid installation data.
      // In this case, we can tell the Slack server-side to stop retries.
      return true;
    }
    return false;
  }
}

// The arguments for the processEventErrorHandler,
// which handles errors `await app.processEvent(even)` method throws
export interface SocketModeReceiverProcessEventErrorHandlerArgs {
  error: Error | CodedError;
  logger: Logger;
  event: ReceiverEvent,
}
