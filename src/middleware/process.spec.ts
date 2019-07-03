import { assert } from 'chai';
import { Context } from 'mocha';
import { processMiddleware } from './process';
import { AnyMiddlewareArgs, Middleware } from '../types';

describe('processMiddleware()', () => {
  const middlewareOne: Middleware<AnyMiddlewareArgs> = ({ next, context }) => {
    const fn = (): void => {
      context.one = true;
      next();
    };
    setTimeout(fn, 10);
  };
  const middlewareTwo: Middleware<AnyMiddlewareArgs> = ({ next, context }) => {
    const fn = (): void => {
      context.two = true;
      next();
    };
    setTimeout(fn, 10);
  };
  it('processes all middleware before processing listener', (done) => {
    processMiddleware(
      // @ts-ignore
      {},
      [middlewareOne, middlewareTwo],
      (context: Context) => {
        // ensure that the last middleware ran to completion (i.e., called `next`) before afterMiddleware is called
        assert.isTrue(context.one);
        assert.isTrue(context.two);
        done();
      },
      (error?: Error) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error(`after post process: ${error && error.message}`);
        }
        assert(false);
      },
      {},
      null,
      null,
    );
  });
});
