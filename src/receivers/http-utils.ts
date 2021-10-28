import { IncomingMessage } from 'http';

export function extractRetryNum(req: IncomingMessage): number | undefined {
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

export function extractRetryReason(req: IncomingMessage): string | undefined {
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
