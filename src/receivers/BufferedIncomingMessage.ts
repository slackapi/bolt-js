import type { IncomingMessage } from 'http';

export interface BufferedIncomingMessage extends IncomingMessage {
  rawBody: Buffer;
}
