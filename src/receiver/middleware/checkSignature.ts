import rawBody from 'raw-body';

export const errorCodes = {
  SIGNATURE_VERIFICATION_FAILURE: 'SLACKHTTPHANDLER_REQUEST_SIGNATURE_VERIFICATION_FAILURE',
  REQUEST_TIME_FAILURE: 'SLACKHTTPHANDLER_REQUEST_TIMELIMIT_FAILURE',
};

export default function (signingSecret: string): any {
  return (req, res, next) => {
    rawBody(req)
      .then((r) => {
        const body = r.toString();
        const signature = req.headers['x-slack-signature'];
        const ts = req.headers['x-slack-request-timestamp'];

        // Divide current date to match Slack ts format
        // Subtract 5 minutes from current time
        const fiveMinutesAgo = Math.floor(Date.now() / 1000) - (60 * 5);

        if (ts < fiveMinutesAgo) {
          const error = new Error('Slack request signing verification failed');
          error.code = errorCodes.REQUEST_TIME_FAILURE;
          throw error;
        }

        const hmac = crypto.createHmac('sha256', signingSecret);
        const [version, hash] = signature.split('=');
        hmac.update(`${version}:${ts}:${req.body}`);

        if (!timingSafeCompare(hash, hmac.digest('hex'))) {
          const error = new Error('Slack request signing verification failed');
          error.code = errorCodes.SIGNATURE_VERIFICATION_FAILURE;
          throw error;
        }

        next();
      });
  };
}
