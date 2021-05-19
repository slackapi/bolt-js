import App from '../src/App';
import { expectType } from 'tsd';
import { CodedError } from '../src/errors';
import { IncomingMessage, ServerResponse } from 'http';
import { BufferedIncomingMessage } from '../src/receivers/verify-request';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// https://github.com/slackapi/bolt-js/issues/925
// CodedError should have original and so on
app.error(async (error) => {
  expectType<CodedError>(error);

  expectType<Error | undefined>(error.original);
  if (error.original != undefined) {
    expectType<Error>(error.original);
    console.log(error.original.message);
  }

  expectType<Error[] | undefined>(error.originals);
  if (error.originals != undefined) {
    expectType<Error[]>(error.originals);
    console.log(error.originals);
  }

  expectType<string | undefined>(error.missingProperty);
  if (error.missingProperty != undefined) {
    expectType<string>(error.missingProperty);
    console.log(error.missingProperty);
  }

  expectType<IncomingMessage | BufferedIncomingMessage | undefined>(error.req);
  if (error.req != undefined) {
    expectType<IncomingMessage | BufferedIncomingMessage>(error.req);
    console.log(error.req);
  }

  expectType<ServerResponse | undefined>(error.res);
  if (error.res != undefined) {
    expectType<ServerResponse>(error.res);
    console.log(error.res);
  }
});
