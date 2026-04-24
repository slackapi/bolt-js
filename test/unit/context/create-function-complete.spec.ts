import { WebClient } from '@slack/web-api';
import { assert } from 'chai';
import sinon from 'sinon';
import { createFunctionComplete } from '../../../src/context';

describe('createFunctionComplete', () => {
  it('complete should call functions.completeSuccess', async () => {
    const client = new WebClient('sometoken');
    const completeMock = sinon.stub(client.functions, 'completeSuccess').resolves();
    const complete = createFunctionComplete({ isEnterpriseInstall: false, functionExecutionId: 'Fx1234' }, client);
    await complete();
    assert(completeMock.called, 'client.functions.completeSuccess not called!');
    assert(
      completeMock.calledWith({ function_execution_id: 'Fx1234', outputs: {} }),
      'client.functions.completeSuccess called with unexpected arguments!',
    );
  });

  it('should throw if no functionExecutionId present on context', () => {
    const client = new WebClient('sometoken');
    assert.throws(() => {
      createFunctionComplete({ isEnterpriseInstall: false }, client);
    });
  });

  it('should track when the function has been called', async () => {
    const client = new WebClient('sometoken');
    sinon.stub(client.functions, 'completeSuccess').resolves();
    const complete = createFunctionComplete({ isEnterpriseInstall: false, functionExecutionId: 'Fx1234' }, client);

    assert.isFalse(complete.hasBeenCalled(), 'hasBeenCalled should be false initially');

    await complete();
    assert.isTrue(complete.hasBeenCalled(), 'hasBeenCalled should be true after invoking complete');
  });
});
