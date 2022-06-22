require('mocha');
const { expect } = require('chai');
const { vol, createFsFromVolume } = require('memfs');
const { unionMerge, hasManifest, find } = require('./manifest');

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
    })
  });
  describe('find', () => {
    it('should find the required file in any part of directory', () => {
      //setup
      const json = {
        './README.md': '1',
        './mordor/sauron.js': '1',
        './mordor/orc.js': '1',
        './mordor/nazgul.js': '1',
        './node_modules/': '1',
        './eriador/shire/one-ring.js': '1',
        './eriador/shire/nazgul.js': '1'
      };
      const cwd = '/middle-earth';
      vol.fromJSON(json, cwd);
      const mockfs = createFsFromVolume(vol);

      //test
      // when target exists
      const result = find(cwd, 'one-ring.js', { mockfs });
      expect(result).to.equal(`${cwd}/eriador/shire/one-ring.js`);
 
      // when target doesn't exist
      const result2 = find(cwd, 'hobbitses.js', { mockfs });
      expect(result2).to.equal(undefined);

      // when multiple similar files exist, it is greedy
      const result3 = find(cwd, 'nazgul.js', { mockfs });
      expect(result3).to.equal(`${cwd}/eriador/shire/nazgul.js`);
    });
  });
});
