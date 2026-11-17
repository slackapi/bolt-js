import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import type { FetchFunction } from '@slack/web-api';
import { createRespond } from '../../../src/context';
import { ErrorCode, type RespondError } from '../../../src/errors';

type FakeFetch = (url: string, init: { method: string; body: string }) => Promise<Response>;

describe('createRespond', () => {
  it('should post to the response URL with text when given a string', async () => {
    const fakeFetch = mock.fn<FakeFetch>(() => Promise.resolve(new Response(null, { status: 200 })));
    const respond = createRespond(fakeFetch as unknown as FetchFunction, 'https://hooks.slack.com/response/123');

    await respond('hello');

    assert.strictEqual(fakeFetch.mock.callCount(), 1);
    assert.equal(fakeFetch.mock.calls[0].arguments[0], 'https://hooks.slack.com/response/123');
    assert.equal(fakeFetch.mock.calls[0].arguments[1].method, 'POST');
    assert.deepEqual(JSON.parse(fakeFetch.mock.calls[0].arguments[1].body), { text: 'hello' });
  });

  it('should post to the response URL with the full message object', async () => {
    const url = 'https://hooks.slack.com/response/123';
    const fakeFetch = mock.fn<FakeFetch>(() => Promise.resolve(new Response(null, { status: 200 })));
    const respond = createRespond(fakeFetch as unknown as FetchFunction, url);

    const message = { text: 'hello', replace_original: true };
    await respond(message);

    assert.strictEqual(fakeFetch.mock.callCount(), 1);
    assert.equal(fakeFetch.mock.calls[0].arguments[0], url);
    assert.deepEqual(JSON.parse(fakeFetch.mock.calls[0].arguments[1].body), message);
  });

  it('should use the correct response URL', async () => {
    const url = 'https://hooks.slack.com/response/456';
    const fakeFetch = mock.fn<FakeFetch>(() => Promise.resolve(new Response(null, { status: 200 })));
    const respond = createRespond(fakeFetch as unknown as FetchFunction, url);

    await respond('test');

    assert.strictEqual(fakeFetch.mock.callCount(), 1);
    assert.equal(fakeFetch.mock.calls[0].arguments[0], url);
  });

  it('should return the response when the request succeeds', async () => {
    const response = new Response(null, { status: 200 });
    const fakeFetch = mock.fn<FakeFetch>(() => Promise.resolve(response));
    const respond = createRespond(fakeFetch as unknown as FetchFunction, 'https://hooks.slack.com/response/123');

    const result = await respond('hello');

    assert.equal(result, response);
  });

  it('should throw a RespondError when the response is not ok', async () => {
    const fakeFetch = mock.fn<FakeFetch>(() =>
      Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' })),
    );
    const respond = createRespond(fakeFetch as unknown as FetchFunction, 'https://hooks.slack.com/response/123');

    try {
      await respond('hello');
      assert.fail('Expected respond to throw');
    } catch (error) {
      const respondError = error as RespondError;
      assert.equal(respondError.code, ErrorCode.RespondError);
      assert.equal(respondError.statusCode, 404);
    }
  });
});
