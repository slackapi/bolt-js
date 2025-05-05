import { expectType } from 'tsd';
import App from '../../src/App';
import type { FunctionCompleteFn, FunctionFailFn } from '../../src/CustomFunction';
import type { FunctionInputs } from '../../src/types';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// By default `function` handlers auto-acknowledge events so `ack` should not be provided/defined
app.function('callback', async ({ ack }) => {
  expectType<undefined>(ack);
});

// By default `function` handlers provide/define the proper arguments
app.function('callback', async ({ inputs, complete, fail }) => {
  expectType<FunctionInputs>(inputs);
  expectType<FunctionCompleteFn>(complete);
  expectType<FunctionFailFn>(fail);
});
