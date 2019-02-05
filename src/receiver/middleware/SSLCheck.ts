import { RequestHandler } from 'express';

export default function (): RequestHandler {
  return (req, res, next) => {
    if (req.body && req.body.ssl_check) {
      res.send();
      return;
    }

    next();
  };
}
