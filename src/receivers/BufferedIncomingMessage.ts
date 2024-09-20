import type { IncomingMessage } from 'node:http';

export interface BufferedIncomingMessage extends IncomingMessage {
  rawBody: Buffer;
}
