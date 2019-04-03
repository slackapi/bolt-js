import { EventEmitter } from 'events';
import express, { Request, Response, Application } from 'express';
import parseRequest from './middleware/parseRequest';
import SSLCheck from './middleware/SSLCheck';
import axios from 'axios';
import { RespondFn, AckFn } from '../middleware/types';

// TODO: make this generic on the body?
export interface Event {
  body: {
    [key: string]: any;
  };
  ack: AckFn<any>;
  respond?: RespondFn;
}

export interface Receiver {
  on(event: 'message', listener: (event: Event) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  start(...args: any[]): Promise<unknown>;
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

    for (const endpoint of Object.values(this.endpoints)) {
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

  public start(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.app.listen(port, () => {
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
