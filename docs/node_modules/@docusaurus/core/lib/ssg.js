"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAppRenderer = loadAppRenderer;
exports.generateStaticFiles = generateStaticFiles;
exports.generateHashRouterEntrypoint = generateHashRouterEntrypoint;
const tslib_1 = require("tslib");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const module_1 = require("module");
const path_1 = tslib_1.__importDefault(require("path"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const eval_1 = tslib_1.__importDefault(require("eval"));
const p_map_1 = tslib_1.__importDefault(require("p-map"));
const html_minifier_terser_1 = require("html-minifier-terser");
const logger_1 = tslib_1.__importDefault(require("@docusaurus/logger"));
const utils_1 = require("./utils");
const templates_1 = require("./templates/templates");
// Secret way to set SSR plugin concurrency option
// Waiting for feedback before documenting this officially?
const Concurrency = process.env.DOCUSAURUS_SSR_CONCURRENCY
    ? parseInt(process.env.DOCUSAURUS_SSR_CONCURRENCY, 10)
    : // Not easy to define a reasonable option default
        // Will still be better than Infinity
        // See also https://github.com/sindresorhus/p-map/issues/24
        32;
async function loadAppRenderer({ serverBundlePath, }) {
    const source = await utils_1.PerfLogger.async(`Load server bundle`, () => fs_extra_1.default.readFile(serverBundlePath));
    utils_1.PerfLogger.log(`Server bundle size = ${(source.length / 1024000).toFixed(3)} MB`);
    const filename = path_1.default.basename(serverBundlePath);
    const globals = {
        // When using "new URL('file.js', import.meta.url)", Webpack will emit
        // __filename, and this plugin will throw. not sure the __filename value
        // has any importance for this plugin, just using an empty string to
        // avoid the error. See https://github.com/facebook/docusaurus/issues/4922
        __filename: '',
        // This uses module.createRequire() instead of very old "require-like" lib
        // See also: https://github.com/pierrec/node-eval/issues/33
        require: (0, module_1.createRequire)(serverBundlePath),
    };
    const serverEntry = await utils_1.PerfLogger.async(`Evaluate server bundle`, () => (0, eval_1.default)(source, 
    /* filename: */ filename, 
    /* scope: */ globals, 
    /* includeGlobals: */ true));
    if (!serverEntry?.default || typeof serverEntry.default !== 'function') {
        throw new Error(`Server bundle export from "${filename}" must be a function that renders the Docusaurus React app.`);
    }
    return serverEntry.default;
}
function pathnameToFilename({ pathname, trailingSlash, }) {
    const outputFileName = pathname.replace(/^[/\\]/, ''); // Remove leading slashes for webpack-dev-server
    // Paths ending with .html are left untouched
    if (/\.html?$/i.test(outputFileName)) {
        return outputFileName;
    }
    // Legacy retro-compatible behavior
    if (typeof trailingSlash === 'undefined') {
        return path_1.default.join(outputFileName, 'index.html');
    }
    // New behavior: we can say if we prefer file/folder output
    // Useful resource: https://github.com/slorber/trailing-slash-guide
    if (pathname === '' || pathname.endsWith('/') || trailingSlash) {
        return path_1.default.join(outputFileName, 'index.html');
    }
    return `${outputFileName}.html`;
}
async function generateStaticFiles({ pathnames, renderer, params, }) {
    // Note that we catch all async errors on purpose
    // Docusaurus presents all the SSG errors to the user, not just the first one
    const results = await (0, p_map_1.default)(pathnames, async (pathname) => generateStaticFile({
        pathname,
        renderer,
        params,
    }).then((result) => ({ pathname, result, error: null }), (error) => ({ pathname, result: null, error: error })), { concurrency: Concurrency });
    const [allSSGErrors, allSSGSuccesses] = lodash_1.default.partition(results, (r) => !!r.error);
    if (allSSGErrors.length > 0) {
        const message = `Docusaurus static site generation failed for ${allSSGErrors.length} path${allSSGErrors.length ? 's' : ''}:\n- ${allSSGErrors
            .map((ssgError) => logger_1.default.path(ssgError.pathname))
            .join('\n- ')}`;
        // Note logging this error properly require using inspect(error,{depth})
        // See https://github.com/nodejs/node/issues/51637
        throw new Error(message, {
            cause: new AggregateError(allSSGErrors.map((ssgError) => ssgError.error)),
        });
    }
    const collectedData = lodash_1.default.chain(allSSGSuccesses)
        .keyBy((success) => success.pathname)
        .mapValues((ssgSuccess) => ssgSuccess.result.collectedData)
        .value();
    return { collectedData };
}
async function generateStaticFile({ pathname, renderer, params, }) {
    try {
        // This only renders the app HTML
        const result = await renderer({
            pathname,
        });
        // This renders the full page HTML, including head tags...
        const fullPageHtml = (0, templates_1.renderSSRTemplate)({
            params,
            result,
        });
        const content = await minifyHtml(fullPageHtml);
        await writeStaticFile({
            pathname,
            content,
            params,
        });
        return result;
    }
    catch (errorUnknown) {
        const error = errorUnknown;
        const tips = getSSGErrorTips(error);
        const message = logger_1.default.interpolate `Can't render static file for pathname path=${pathname}${tips ? `\n\n${tips}` : ''}`;
        throw new Error(message, {
            cause: error,
        });
    }
}
function getSSGErrorTips(error) {
    const parts = [];
    const isNotDefinedErrorRegex = /(?:window|document|localStorage|navigator|alert|location|buffer|self) is not defined/i;
    if (isNotDefinedErrorRegex.test(error.message)) {
        parts.push(`It looks like you are using code that should run on the client-side only.
To get around it, try using one of:
- ${logger_1.default.code('<BrowserOnly>')} (${logger_1.default.url('https://docusaurus.io/docs/docusaurus-core/#browseronly')})
- ${logger_1.default.code('ExecutionEnvironment')} (${logger_1.default.url('https://docusaurus.io/docs/docusaurus-core/#executionenvironment')}).
It might also require to wrap your client code in ${logger_1.default.code('useEffect')} hook and/or import a third-party library dynamically (if any).`);
    }
    return parts.join('\n');
}
async function generateHashRouterEntrypoint({ content, params, }) {
    await writeStaticFile({
        pathname: '/',
        content,
        params,
    });
}
async function writeStaticFile({ content, pathname, params, }) {
    function removeBaseUrl(p, baseUrl) {
        return baseUrl === '/' ? p : p.replace(new RegExp(`^${baseUrl}`), '/');
    }
    const filename = pathnameToFilename({
        pathname: removeBaseUrl(pathname, params.baseUrl),
        trailingSlash: params.trailingSlash,
    });
    const filePath = path_1.default.join(params.outDir, filename);
    await fs_extra_1.default.ensureDir(path_1.default.dirname(filePath));
    await fs_extra_1.default.writeFile(filePath, content);
}
async function minifyHtml(html) {
    try {
        if (process.env.SKIP_HTML_MINIFICATION === 'true') {
            return html;
        }
        // Minify html with https://github.com/DanielRuf/html-minifier-terser
        return await (0, html_minifier_terser_1.minify)(html, {
            removeComments: false,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
            minifyJS: true,
        });
    }
    catch (err) {
        throw new Error('HTML minification failed', { cause: err });
    }
}
