import type { Logger } from '@slack/logger';
import { type CodedError, ErrorCode, isCodedError } from '../errors';
import type { ReceiverEvent } from '../types';

export async function defaultProcessEventErrorHandler(
  args: SocketModeReceiverProcessEventErrorHandlerArgs,
): Promise<boolean> {
  const { error, logger, event } = args;
  // TODO: more details like envelop_id, payload type etc. here
  // To make them available, we need to enhance underlying SocketModeClient
  // to return more properties to 'slack_event' listeners
  logger.error(`An unhandled error occurred while Bolt processed (type: ${event.body?.type}, error: ${error})`);
  logger.debug(`Error details: ${error}, retry num: ${event.retryNum}, retry reason: ${event.retryReason}`);
  if (isCodedError(error) && error.code === ErrorCode.AuthorizationError) {
    // The `authorize` function threw an exception, which means there is no valid installation data.
    // In this case, we can tell the Slack server-side to stop retries.
    return true;
  }
  return false;
}

// The arguments for the processEventErrorHandler,
// which handles errors `await app.processEvent(even)` method throws
export interface SocketModeReceiverProcessEventErrorHandlerArgs {
  error: Error | CodedError;
  logger: Logger;
  event: ReceiverEvent;
}
