// tslint:disable:ter-prefer-arrow-callback typedef
import 'mocha'; // tslint:disable-line:no-implicit-dependencies
// import App from './App';

describe('App', function () {
  describe('constructor', function () {
    it('should succeed for single team authorization', async function () {
      const { default: App } = await import('./App'); // tslint:disable-line:variable-name
      new App({ token: '', signingSecret: '' }); // tslint:disable-line:no-unused-expression
    });
  });
});
