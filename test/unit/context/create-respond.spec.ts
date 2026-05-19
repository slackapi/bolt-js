import type { FetchFunction } from '@slack/web-api';
import { assert } from 'chai';
import sinon from 'sinon';
import { createRespond } from '../../../src/context';

describe('createRespond', () => {
  it('should post to the response URL with text when given a string', async () => {
    const fakeFetch = sinon.fake.resolves(new Response(null, { status: 200 }));
    const respond = createRespond(fakeFetch as unknown as FetchFunction, 'https://hooks.slack.com/response/123');

    await respond('hello');

    assert(fakeFetch.calledOnce);
    assert.equal(fakeFetch.firstCall.args[0], 'https://hooks.slack.com/response/123');
    assert.equal(fakeFetch.firstCall.args[1].method, 'POST');
    assert.deepEqual(JSON.parse(fakeFetch.firstCall.args[1].body), { text: 'hello' });
  });

  it('should post to the response URL with the full message object', async () => {
    const url = 'https://hooks.slack.com/response/123';
    const fakeFetch = sinon.fake.resolves(new Response(null, { status: 200 }));
    const respond = createRespond(fakeFetch as unknown as FetchFunction, url);

    const message = { text: 'hello', replace_original: true };
    await respond(message);

    assert(fakeFetch.calledOnce);
    assert.equal(fakeFetch.firstCall.args[0], url);
    assert.deepEqual(JSON.parse(fakeFetch.firstCall.args[1].body), message);
  });

  it('should use the correct response URL', async () => {
    const url = 'https://hooks.slack.com/response/456';
    const fakeFetch = sinon.fake.resolves(new Response(null, { status: 200 }));
    const respond = createRespond(fakeFetch as unknown as FetchFunction, url);

    await respond('test');

    assert(fakeFetch.calledOnce);
    assert.equal(fakeFetch.firstCall.args[0], url);
  });
});
