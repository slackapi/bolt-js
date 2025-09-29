"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToExtensionsRedirects = createToExtensionsRedirects;
exports.createFromExtensionsRedirects = createFromExtensionsRedirects;
const utils_common_1 = require("@docusaurus/utils-common");
const ExtensionAdditionalMessage = 'If the redirect extension system is not good enough for your use case, you can create redirects yourself with the "createRedirects" plugin option.';
const validateExtension = (ext) => {
    if (!ext) {
        throw new Error(`Extension "${ext}" is not allowed.\n${ExtensionAdditionalMessage}`);
    }
    if (ext.includes('.')) {
        throw new Error(`Extension "${ext}" contains a "." (dot) which is not allowed.\n${ExtensionAdditionalMessage}`);
    }
    if (ext.includes('/')) {
        throw new Error(`Extension "${ext}" contains a "/" (slash) which is not allowed.\n${ExtensionAdditionalMessage}`);
    }
    if (encodeURIComponent(ext) !== ext) {
        throw new Error(`Extension "${ext}" contains invalid URI characters.\n${ExtensionAdditionalMessage}`);
    }
};
const addLeadingDot = (extension) => `.${extension}`;
/**
 * Create new `/path` that redirects to existing an `/path.html`
 */
function createToExtensionsRedirects(paths, extensions) {
    extensions.forEach(validateExtension);
    const dottedExtensions = extensions.map(addLeadingDot);
    const createPathRedirects = (path) => {
        const extensionFound = dottedExtensions.find((ext) => path.endsWith(ext));
        if (extensionFound) {
            return [{ from: (0, utils_common_1.removeSuffix)(path, extensionFound), to: path }];
        }
        return [];
    };
    return paths.flatMap(createPathRedirects);
}
/**
 * Create new `/path.html/index.html` that redirects to existing an `/path`
 * The filename pattern might look weird but it's on purpose (see
 * https://github.com/facebook/docusaurus/issues/5055)
 */
function createFromExtensionsRedirects(paths, extensions) {
    extensions.forEach(validateExtension);
    const dottedExtensions = extensions.map(addLeadingDot);
    const alreadyEndsWithAnExtension = (str) => dottedExtensions.some((ext) => str.endsWith(ext));
    const createPathRedirects = (path) => {
        if (path === '' || path === '/' || alreadyEndsWithAnExtension(path)) {
            return [];
        }
        return extensions.map((ext) => ({
            // /path => /path.html
            // /path/ => /path.html/
            from: path.endsWith('/')
                ? (0, utils_common_1.addTrailingSlash)(`${(0, utils_common_1.removeTrailingSlash)(path)}.${ext}`)
                : `${path}.${ext}`,
            to: path,
        }));
    };
    return paths.flatMap(createPathRedirects);
}
