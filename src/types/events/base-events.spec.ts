import { assert } from 'chai';
import { AppMentionEvent } from './base-events';

describe('Events API payload types', () => {
  it('should be compatible with app_mention payload', () => {
    const payload: AppMentionEvent = {
      type: 'app_mention',
      text: '<@U066C7XNE6M> hey',
      files: [{ id: 'F111' }],
      upload: false,
      user: 'U03E94MK0',
      display_as_bot: false,
      ts: '1707806347.397809',
      blocks: [
        {
          type: 'rich_text',
          block_id: 't9D3L',
          elements: [
            {
              type: 'rich_text_section',
              elements: [
                {
                  type: 'user',
                  user_id: 'U066C7XNE6M',
                },
                {
                  type: 'text',
                  text: ' hey',
                },
              ],
            },
          ],
        },
      ],
      client_msg_id: '883e5317-28e3-4ef8-9385-b88343560de6',
      channel: 'CHE2DUW5V',
      event_ts: '1707806347.397809',
    };
    assert.isNotEmpty(payload);
  });
});
