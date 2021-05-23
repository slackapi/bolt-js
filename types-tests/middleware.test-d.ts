import App from '../src/App';
import { onlyViewActions, onlyCommands } from '../src/middleware/builtin';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// https://github.com/slackapi/bolt-js/issues/911
app.use(async (args) => {
  onlyViewActions(args);
});
app.use(async (args) => {
  onlyCommands(args);
});