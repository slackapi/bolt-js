import rawBody from 'raw-body';
import crypto from 'crypto';
import tsscmp from 'tsscmp';
import querystring from 'querystring';
import { Request, Response, RequestHandler } from 'express';

export const errorCodes = {
  SIGNATURE_VERIFICATION_FAILURE: 'SLACKHTTPHANDLER_REQUEST_SIGNATURE_VERIFICATION_FAILURE',
  REQUEST_TIME_FAILURE: 'SLACKHTTPHANDLER_REQUEST_TIMELIMIT_FAILURE',
};

function parseBody(contentType: string, body: any): object {
  if (contentType === 'application/x-www-form-urlencoded') {
    const parsedBody = querystring.parse(body);

    if (typeof parsedBody.payload === 'string') {
      return JSON.parse(parsedBody.payload);
    }
    return parsedBody;
  }

  return JSON.parse(body);
}

// TODO: support req.rawBody for serverless platforms like Firebase
export default function (signingSecret: string): RequestHandler {
  return (req: Request, _res: Response, next: (e?: Error) => void) => {
    rawBody(req)
      .then((r) => {
        const body = r.toString();
        const signature = req.headers['x-slack-signature'] as string;
        const ts = Number(req.headers['x-slack-request-timestamp']);

        // Divide current date to match Slack ts format
        // Subtract 5 minutes from current time
        const fiveMinutesAgo = Math.floor(Date.now() / 1000) - (60 * 5);

        if (ts < fiveMinutesAgo) {
          const error = new Error('Slack request signing verification failed');
          next(error);
        }

        const hmac = crypto.createHmac('sha256', signingSecret);
        const [version, hash] = signature.split('=');
        hmac.update(`${version}:${ts}:${body}`);

        if (!tsscmp(hash, hmac.digest('hex'))) {
          const error = new Error('Slack request signing verification failed');
          next(error);
        }

        req.body = parseBody(req.headers['content-type'] as string, body);

        next();
      });
  };
}
