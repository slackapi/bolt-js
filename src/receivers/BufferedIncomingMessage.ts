import type { IncomingMessage } from 'node:http';

// TODO: we should see about removing this or using native means of accomplishing what this interface provides (seems like a memory reference to an unbuffered request body)
// the helper methods around this are simplistic and work against TypeScript
export interface BufferedIncomingMessage extends IncomingMessage {
  rawBody: Buffer;
}
