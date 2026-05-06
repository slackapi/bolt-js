import type { FetchFunction } from '@slack/web-api';
import { assert } from 'chai';
import sinon from 'sinon';
import { createRespond } from '../../../src/context';

describe('createRespond', () => {
  it('should post to the response URL with text when given a string', async () => {
    const fetchStub = sinon.stub().resolves(new Response(null, { status: 200 }));
    const respond = createRespond(fetchStub as unknown as FetchFunction, 'https://hooks.slack.com/response/123');

    await respond('hello');

    assert(fetchStub.calledOnce);
    assert.equal(fetchStub.firstCall.args[0], 'https://hooks.slack.com/response/123');
    const init = fetchStub.firstCall.args[1];
    assert.equal(init.method, 'POST');
    assert.equal(init.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(init.body), { text: 'hello' });
  });

  it('should post to the response URL with the full message object', async () => {
    const url = 'https://hooks.slack.com/response/123';
    const fetchStub = sinon.stub().resolves(new Response(null, { status: 200 }));
    const respond = createRespond(fetchStub as unknown as FetchFunction, url);

    const message = { text: 'hello', replace_original: true };
    await respond(message);

    assert(fetchStub.calledOnce);
    assert.equal(fetchStub.firstCall.args[0], url);
    const init = fetchStub.firstCall.args[1];
    assert.equal(init.method, 'POST');
    assert.deepEqual(JSON.parse(init.body), message);
  });

  it('should use the correct response URL', async () => {
    const url = 'https://hooks.slack.com/response/456';
    const fetchStub = sinon.stub().resolves(new Response(null, { status: 200 }));
    const respond = createRespond(fetchStub as unknown as FetchFunction, url);

    await respond('test');

    assert(fetchStub.calledOnce);
    assert.equal(fetchStub.firstCall.args[0], url);
  });
});
