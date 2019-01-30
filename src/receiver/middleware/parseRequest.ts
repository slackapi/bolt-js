import querystring from 'querystring';

function parseBody(contentType: string, body: any): object {
  if (contentType === 'application/x-www-form-urlencoded') {
    const parsedBody = querystring.parse(body);

    if (parsedBody.payload) {
      return JSON.parse(parsedBody.payload);
    }
    return parsedBody;
  }

  return JSON.parse(body);
}

export default function (): any {
  return (req, res, next) => {
    const body = parseBody(req.body);

    if (!body) {
      // Error?
    }

    req.body = body;
    next();
  };
}
