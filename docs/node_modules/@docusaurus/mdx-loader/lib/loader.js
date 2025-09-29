"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mdxLoader = mdxLoader;
const tslib_1 = require("tslib");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const logger_1 = tslib_1.__importDefault(require("@docusaurus/logger"));
const utils_1 = require("@docusaurus/utils");
const stringify_object_1 = tslib_1.__importDefault(require("stringify-object"));
const preprocessor_1 = tslib_1.__importDefault(require("./preprocessor"));
const frontMatter_1 = require("./frontMatter");
const processor_1 = require("./processor");
const { loaders: { inlineMarkdownAssetImageFileLoader }, } = (0, utils_1.getFileLoaderUtils)();
/**
 * When this throws, it generally means that there's no metadata file associated
 * with this MDX document. It can happen when using MDX partials (usually
 * starting with _). That's why it's important to provide the `isMDXPartial`
 * function in config
 */
async function readMetadataPath(metadataPath) {
    try {
        return await fs_extra_1.default.readFile(metadataPath, 'utf8');
    }
    catch (err) {
        logger_1.default.error `MDX loader can't read MDX metadata file path=${metadataPath}. Maybe the isMDXPartial option function was not provided?`;
        throw err;
    }
}
/**
 * Converts assets an object with Webpack require calls code.
 * This is useful for mdx files to reference co-located assets using relative
 * paths. Those assets should enter the Webpack assets pipeline and be hashed.
 * For now, we only handle that for images and paths starting with `./`:
 *
 * `{image: "./myImage.png"}` => `{image: require("./myImage.png")}`
 */
function createAssetsExportCode(assets) {
    if (typeof assets !== 'object' ||
        !assets ||
        Object.keys(assets).length === 0) {
        return 'undefined';
    }
    // TODO implementation can be completed/enhanced
    function createAssetValueCode(assetValue) {
        if (Array.isArray(assetValue)) {
            const arrayItemCodes = assetValue.map((item) => createAssetValueCode(item) ?? 'undefined');
            return `[${arrayItemCodes.join(', ')}]`;
        }
        // Only process string values starting with ./
        // We could enhance this logic and check if file exists on disc?
        if (typeof assetValue === 'string' && assetValue.startsWith('./')) {
            // TODO do we have other use-cases than image assets?
            // Probably not worth adding more support, as we want to move to Webpack 5 new asset system (https://github.com/facebook/docusaurus/pull/4708)
            return `require("${inlineMarkdownAssetImageFileLoader}${(0, utils_1.escapePath)(assetValue)}").default`;
        }
        return undefined;
    }
    const assetEntries = Object.entries(assets);
    const codeLines = assetEntries
        .map(([key, value]) => {
        const assetRequireCode = createAssetValueCode(value);
        return assetRequireCode ? `"${key}": ${assetRequireCode},` : undefined;
    })
        .filter(Boolean);
    return `{\n${codeLines.join('\n')}\n}`;
}
// TODO temporary, remove this after v3.1?
// Some plugin authors use our mdx-loader, despite it not being public API
// see https://github.com/facebook/docusaurus/issues/8298
function ensureMarkdownConfig(reqOptions) {
    if (!reqOptions.markdownConfig) {
        throw new Error('Docusaurus v3+ requires MDX loader options.markdownConfig - plugin authors using the MDX loader should make sure to provide that option');
    }
}
/**
 * data.contentTitle is set by the remark contentTitle plugin
 */
function extractContentTitleData(data) {
    return data.contentTitle;
}
async function mdxLoader(fileContent) {
    const compilerName = (0, utils_1.getWebpackLoaderCompilerName)(this);
    const callback = this.async();
    const filePath = this.resourcePath;
    const reqOptions = this.getOptions();
    const { query } = this;
    ensureMarkdownConfig(reqOptions);
    const { frontMatter } = await reqOptions.markdownConfig.parseFrontMatter({
        filePath,
        fileContent,
        defaultParseFrontMatter: utils_1.DEFAULT_PARSE_FRONT_MATTER,
    });
    const mdxFrontMatter = (0, frontMatter_1.validateMDXFrontMatter)(frontMatter.mdx);
    const preprocessedContent = (0, preprocessor_1.default)({
        fileContent,
        filePath,
        admonitions: reqOptions.admonitions,
        markdownConfig: reqOptions.markdownConfig,
    });
    const hasFrontMatter = Object.keys(frontMatter).length > 0;
    const processor = await (0, processor_1.createProcessorCached)({
        filePath,
        reqOptions,
        query,
        mdxFrontMatter,
    });
    let result;
    try {
        result = await processor.process({
            content: preprocessedContent,
            filePath,
            frontMatter,
            compilerName,
        });
    }
    catch (errorUnknown) {
        const error = errorUnknown;
        // MDX can emit errors that have useful extra attributes
        const errorJSON = JSON.stringify(error, null, 2);
        const errorDetails = errorJSON === '{}'
            ? // regular JS error case: print stacktrace
                error.stack ?? 'N/A'
            : // MDX error: print extra attributes + stacktrace
                `${errorJSON}\n${error.stack}`;
        return callback(new Error(`MDX compilation failed for file ${logger_1.default.path(filePath)}\nCause: ${error.message}\nDetails:\n${errorDetails}`, 
        // TODO error cause doesn't seem to be used by Webpack stats.errors :s
        { cause: error }));
    }
    const contentTitle = extractContentTitleData(result.data);
    // MDX partials are MDX files starting with _ or in a folder starting with _
    // Partial are not expected to have associated metadata files or front matter
    const isMDXPartial = reqOptions.isMDXPartial?.(filePath);
    if (isMDXPartial && hasFrontMatter) {
        const errorMessage = `Docusaurus MDX partial files should not contain front matter.
Those partial files use the _ prefix as a convention by default, but this is configurable.
File at ${filePath} contains front matter that will be ignored:
${JSON.stringify(frontMatter, null, 2)}`;
        if (!reqOptions.isMDXPartialFrontMatterWarningDisabled) {
            const shouldError = process.env.NODE_ENV === 'test' || process.env.CI;
            if (shouldError) {
                return callback(new Error(errorMessage));
            }
            logger_1.default.warn(errorMessage);
        }
    }
    function getMetadataPath() {
        if (!isMDXPartial) {
            // Read metadata for this MDX and export it.
            if (reqOptions.metadataPath &&
                typeof reqOptions.metadataPath === 'function') {
                return reqOptions.metadataPath(filePath);
            }
        }
        return undefined;
    }
    const metadataPath = getMetadataPath();
    if (metadataPath) {
        this.addDependency(metadataPath);
    }
    const metadataJsonString = metadataPath
        ? await readMetadataPath(metadataPath)
        : undefined;
    const metadata = metadataJsonString
        ? JSON.parse(metadataJsonString)
        : undefined;
    const assets = reqOptions.createAssets && metadata
        ? reqOptions.createAssets({ frontMatter, metadata })
        : undefined;
    // TODO use remark plugins to insert extra exports instead of string concat?
    // cf how the toc is exported
    const exportsCode = `
export const frontMatter = ${(0, stringify_object_1.default)(frontMatter)};
export const contentTitle = ${(0, stringify_object_1.default)(contentTitle)};
${metadataJsonString ? `export const metadata = ${metadataJsonString};` : ''}
${assets ? `export const assets = ${createAssetsExportCode(assets)};` : ''}
`;
    const code = `
${exportsCode}
${result.content}
`;
    return callback(null, code);
}
//# sourceMappingURL=loader.js.map