import { IncomingMessage } from 'http';
import { ConsoleLogger } from '@slack/logger';
import { HTTPModuleFunctions } from './HTTPModuleFunctions';

const logger = new ConsoleLogger();

// Deprecated: this function will be removed in the near future
export function extractRetryNum(req: IncomingMessage): number | undefined {
  logger.warn('This method is deprecated. Use HTTPModuleFunctions.extractRetryNumFromHTTPRequest(req) instead.');
  return HTTPModuleFunctions.extractRetryNumFromHTTPRequest(req);
}

// Deprecated: this function will be removed in the near future
export function extractRetryReason(req: IncomingMessage): string | undefined {
  logger.warn('This method is deprecated. Use HTTPModuleFunctions.extractRetryReasonFromHTTPRequest(req) instead.');
  return HTTPModuleFunctions.extractRetryReasonFromHTTPRequest(req);
}
