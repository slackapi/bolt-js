import { expectType } from 'tsd';
import App from '../../src/App';
import type { FunctionCompleteFn, FunctionFailFn } from '../../src/CustomFunction';
import type { FunctionInputs } from '../../src/types';
import type { AckFn } from '../../src/types/utilities';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

app.function('callback', { autoAcknowledge: true }, async ({ ack, inputs, complete, fail }) => {
  expectType<AckFn<void> | undefined>(ack);
  expectType<FunctionInputs>(inputs);
  expectType<FunctionCompleteFn>(complete);
  expectType<FunctionFailFn>(fail);
});

// For `function` handlers that are not auto-acknowledged, `ack` should be optional
app.function('callback', { autoAcknowledge: false }, async ({ ack, inputs, complete, fail }) => {
  expectType<AckFn<void> | undefined>(ack);
  expectType<FunctionInputs>(inputs);
  expectType<FunctionCompleteFn>(complete);
  expectType<FunctionFailFn>(fail);
});

// By default `function` handlers provide/define the proper arguments
app.function('callback', async ({ ack, inputs, complete, fail }) => {
  expectType<AckFn<void> | undefined>(ack);
  expectType<FunctionInputs>(inputs);
  expectType<FunctionCompleteFn>(complete);
  expectType<FunctionFailFn>(fail);
});
