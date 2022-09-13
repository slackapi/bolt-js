require('mocha');
const sinon = require('sinon');
const { expect } = require('chai');
const { fs } = require('memfs');
const mockfs = require('mock-fs');
const manifestUtils = require('./manifest');
const { unionMerge, hasManifest, find } = manifestUtils;
const rewiremock = require('rewiremock');

describe('Slack CLI Script Hooks: get-manifest utilities', () => {
  describe('unionMerge', () => {
    it('should return a union of two arrays', () => {
  
      expect(unionMerge(["arwen"],["strider"])).to.eql(["arwen", "strider"]);
      expect(unionMerge(["gandalf", "gandalf"], [])).to.eql(["gandalf"]);
      
      // setup
      const fellowship = ["frodo", "samwise", "merry", "pippin", "gandalf"];
      const hobbits = ["frodo", "samwise", "merry", "pippin"];
      const actualUnion = ["frodo", "samwise", "merry", "pippin", "gandalf"];
      const testUnion = unionMerge(fellowship, hobbits);
      
      // test
      expect(testUnion).to.eql(actualUnion);
    });
  });
  describe('hasManifest', () => {
    it('should return true if at least one non-empty object', () => {
      expect(hasManifest({},{}, { testKey: "testValue" })).to.be.true;
    });
    it('should return false if all empty objects', () => {
      expect(hasManifest({}));
    });
    it('should handle an undefined or null objects', () => {
      expect(hasManifest(undefined, null, { testKey: "testValue"})).to.be.true;
    });
  });
  describe('find', () => {
    beforeEach(() => {
      mockfs({
        '/middle-earth': {
          'README.md': '1',
          'mordor': {
            'sauron.js': '1',
            'orc.js': '1',
            'nazgul.js': '1',
          },
          'node_modules': '1',
          'eriador': {
            'shire': {
              'one-ring.js': '1',
              'nazgul.js': '1',
            },
          },
        },
      });
    })
    afterEach(() => {
      mockfs.restore()
    });
    it('should find the required file in any part of directory', () => {
      const cwd = '/middle-earth';
      //test
      // when target exists
      const result = find(cwd, 'one-ring.js');
      expect(result).to.equal(`${cwd}/eriador/shire/one-ring.js`);
  
      // when target doesn't exist
      const result2 = find(cwd, 'hobbitses.js');
      expect(result2).to.equal(null);
  
      // when multiple similar files exist, it is greedy
      const result3 = find(cwd, 'nazgul.js');
      expect(result3).to.equal(`${cwd}/eriador/shire/nazgul.js`);
    });
    it('should not search within node_modules', () => {
      const cwd = '/middle-earth';
      //test
      const result = find(cwd, 'node_modules');
      expect(result).to.equal(null);
    });
  });
});