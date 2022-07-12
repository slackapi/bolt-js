require('mocha');
const sinon = require('sinon');
const { expect } = require('chai');
const { fs } = require('memfs');
const mockfs = require('mock-fs');
const manifestUtils = require('./manifest');
const { unionMerge, hasManifest, find, readManifestJSONFile, readImportedManifestFile} = manifestUtils;

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
  
      // cleanup
      mockfs.restore();
    });
  });
  describe('manifest imports', () => {
    let manifestFilePath, manifestFind, fsReadFileSync, fsExistsSync;
    beforeEach(() => {
      // These stubs affect the `os` package behaviors
      manifestFilePath = "a/dummy/path";
      manifestFind = sinon.stub(manifestUtils, "find").returns(manifestFilePath);
      fsReadFileSync = sinon.stub(fs, "readFileSync").returns(JSON.parse("{}"));
      fsExistsSync = sinon.stub(fs, "existsSync").returns(true);
    });

    afterEach(() => {
      manifestFind.restore();
      fsReadFileSync.restore();
      fsExistsSync.restore();
    });
    describe('readManifestJSONFile', () => {
      it("when file exists at path, it should read the file", () => {
        readManifestJSONFile("", "testFileName");
        fsReadFileSync.calledWith(manifestFilePath, 'utf8');
      });
  
      it("when file doesn't exist at path, it should NOT read a file", () => {
        // disable spy for this test, should return false
        fsExistsSync.restore();
        readManifestJSONFile("", "testFileName");
        fsReadFileSync.neverCalledWith(manifestFilePath, 'utf');
      });
    });
    describe('readImportedManifestFile', () => {
      let requireStub;
      beforeEach(() => {
        requireStub = sinon.stub(module, "require");
      });
      afterEach(() => {
        requireStub.restore();
      })
      it("when file exists at path, it should import module", () => {
        readImportedManifestFile("", "testFileName");
        requireStub.calledWith(manifestFilePath);
      });
      it("when file doesn't exists at path, it should NOT import module", () => {
        readImportedManifestFile("", "testFileName");
        requireStub.neverCalledWith(manifestFilePath);
      });
    });
  });
});
