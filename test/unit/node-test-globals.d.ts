import type {
  after as nodeAfter,
  afterEach as nodeAfterEach,
  before as nodeBefore,
  beforeEach as nodeBeforeEach,
  describe as nodeDescribe,
  it as nodeIt,
} from 'node:test';

declare global {
  const describe: typeof nodeDescribe;
  const it: typeof nodeIt;
  const before: typeof nodeBefore;
  const after: typeof nodeAfter;
  const beforeEach: typeof nodeBeforeEach;
  const afterEach: typeof nodeAfterEach;
}

export {};
