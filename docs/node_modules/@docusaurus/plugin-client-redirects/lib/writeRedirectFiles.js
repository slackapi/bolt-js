"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToUrl = createToUrl;
exports.toRedirectFiles = toRedirectFiles;
exports.writeRedirectFile = writeRedirectFile;
exports.default = writeRedirectFiles;
const tslib_1 = require("tslib");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const logger_1 = tslib_1.__importDefault(require("@docusaurus/logger"));
const utils_1 = require("@docusaurus/utils");
const createRedirectPageContent_1 = tslib_1.__importDefault(require("./createRedirectPageContent"));
function createToUrl(baseUrl, to) {
    if (to.startsWith('/')) {
        return (0, utils_1.normalizeUrl)([baseUrl, to]);
    }
    return to;
}
// Create redirect file path
// Make sure this path has lower precedence over the original file path when
// served by host providers!
// Otherwise it can produce infinite redirect loops!
//
// See https://github.com/facebook/docusaurus/issues/5055
// See https://github.com/facebook/docusaurus/pull/5085
// See https://github.com/facebook/docusaurus/pull/5102
function getRedirectFilePath(fromPath, trailingSlash) {
    const fileName = path_1.default.basename(fromPath);
    const filePath = path_1.default.dirname(fromPath);
    // Edge case for https://github.com/facebook/docusaurus/pull/5102
    // If the redirect source path is /xyz, with file /xyz.html
    // We can't write the redirect file at /xyz.html/index.html because for Unix
    // FS, a file/folder can't have the same name "xyz.html"
    // The only possible solution for a redirect file is thus /xyz.html.html (I
    // know, looks suspicious)
    if (trailingSlash === false && fileName.endsWith('.html')) {
        return path_1.default.join(filePath, `${fileName}.html`);
    }
    // If the target path is /xyz, with file /xyz/index.html, we don't want the
    // redirect file to be /xyz.html, otherwise it would be picked in priority and
    // the redirect file would redirect to itself. We prefer the redirect file to
    // be /xyz.html/index.html, served with lower priority for most static hosting
    // tools
    return path_1.default.join(filePath, `${fileName}/index.html`);
}
function toRedirectFiles(redirects, pluginContext, trailingSlash) {
    // Perf: avoid rendering the template twice with the exact same "props"
    // We might create multiple redirect pages for the same destination url
    // note: the first fn arg is the cache key!
    const createPageContentMemoized = lodash_1.default.memoize((toUrl) => (0, createRedirectPageContent_1.default)({ toUrl }));
    const createFileMetadata = (redirect) => {
        const fileRelativePath = getRedirectFilePath(redirect.from, trailingSlash);
        const fileAbsolutePath = path_1.default.join(pluginContext.outDir, fileRelativePath);
        const toUrl = createToUrl(pluginContext.baseUrl, redirect.to);
        const fileContent = createPageContentMemoized(toUrl);
        return {
            ...redirect,
            fileAbsolutePath,
            fileContent,
        };
    };
    return redirects.map(createFileMetadata);
}
async function writeRedirectFile(file) {
    try {
        // User-friendly security to prevent file overrides
        if (await fs_extra_1.default.pathExists(file.fileAbsolutePath)) {
            throw new Error('The redirect plugin is not supposed to override existing files.');
        }
        await fs_extra_1.default.outputFile(file.fileAbsolutePath, file.fileContent, 
        // Hard security to prevent file overrides
        // See https://stackoverflow.com/a/34187712/82609
        { flag: 'wx' });
    }
    catch (err) {
        logger_1.default.error `Redirect file creation error for path=${file.fileAbsolutePath}.`;
        throw err;
    }
}
async function writeRedirectFiles(redirectFiles) {
    await Promise.all(redirectFiles.map(writeRedirectFile));
}
