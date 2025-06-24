import type App from '../App';
import type { AckFn } from './index';
import type { StringIndexed } from './utilities';

export interface ReceiverEvent {
  // Parsed HTTP request body / Socket Mode message body
  body: StringIndexed;

  // X-Slack-Retry-Num: 2 in HTTP Mode
  // "retry_attempt": 0, in Socket Mode
  retryNum?: number;

  // X-Slack-Retry-Reason: http_error in HTTP Mode
  // "retry_reason": "timeout", in Socket Mode
  retryReason?: string;

  // Custom properties like HTTP request headers
  customProperties?: StringIndexed;

  // The function to acknowledge incoming requests
  // The details of implementation is encapsulated in a receiver
  // biome-ignore lint/suspicious/noExplicitAny: TODO: Make the argument type more specific
  ack: AckFn<any>;
}

export interface Receiver {
  init(app: App): void;
  // biome-ignore lint/suspicious/noExplicitAny: different receivers may have different types of arguments
  start(...args: any[]): Promise<unknown>;
  // biome-ignore lint/suspicious/noExplicitAny: different receivers may have different types of arguments
  stop(...args: any[]): Promise<unknown>;
}

export interface ResponseAck {
  // Returns the function to acknowledge incoming requests
  // biome-ignore lint/suspicious/noExplicitAny: TODO: Make the argument type more specific
  bind(): AckFn<any>;
}
