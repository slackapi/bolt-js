import { expectError, expectNotType, expectType } from 'tsd';
import App from '../../src/App';
import type { FunctionCompleteFn, FunctionFailFn } from '../../src/CustomFunction';
import type { FunctionInputs } from '../../src/types';
import type { AckFn } from '../../src/types/utilities';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

expectError(
  app.function('callback', async ({ ack }) => {
    expectNotType<AckFn<void>>(ack);
  }),
);

expectError(
  app.function('callback', { autoAcknowledge: true }, async ({ ack }) => {
    expectNotType<AckFn<void>>(ack);
  }),
);

app.function('callback', { autoAcknowledge: false }, async ({ ack }) => {
  expectType<AckFn<void>>(ack);
});

app.function('callback', async ({ inputs, complete, fail }) => {
  expectType<FunctionInputs>(inputs);
  expectType<FunctionCompleteFn>(complete);
  expectType<FunctionFailFn>(fail);
});
