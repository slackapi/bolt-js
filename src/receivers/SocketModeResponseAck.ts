import type { Logger } from '@slack/logger';
import type { AckFn, ResponseAck } from '../types';

// biome-ignore lint/suspicious/noExplicitAny: response bodies can be anything
export type SocketModeResponseBody = any;
type SocketModeClientAck = (response?: Record<string, unknown>) => Promise<void>;

export interface AckArgs {
  logger: Logger;
  socketModeClientAck: SocketModeClientAck;
}

export class SocketModeResponseAck implements ResponseAck {
  private logger: Logger;

  private isAcknowledged: boolean;

  // TODO: the SocketModeClient should expose its send method and it should be used to acknowledge rather then an arbitrary ack() function
  private socketModeClientAck: SocketModeClientAck;

  public constructor(args: AckArgs) {
    this.logger = args.logger;
    this.isAcknowledged = false;
    this.socketModeClientAck = args.socketModeClientAck;
    // TODO: a Timeout should be used to acknowledge the request after 3 seconds and mimic the HTTPReceiver behavior
  }

  public bind(): AckFn<SocketModeResponseBody> {
    return async (responseBody) => {
      this.logger.debug(`ack() call begins (body: ${JSON.stringify(responseBody)})`);
      if (this.isAcknowledged) {
        // TODO: this should throw a ReceiverMultipleAckError error instead of printing a debug message
        this.logger.warn('ack() has already been invoked; subsequent calls have no effect');
        return;
      }
      await this.ack(responseBody);
    };
  }

  public async ack(response?: Record<string, unknown>): Promise<void> {
    this.isAcknowledged = true;
    await this.socketModeClientAck(response);
    this.logger.debug(`ack() response sent (body: ${JSON.stringify(response)})`);
  }
}
