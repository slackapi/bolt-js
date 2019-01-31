import EventEmitter from 'events';
import express from 'express';
import parseRequest from './middleware/parseRequest';
import SSLCheck from './middleware/SSLCheck';
import axios from 'axios';
import { MiddlewareArguments } from '../middleware';

// TODO: define interface
export interface Receiver {
  (args: ReceiverArguments): void;
  on(event: 'message', listener: () => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
}

export interface ReceiverArguments {
  signingSecret: string;
  endpoints?: string | {
    [endpointType: string]: string;
  };
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
    endpoints = { events: '/slack/events' },
  }: ReceiverArguments) {
    super();

    this.signingSecret = signingSecret;
    this.endpoints = endpoints;

    this.app = express();

    const e = Object.values(this.endpoints);
    const defaultMiddleware = [
      SSLCheck(),
      parseRequest(this.signingSecret),
      this.emitHandler.bind(this),
    ];

    for (const endpoint in e) {
      this.app.post(endpoint, ...defaultMiddleware);
    }
  }

  private emitHandler(req, res): void {
    const msg: MiddlewareArguments = {
      payload: {},
      context: {},
      body: req.body,
    };

    // Attach respond function to request
    if (req.body && req.body.response_url) {
      msg.respond = function (response: string | object): any {
        axios.post(req.body.response_url, response)
          .catch((e) => {
            this.emit('error', e);
          });
      };
    }

    // TODO: when is ack() not included on the response?
    msg.ack = function (response: string | Object | undefined): void {
      if (!response) res.send('');
      if (typeof response === 'string') {
        res.send(response);
      } else {
        res.json(response);
      }
    };

    this.emit('message', msg);
  }
}
const r = new ExpressReceiver({ signingSecret: '' });
