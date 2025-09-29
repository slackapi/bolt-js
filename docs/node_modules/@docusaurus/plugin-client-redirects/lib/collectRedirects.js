"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = collectRedirects;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const logger_1 = tslib_1.__importDefault(require("@docusaurus/logger"));
const utils_common_1 = require("@docusaurus/utils-common");
const extensionRedirects_1 = require("./extensionRedirects");
const redirectValidation_1 = require("./redirectValidation");
function collectRedirects(pluginContext, trailingSlash) {
    // For each plugin config option, create the appropriate redirects
    const redirects = [
        ...(0, extensionRedirects_1.createFromExtensionsRedirects)(pluginContext.relativeRoutesPaths, pluginContext.options.fromExtensions),
        ...(0, extensionRedirects_1.createToExtensionsRedirects)(pluginContext.relativeRoutesPaths, pluginContext.options.toExtensions),
        ...createRedirectsOptionRedirects(pluginContext.options.redirects),
        ...createCreateRedirectsOptionRedirects(pluginContext.relativeRoutesPaths, pluginContext.options.createRedirects),
    ].map((redirect) => ({
        ...redirect,
        // Given a redirect with `to: "/abc"` and `trailingSlash` enabled:
        //
        // - We don't want to reject `to: "/abc"`, as that unambiguously points to
        // `/abc/` now;
        // - We want to redirect `to: /abc/` without the user having to change all
        // her redirect plugin options
        //
        // It should be easy to toggle `trailingSlash` option without having to
        // change other configs
        to: (0, utils_common_1.applyTrailingSlash)(redirect.to, {
            trailingSlash,
            baseUrl: pluginContext.baseUrl,
        }),
    }));
    validateCollectedRedirects(redirects, pluginContext);
    return filterUnwantedRedirects(redirects, pluginContext);
}
function validateCollectedRedirects(redirects, pluginContext) {
    const redirectValidationErrors = redirects
        .map((redirect) => {
        try {
            (0, redirectValidation_1.validateRedirect)(redirect);
            return undefined;
        }
        catch (err) {
            return err.message;
        }
    })
        .filter(Boolean);
    if (redirectValidationErrors.length > 0) {
        throw new Error(`Some created redirects are invalid:
- ${redirectValidationErrors.join('\n- ')}
`);
    }
    const allowedToPaths = pluginContext.relativeRoutesPaths.map((p) => decodeURI(p));
    const toPaths = redirects
        .map((redirect) => redirect.to)
        // We now allow "to" to contain any string
        // We only do this "broken redirect" check from to that looks like pathnames
        // note: we allow querystring/anchors
        // See https://github.com/facebook/docusaurus/issues/6845
        .map((to) => {
        if (to.startsWith('/')) {
            try {
                return decodeURI(new URL(to, 'https://example.com').pathname);
            }
            catch (e) { }
        }
        return undefined;
    })
        .filter((to) => typeof to !== 'undefined');
    const trailingSlashConfig = pluginContext.siteConfig.trailingSlash;
    // Key is the path, value is whether a valid toPath with a different trailing
    // slash exists; if the key doesn't exist it means it's valid
    const differByTrailSlash = new Map(toPaths.map((path) => [path, false]));
    allowedToPaths.forEach((toPath) => {
        if (differByTrailSlash.has(toPath)) {
            differByTrailSlash.delete(toPath);
        }
        else if (differByTrailSlash.has((0, utils_common_1.removeTrailingSlash)(toPath))) {
            if (trailingSlashConfig === true) {
                differByTrailSlash.set((0, utils_common_1.removeTrailingSlash)(toPath), true);
            }
            else {
                differByTrailSlash.delete((0, utils_common_1.removeTrailingSlash)(toPath));
            }
        }
        else if (differByTrailSlash.has((0, utils_common_1.addTrailingSlash)(toPath))) {
            if (trailingSlashConfig === false) {
                differByTrailSlash.set((0, utils_common_1.addTrailingSlash)(toPath), true);
            }
            else {
                differByTrailSlash.delete((0, utils_common_1.addTrailingSlash)(toPath));
            }
        }
    });
    if (differByTrailSlash.size > 0) {
        const errors = Array.from(differByTrailSlash.entries());
        let message = 'You are trying to create client-side redirections to invalid paths.\n';
        const [trailingSlashIssues, invalidPaths] = lodash_1.default.partition(errors, ([, differ]) => differ);
        if (trailingSlashIssues.length) {
            message += `
These paths do exist, but because you have explicitly set trailingSlash=${trailingSlashConfig}, you need to write the path ${trailingSlashConfig ? 'with trailing slash' : 'without trailing slash'}:
- ${trailingSlashIssues.map(([p]) => p).join('\n- ')}
`;
        }
        if (invalidPaths.length) {
            message += `
These paths are redirected to but do not exist:
- ${invalidPaths.map(([p]) => p).join('\n- ')}

Valid paths you can redirect to:
- ${allowedToPaths.join('\n- ')}
`;
        }
        throw new Error(message);
    }
}
function filterUnwantedRedirects(redirects, pluginContext) {
    // We don't want to create the same redirect twice, since that would lead to
    // writing the same html redirection file twice.
    Object.entries(lodash_1.default.groupBy(redirects, (redirect) => redirect.from)).forEach(([from, groupedFromRedirects]) => {
        if (groupedFromRedirects.length > 1) {
            logger_1.default.report(pluginContext.siteConfig.onDuplicateRoutes) `name=${'@docusaurus/plugin-client-redirects'}: multiple redirects are created with the same "from" pathname: path=${from}
It is not possible to redirect the same pathname to multiple destinations:${groupedFromRedirects.map((r) => JSON.stringify(r))}`;
        }
    });
    const collectedRedirects = lodash_1.default.uniqBy(redirects, (redirect) => redirect.from);
    const { false: newRedirects = [], true: redirectsOverridingExistingPath = [] } = lodash_1.default.groupBy(collectedRedirects, (redirect) => pluginContext.relativeRoutesPaths.includes(redirect.from));
    if (redirectsOverridingExistingPath.length > 0) {
        logger_1.default.report(pluginContext.siteConfig.onDuplicateRoutes) `name=${'@docusaurus/plugin-client-redirects'}: some redirects would override existing paths, and will be ignored:${redirectsOverridingExistingPath.map((r) => JSON.stringify(r))}`;
    }
    return newRedirects;
}
function createRedirectsOptionRedirects(redirectsOption) {
    // For convenience, user can use a string or a string[]
    function optionToRedirects(option) {
        if (typeof option.from === 'string') {
            return [{ from: option.from, to: option.to }];
        }
        return option.from.map((from) => ({ from, to: option.to }));
    }
    return redirectsOption.flatMap(optionToRedirects);
}
// Create redirects from the "createRedirects" fn provided by the user
function createCreateRedirectsOptionRedirects(paths, createRedirects) {
    function createPathRedirects(path) {
        const fromsMixed = createRedirects?.(path) ?? [];
        const froms = typeof fromsMixed === 'string' ? [fromsMixed] : fromsMixed;
        return froms.map((from) => ({ from, to: path }));
    }
    return paths.flatMap(createPathRedirects);
}
