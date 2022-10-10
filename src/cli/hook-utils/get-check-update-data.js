const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const SLACK_JSON_SDKS = ['@slack/bolt', '@slack/deno-slack-sdk'];
let dependencyExports = {};

/**
 * Checks for available SDK updates for specified dependencies, creates a version map,
 * and then wraps everything up into a response to be passed to the CLI.
 * @param cwd the current working directory
 */
async function checkForSDKUpdates(cwd) {
  const { versionMap, inaccessibleFiles } = await createVersionMap(cwd);
  const updateResp = createUpdateResp(versionMap, inaccessibleFiles);
  return updateResp;
}

/**
 * Create a version map that contains each (Slack) dependency, detailing info about
 * current and latest versions, as well as if breaking changes are present or if there
 * were any errors with getting version retrieval.
 * @param cwd the current working directory of the CLI project
 */
async function createVersionMap(cwd) {
  const { versionMap, inaccessibleFiles } = await readProjectDependencies(cwd).catch((err) => {
    throw new Error(err);
  });

  // Iterate through each dependency for updates
  for (const [sdk, value] of Object.entries(versionMap)) {
    if (value) {
      const current = versionMap[sdk].current || '';
      let latest = '',
        error = null;

      try {
        latest = await fetchLatestModuleVersion(sdk);
      } catch (err) {
        error = err;
      }
      const update = !!current && !!latest && current !== latest;
      const breaking = hasBreakingChange(current, latest);

      versionMap[sdk] = {
        ...versionMap[sdk],
        latest,
        update,
        breaking,
        error,
      };
    }
  }

  return { versionMap, inaccessibleFiles };
}

/**
 * Reads project dependencies - cycles through project dependency files, extracts
 * the listed dependencies, and adds it in to the version map with version info.
 * @param cwd the current working directory of the CLI project
 */
async function readProjectDependencies(cwd) {
  const versionMap = {};
  const { dependencyFiles, inaccessibleFiles } = await gatherDependencyFiles(
    cwd
  );

  for (const fileName of dependencyFiles) {
    try {
      const fileJSON = await getJSON(`${cwd}/${fileName}`);
      const fileDependencies =
        await dependencyExports.extractDependencies(fileJSON, fileName);

      // For each dependency found, compare to SDK-related dependency
      // list and, if known, update the versionMap with version information
      for (const [key, val] of fileDependencies) {
        for (const sdk of SLACK_JSON_SDKS) {
          if (key !== '' && key === sdk) {
            versionMap[sdk] = {
              name: sdk,
              current: val.version ? val.version : '',
            };
          }
        }
      }
    } catch (err) {
      inaccessibleFiles.push({ name: fileName, error: err });
    }
  }

  return { versionMap, inaccessibleFiles };
}

/**
 * Reads and parses JSON file - if it works, returns the file contents.
 * If not, returns an empty object
 * @param filePath the path of the file being read
 */
async function getJSON(filePath) {
  let fileContents = {};
  try {
    if (fs.existsSync(filePath)) {
      fileContents = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      throw new Error('Cannot find a file at path ' + filePath);
    }
  } catch (err) {
    throw new Error(err);
  }
  return fileContents;
}

/**
 * Gathers all related dependency files for the CLI project (package.json).
 * @param cwd the current working directory of the CLI project
 */
async function gatherDependencyFiles(cwd) {
  const { jsonDepFiles, inaccessibleFiles } = await getJSONFiles(cwd);
  const dependencyFiles = jsonDepFiles;
  return { dependencyFiles, inaccessibleFiles };
}

/**
 * Gets the needed files that contain dependency info (package.json).
 * @param cwd the current working directory of the CLI project
 */
async function getJSONFiles(cwd) {
  const jsonFiles = ['package.json'];
  const jsonDepFiles = [];
  const inaccessibleFiles = [];

  for (const fileName of jsonFiles) {
    try {
      const jsonFile = await getJSON(`${cwd}/${fileName}`);
      const jsonIsParsable =
        jsonFile &&
        typeof jsonFile === 'object' &&
        !Array.isArray(jsonFile) &&
        jsonFile.dependencies;

      if (jsonIsParsable) {
        jsonDepFiles.push(fileName);
      }
    } catch (err) {
      inaccessibleFiles.push({ name: fileName, error: err });
    }
  }

  return { jsonDepFiles, inaccessibleFiles };
}

/**
 * Pulls dependencies from a given file and JSON structure.
 * @param json JSON information that includes dependencies
 * @param fileName name of the file that the dependency list is coming from
 */
