// Deprecated: this function will be removed in the near future. Use HTTPModuleFunctions instead.
import { ConsoleLogger, Logger } from '@slack/logger';
import type { IncomingMessage, ServerResponse } from 'http';
import { BufferedIncomingMessage } from './BufferedIncomingMessage';
import { HTTPModuleFunctions, RequestVerificationOptions } from './HTTPModuleFunctions';

const logger = new ConsoleLogger();

// Deprecated: this function will be removed in the near future. Use HTTPModuleFunctions instead.
export interface VerifyOptions extends RequestVerificationOptions {
  enabled?: boolean;
  signingSecret: string;
  nowMs?: () => number;
  logger?: Logger;
}

// Deprecated: this function will be removed in the near future. Use HTTPModuleFunctions instead.
export async function verify(
  options: VerifyOptions,
  req: IncomingMessage,
  res?: ServerResponse,
): Promise<BufferedIncomingMessage> {
  logger.warn('This method is deprecated. Use HTTPModuleFunctions.parseAndVerifyHTTPRequest(options, req, res) instead.');
  return HTTPModuleFunctions.parseAndVerifyHTTPRequest(options, req, res);
}
