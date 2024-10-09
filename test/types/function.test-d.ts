import { expectError, expectNotType, expectType } from 'tsd';
import App from '../../src/App';
import type { FunctionCompleteFn, FunctionFailFn } from '../../src/CustomFunction';
import type { FunctionInputs } from '../../src/types';
import type { AckFn } from '../../src/types/utilities';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// By default `function` handlers auto-acknowledge events so `ack` should not be provided/defined
expectError(
  app.function('callback', async ({ ack }) => {
    expectNotType<AckFn<void>>(ack);
  }),
);

// For `function` handlers that are auto-acknowledged, `ack` should not be provided/defined
expectError(
  app.function('callback', { autoAcknowledge: true }, async ({ ack }) => {
    expectNotType<AckFn<void>>(ack);
  }),
);

// For `function` handlers that are not auto-acknowledged, `ack` should be provided/defined
app.function('callback', { autoAcknowledge: false }, async ({ ack }) => {
  expectType<AckFn<void>>(ack);
});

// By default `function` handlers provide/define the proper arguments
app.function('callback', async ({ inputs, complete, fail }) => {
  expectType<FunctionInputs>(inputs);
  expectType<FunctionCompleteFn>(complete);
  expectType<FunctionFailFn>(fail);
});