dependencyExports.extractDependencies = async (json, fileName) => {
  // Determine if the JSON passed is an object
  const jsonIsParsable =
    json !== null && typeof json === 'object' && !Array.isArray(json);

  if (jsonIsParsable) {
    let boltCurrentVersion = '';
    let denoCurrentVersion = '';
    if (json['dependencies']['@slack/bolt']) {
      const boltCurrentVersionOutput = JSON.parse(
        await dependencyExports.getBoltCurrentVersion()
      );

      if (boltCurrentVersionOutput !== '') {
        boltCurrentVersion =
          boltCurrentVersionOutput['dependencies']['@slack/bolt']['version'];
      }
    }
    if (json['dependencies']['@slack/deno-slack-sdk']) {
      const denoCurrentVersionOutput = JSON.parse(
        await dependencyExports.getDenoCurrentVersion()
      );

      if (denoCurrentVersionOutput !== '') {
        denoCurrentVersion =
          denoCurrentVersionOutput['dependencies']['@slack/deno-slack-sdk'][
            'version'
          ];
      }
    }

    return [
      [
        '@slack/bolt',
        {
          version: boltCurrentVersion,
        },
      ],
      [
        '@slack/deno-slack-sdk',
        {
          version: denoCurrentVersion,
        },
      ],
    ];
  }

  return [];
};

/**
 * Gets the latest module version.
 * @param moduleName the module that the latest version is being queried for
 */
async function fetchLatestModuleVersion(moduleName) {
  let command = "";
  if (moduleName === '@slack/bolt') {
    command = `npm info ${moduleName} version --tag next-gen`;
  } else if (moduleName === '@slack/deno-slack-sdk') {
    command = `npm info ${moduleName} version --tag latest`;
  }
  const { stdout } = await exec(command).catch((err) => {
    throw new Error(err);
  });

  return stdout ? stdout.replace(/\n$/, '') : '';
}

/**
 * Checks if a dependency's upgrade from a current to the latest version will cause a
 * breaking change.
 * @param current current dependency version in project
 * @param latest most up-to-date dependency version available on NPM
 */
function hasBreakingChange(current, latest) {
  const currMajor = current.split('.')[0];
  const latestMajor = latest.split('.')[0];
  return +latestMajor - +currMajor >= 1;
}

/**
 * Creates the update response - returns an object in the expected response format.
 * @param versionMap version map of checked dependencies, current versions, and info on upgrade + breaking changes
 * @param inaccessibleFiles array of files that could not be read or accessed
 */
function createUpdateResp(versionMap, inaccessibleFiles) {
  const name = 'the Slack SDK';
  const releases = [];
  const message = '';
  const url = 'https://api.slack.com/future/changelog';
  const fileErrorMsg = createFileErrorMsg(inaccessibleFiles);

  let error = null;
  let errorMsg = '';

  // Output information for each dependency
  for (const sdk of Object.values(versionMap)) {
    // Dependency has an update OR the fetch of update failed
    if (sdk) {
      releases.push(sdk);

      // Add the dependency that failed to be fetched to the top-level error message
      if (sdk.error && sdk.error.message) {
        errorMsg += errorMsg
          ? `, ${sdk}`
          : `An error occurred fetching updates for the following packages: ${sdk.name}`;
      }
    }
  }

  // If there were issues accessing dependency files, append error message(s)
  if (inaccessibleFiles.length) {
    errorMsg += errorMsg ? `\n\n   ${fileErrorMsg}` : fileErrorMsg;
  }

  if (errorMsg) error = { message: errorMsg };

  return {
    name,
    message,
    releases,
    url,
    error,
  };
}

/**
 * Returns error when dependency files cannot be read.
 * @param inaccessibleFiles array of files that could not be read or accessed
 */
function createFileErrorMsg(inaccessibleFiles) {
  let fileErrorMsg = '';

  // There were issues with reading some of the files that were found
  for (const file of inaccessibleFiles) {
    fileErrorMsg += fileErrorMsg
      ? `\n   ${file.name}: ${file.error.message}`
      : `An error occurred while reading the following files: \n\n   ${file.name}: ${file.error.message}`;
  }

  return fileErrorMsg;
}
/**
 * Queries for current Deno version of the project.
 */
dependencyExports.getDenoCurrentVersion = async () => {
  const { stdout } = await exec(
    'npm list @slack/deno-slack-sdk --depth=0 --json'
  ).catch((err) => {
    throw new Error(err);
  });

  return stdout ? stdout : '';
};

/**
 * Queries for current Bolt version of the project.
 */
dependencyExports.getBoltCurrentVersion = async () => {
  const { stdout } = await exec(
    'npm list @slack/bolt --depth=0 --json'
  ).catch((err) => {
    throw new Error(err, {
      cause: err
    });
  });;

  return stdout ? stdout : '';
};

module.exports = {
  checkForSDKUpdates,
  getJSON,
  getJSONFiles,
  dependencyExports,
};
