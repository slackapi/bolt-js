import EventEmitter from 'events';
import express from 'express';
import checkSignature from './middleware/checkSignature';
import parseRequest from './middleware/parseRequest';
import SSLCheck from './middleware/SSLCheck';
import axios from 'axios';

// TODO: define interface
export interface Receiver {
  (args: ReceiverArguments): void;
  on(event: 'message', listener: () => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
}

export interface ReceiverArguments {
  signingSecret: string;
  endpoints?: object;
}

/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 */
export default class ExpressReceiver extends EventEmitter implements Receiver {

  /* Signing secret to verify requests from Slack */
  private signingSecret: string;

  /* Signing secret to verify requests from Slack */
  private endpoints: object;

  /* Express app */
  // TODO: type
  private app: any;

  constructor ({
    signingSecret = '',
    endpoints = undefined,
  }: ReceiverArguments) {
    super();

    this.signingSecret = signingSecret;
    this.endpoints = endpoints || { events: '/slack/events' };

    this.app = express();

    this.setupEndpoints();
  }

  private setupEndpoints(): void {
    const e = Object.values(this.endpoints);
    const defaultMiddleware = [
      SSLCheck(),
      checkSignature(this.signingSecret),
      parseRequest(),
      this.emitHandler.bind(this),
    ];

    for (const endpoint in e) {
      this.app.post(endpoint, ...defaultMiddleware);
    }
  }

  private emitHandler(req, res): void {
    // Attach respond function to request
    if (req.body.response_url) {
      req.respond = function (response: string | object): any {
        // TODO: should this be returning?
        return axios.post(req.body.response_url, response);
      };
    }

    // TODO: when is ack() not included on the response?
    req.ack = function(response: string | object | undefined): void {
      // TODO: hmmm what is ack actually supposed to do here?
    };

    this.emit('message', req);
  }
}
