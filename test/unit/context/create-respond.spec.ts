import type { AxiosInstance } from 'axios';
import { assert } from 'chai';
import sinon from 'sinon';
import { createRespond } from '../../../src/context';

describe('createRespond', () => {
  it('should post to the response URL with text when given a string', async () => {
    const axiosInstance = { post: sinon.stub().resolves({ status: 200 }) };
    const respond = createRespond(axiosInstance as unknown as AxiosInstance, 'https://hooks.slack.com/response/123');

    await respond('hello');

    assert(axiosInstance.post.calledOnce);
    assert.equal(axiosInstance.post.firstCall.args[0], 'https://hooks.slack.com/response/123');
    assert.deepEqual(axiosInstance.post.firstCall.args[1], { text: 'hello' });
  });

  it('should post to the response URL with the full message object', async () => {
    const url = 'https://hooks.slack.com/response/123';
    const axiosInstance = { post: sinon.stub().resolves({ status: 200 }) };
    const respond = createRespond(axiosInstance as unknown as AxiosInstance, url);

    const message = { text: 'hello', replace_original: true };
    await respond(message);

    assert(axiosInstance.post.calledOnceWithExactly(url, message));
  });

  it('should use the correct response URL', async () => {
    const url = 'https://hooks.slack.com/response/456';
    const axiosInstance = { post: sinon.stub().resolves({ status: 200 }) };
    const respond = createRespond(axiosInstance as unknown as AxiosInstance, url);

    await respond('test');

    assert(axiosInstance.post.calledOnce);
    assert.equal(axiosInstance.post.firstCall.args[0], url);
  });
});
