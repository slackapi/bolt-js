import { expectType } from 'tsd';
import { App, SlackViewAction, ViewOutput } from '..';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// view_submission
expectType<void>(
  app.view('modal-id', async ({ body, view }) => {
    // TODO: the body can be more specific (ViewSubmitAction) here
    expectType<SlackViewAction>(body);
    expectType<ViewOutput>(view);
    await Promise.resolve(view);
  })
);

expectType<void>(
  app.view({ type: 'view_submission', callback_id: 'modal-id' }, async ({ body, view }) => {
    // TODO: the body can be more specific (ViewSubmitAction) here
    expectType<SlackViewAction>(body);
    expectType<ViewOutput>(view);
    await Promise.resolve(view);
  })
);

// view_closed
expectType<void>(
  app.view({ type: 'view_closed', callback_id: 'modal-id' }, async ({ body, view }) => {
    // TODO: the body can be more specific (ViewClosedAction) here
    expectType<SlackViewAction>(body);
    expectType<ViewOutput>(view);
    await Promise.resolve(view);
  })
);

const viewSubmissionPayload: ViewOutput = {
  "id": "V111",
  "team_id": "T111",
  "type": "modal",
  "blocks": [
    {
      "type": "divider",
      "block_id": "+3ht"
    }
  ],
  "private_metadata": "",
  "callback_id": "",
  "state": {
    "values": {
      "aPVYH": {
        "g/t5": {
          "type": "radio_buttons",
          "selected_option": null
        }
      },
      "1pSa": {
        "h3R": {
          "type": "multi_static_select",
          "selected_options": []
        }
      },
      "a/Rt": {
        "zmPQ": {
          "type": "plain_text_input",
          "value": null
        }
      },
      "7/wWO": {
        "HdJj": {
          "type": "plain_text_input",
          "value": "test"
        }
      }
    }
  },
  "hash": "1618378109.3ndA0Spf",
  "title": {
    "type": "plain_text",
    "text": "Workplace check-in",
    "emoji": true
  },
  "clear_on_close": false,
  "notify_on_close": false,
  "close": {
    "type": "plain_text",
    "text": "Cancel",
    "emoji": true
  },
  "submit": {
    "type": "plain_text",
    "text": "Submit",
    "emoji": true
  },
  "previous_view_id": null,
  "root_view_id": "V1234567890",
  "app_id": "A02",
  "external_id": "",
  "app_installed_team_id": "T5J4Q04QG",
  "bot_id": "B00"
};
expectType<ViewOutput>(viewSubmissionPayload);