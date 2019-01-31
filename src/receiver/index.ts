import { EventEmitter } from 'events';
import express, { Request, Response, Application } from 'express';
import parseRequest from './middleware/parseRequest';
import SSLCheck from './middleware/SSLCheck';
import axios from 'axios';
import { MiddlewareArguments } from '../middleware';

export interface Receiver {
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
  private endpoints: object | string;

  /* Express app */
  private app: Application;

  constructor ({
    signingSecret = '',
    endpoints = { events: '/slack/events' },
  }: ReceiverArguments) {
    super();

    this.endpoints = endpoints;

    if (typeof this.endpoints === 'string') {
      this.endpoints = { events: this.endpoints };
    }

    this.app = express();

    const defaultMiddleware = [
      SSLCheck(),
      parseRequest(signingSecret),
      this.emitHandler.bind(this),
    ];

    const e = Object.values(this.endpoints);

    for (const endpoint in e) {
      this.app.post(endpoint, ...defaultMiddleware);
    }
  }

  private emitHandler(req: Request, res: Response): void {
    const msg: MiddlewareArguments = {
      payload: {},
      context: {},
      body: req.body,
    };

    // Attach respond function to request
    if (req.body && req.body.response_url) {
      msg.respond = (response: string | object): any => {
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
