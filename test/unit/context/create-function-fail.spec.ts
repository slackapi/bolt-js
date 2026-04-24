import { WebClient } from '@slack/web-api';
import { assert } from 'chai';
import sinon from 'sinon';
import { createFunctionFail } from '../../../src/context';

describe('createFunctionFail', () => {
  it('fail should call functions.completeError', async () => {
    const client = new WebClient('sometoken');
    const completeMock = sinon.stub(client.functions, 'completeError').resolves();
    const fail = createFunctionFail({ isEnterpriseInstall: false, functionExecutionId: 'Fx1234' }, client);
    await fail({ error: 'boom' });
    assert(completeMock.called, 'client.functions.completeError not called!');
    assert(
      completeMock.calledWith({ function_execution_id: 'Fx1234', error: 'boom' }),
      'client.functions.completeError called with unexpected arguments!',
    );
  });

  it('should throw if no functionExecutionId present on context', () => {
    const client = new WebClient('sometoken');
    assert.throws(() => {
      createFunctionFail({ isEnterpriseInstall: false }, client);
    });
  });

  it('should track when the function has been called', async () => {
    const client = new WebClient('sometoken');
    sinon.stub(client.functions, 'completeError').resolves();
    const fail = createFunctionFail({ isEnterpriseInstall: false, functionExecutionId: 'Fx1234' }, client);

    assert.isFalse(fail.hasBeenCalled(), 'hasBeenCalled should be false initially');

    await fail({ error: 'boom' });
    assert.isTrue(fail.hasBeenCalled(), 'hasBeenCalled should be true after calling the function');
  });
});
