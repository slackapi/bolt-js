import { assert } from 'chai';
import { RespondArguments } from './utilities';

describe('RespondArguments', () => {
  it('has expected properties', () => {
    const args: RespondArguments = {
      response_type: 'in_channel',
      text: 'Hey!',
      // Verifying this parameter compiles
      // See https://github.com/slackapi/bolt-python/pull/844 for the context
      thread_ts: '111.222',
    };
    assert.exists(args);
  });
  it('has metadata', () => {
    const args: RespondArguments = {
      response_type: 'in_channel',
      text: 'Hey!',
      metadata: {
        event_type: 'test-event',
        event_payload: { foo: 'bar' },
      },
    };
    assert.exists(args);
  });
});
