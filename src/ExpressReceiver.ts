import { EventEmitter } from 'events';
import { Receiver, ReceiverEvent } from './types';
import express, { Request, Response, Application, RequestHandler } from 'express';
import axios from 'axios';
import rawBody from 'raw-body';
import crypto from 'crypto';
import tsscmp from 'tsscmp';
import querystring from 'querystring';

export interface ExpressReceiverOptions {
  signingSecret: string;
  endpoints?: string | {
    [endpointType: string]: string;
  };
}

/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 */
export default class ExpressReceiver extends EventEmitter implements Receiver {

  /* Express app */
  public app: Application;

  constructor ({
    signingSecret = '',
    endpoints = { events: '/slack/events' },
  }: ExpressReceiverOptions) {
    super();

    this.app = express();

    const expressMiddleware: RequestHandler[] = [
      verifySlackRequest(signingSecret),
      parseBody,
      respondToSslCheck,
      this.requestHandler.bind(this),
    ];

    const endpointList: string[] = typeof endpoints === 'string' ? [endpoints] : Object.values(endpoints);
    for (const endpoint of endpointList) {
      this.app.post(endpoint, ...expressMiddleware);
    }
  }

  private requestHandler(req: Request, res: Response): void {
    const event: ReceiverEvent = {
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

    if (req.body && req.body.response_url) {
      event.respond = (response): void => {
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

const respondToSslCheck: RequestHandler = (req, res, next) => {
  if (req.body && req.body.ssl_check) {
    res.send();
    return;
  }
  next();
};

// TODO: this should be imported from another package
function verifySlackRequest(signingSecret: string): RequestHandler {
  return async (req , _res, next) => {
    try {
      const body: string = (await rawBody(req)).toString();
      const signature = req.headers['x-slack-signature'] as string;
      const ts = Number(req.headers['x-slack-request-timestamp']);

      // Divide current date to match Slack ts format
      // Subtract 5 minutes from current time
      const fiveMinutesAgo = Math.floor(Date.now() / 1000) - (60 * 5);

      if (ts < fiveMinutesAgo) {
        // TODO: coded error
        const error = new Error('Slack request signing verification failed');
        next(error);
      }

      const hmac = crypto.createHmac('sha256', signingSecret);
      const [version, hash] = signature.split('=');
      hmac.update(`${version}:${ts}:${body}`);

      if (!tsscmp(hash, hmac.digest('hex'))) {
        // TODO: coded error
        const error = new Error('Slack request signing verification failed');
        next(error);
      }

      // Verification passed, assign string body back to request and resume
      req.body = body;
      next();
    } catch (error) {
      // TODO: coded error
      next(error);
    }
  };
}

const parseBody: RequestHandler = (req, _res, next) => {
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    const parsedBody = querystring.parse(req.body);
    req.body = (typeof parsedBody.payload === 'string') ? JSON.parse(parsedBody.payload) : parsedBody;
  } else {
    // TODO: should we check the content type header to make sure its JSON here?
    req.body = JSON.parse(req.body);
  }
  next();
};
