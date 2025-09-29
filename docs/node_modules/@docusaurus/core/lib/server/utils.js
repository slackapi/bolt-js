"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeGlobby = safeGlobby;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const utils_1 = require("@docusaurus/utils");
// Globby that fix Windows path patterns
// See https://github.com/facebook/docusaurus/pull/4222#issuecomment-795517329
async function safeGlobby(patterns, options) {
    // Required for Windows support, as paths using \ should not be used by globby
    // (also using the windows hard drive prefix like c: is not a good idea)
    const globPaths = patterns.map((dirPath) => (0, utils_1.posixPath)(path_1.default.relative(process.cwd(), dirPath)));
    return (0, utils_1.Globby)(globPaths, options);
}
