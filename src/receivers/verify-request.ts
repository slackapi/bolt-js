// Deprecated: this function will be removed in the near future. Use HTTPModuleFunctions instead.
import type { Logger } from '@slack/logger';
import type { IncomingMessage, ServerResponse } from 'http';
import { BufferedIncomingMessage } from './BufferedIncomingMessage';
import { HTTPModuleFunctions, RequestVerificationOptions } from './HTTPModuleFunctions';

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
  _res?: ServerResponse,
): Promise<BufferedIncomingMessage> {
  return HTTPModuleFunctions.parseAndVerifyHTTPRequest(options, req, _res);
}
