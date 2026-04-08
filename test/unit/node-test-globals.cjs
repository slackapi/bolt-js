const test = require('node:test');

global.describe = test.describe;
global.it = test.it;
global.before = test.before;
global.after = test.after;
global.beforeEach = test.beforeEach;
global.afterEach = test.afterEach;
