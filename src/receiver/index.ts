import { EventEmitter } from 'events';
import express, { Request, Response, Application } from 'express';
import parseRequest from './middleware/parseRequest';
import SSLCheck from './middleware/SSLCheck';
import axios from 'axios';
import { RespondFn, AckFn } from '../middleware/types';

// TODO: remove the following pragma after TSLint to ESLint transformation is complete
/* tslint:disable:completed-docs */

// TODO: make this generic on the body?
export interface Event {
  body: {
    [key: string]: any;
  };
  ack: AckFn;
  respond?: RespondFn;
}

export interface Receiver {
  on(event: 'message', listener: (event: Event) => void): this;
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
export class ExpressReceiver extends EventEmitter implements Receiver {

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
    const event: Event = {
      body: req.body as { [key: string]: any },
      ack: (response: any): void => {
        if (!response) res.send('');
        if (typeof response === 'string') {
          res.send(response);
        } else {
          res.json(response);
        }
      },
      respond: undefined,
    };

    // TODO: should this be in Slapp? Attach respond function to request
    if (req.body && req.body.response_url) {
      event.respond = (response: string | object): void => {
        axios.post(req.body.response_url, response)
          .catch((e) => {
            this.emit('error', e);
          });
      };
    }

    this.emit('message', event);
  }
}
