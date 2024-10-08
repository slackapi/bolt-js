import { assert } from 'chai';
import { expectType } from 'tsd';
import type { SlackEventMiddlewareArgsOptions } from '../../src/types/events';
import { isSlackEventMiddlewareArgsOptions } from '../../src/types/utilities';

describe(isSlackEventMiddlewareArgsOptions.name, () => {
  it('should return true if object is SlackEventMiddlewareArgsOptions', async () => {
    const actual = isSlackEventMiddlewareArgsOptions({ autoAcknowledge: true });
    assert.isTrue(actual);
  });

  it('should narrow proper type if object is SlackEventMiddlewareArgsOptions', async () => {
    const option = { autoAcknowledge: true };
    if (isSlackEventMiddlewareArgsOptions({ autoAcknowledge: true })) {
      expectType<SlackEventMiddlewareArgsOptions>(option);
    } else {
      assert.fail(`${option} should be of type SlackEventMiddlewareArgsOption`);
    }
  });

  it('should return false if object is Middleware', async () => {
    const actual = isSlackEventMiddlewareArgsOptions(async () => {});
    assert.isFalse(actual);
  });
});
