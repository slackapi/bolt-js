"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = void 0;
exports.default = pluginContentDocs;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const logger_1 = tslib_1.__importDefault(require("@docusaurus/logger"));
const utils_1 = require("@docusaurus/utils");
const utils_validation_1 = require("@docusaurus/utils-validation");
const sidebars_1 = require("./sidebars");
const generator_1 = require("./sidebars/generator");
const docs_1 = require("./docs");
const versions_1 = require("./versions");
const cli_1 = require("./cli");
const constants_1 = require("./constants");
const globalData_1 = require("./globalData");
const translations_1 = require("./translations");
const routes_1 = require("./routes");
const utils_2 = require("./sidebars/utils");
// TODO this is bad, we should have a better way to do this (new lifecycle?)
//  The source to permalink is currently a mutable map passed to the mdx loader
//  for link resolution
//  see https://github.com/facebook/docusaurus/pull/10185
function createSourceToPermalinkHelper() {
    const sourceToPermalink = new Map();
    function computeSourceToPermalink(content) {
        const allDocs = content.loadedVersions.flatMap((v) => v.docs);
        return new Map(allDocs.map(({ source, permalink }) => [source, permalink]));
    }
    // Mutable map update :/
    function update(content) {
        sourceToPermalink.clear();
        computeSourceToPermalink(content).forEach((value, key) => {
            sourceToPermalink.set(key, value);
        });
    }
    return { get: () => sourceToPermalink, update };
}
async function pluginContentDocs(context, options) {
    const { siteDir, generatedFilesDir, baseUrl, siteConfig } = context;
    // Mutate options to resolve sidebar path according to siteDir
    options.sidebarPath = (0, sidebars_1.resolveSidebarPathOption)(siteDir, options.sidebarPath);
    const versionsMetadata = await (0, versions_1.readVersionsMetadata)({ context, options });
    const pluginId = options.id;
    const pluginDataDirRoot = path_1.default.join(generatedFilesDir, 'docusaurus-plugin-content-docs');
    const dataDir = path_1.default.join(pluginDataDirRoot, pluginId);
    // TODO Docusaurus v4 breaking change
    //  module aliasing should be automatic
    //  we should never find local absolute FS paths in the codegen registry
    const aliasedSource = (source) => `~docs/${(0, utils_1.posixPath)(path_1.default.relative(pluginDataDirRoot, source))}`;
    // TODO env should be injected into all plugins
    const env = process.env.NODE_ENV;
    const sourceToPermalinkHelper = createSourceToPermalinkHelper();
    return {
        name: 'docusaurus-plugin-content-docs',
        extendCli(cli) {
            const isDefaultPluginId = pluginId === utils_1.DEFAULT_PLUGIN_ID;
            // Need to create one distinct command per plugin instance
            // otherwise 2 instances would try to execute the command!
            const command = isDefaultPluginId
                ? 'docs:version'
                : `docs:version:${pluginId}`;
            const commandDescription = isDefaultPluginId
                ? 'Tag a new docs version'
                : `Tag a new docs version (${pluginId})`;
            cli
                .command(command)
                .arguments('<version>')
                .description(commandDescription)
                .action((version) => (0, cli_1.cliDocsVersionCommand)(version, options, context));
        },
        getTranslationFiles({ content }) {
            return (0, translations_1.getLoadedContentTranslationFiles)(content);
        },
        getPathsToWatch() {
            function getVersionPathsToWatch(version) {
                const result = [
                    ...options.include.flatMap((pattern) => (0, utils_1.getContentPathList)(version).map((docsDirPath) => `${docsDirPath}/${pattern}`)),
                    ...(0, utils_validation_1.getTagsFilePathsToWatch)({
                        contentPaths: version,
                        tags: options.tags,
                    }),
                    `${version.contentPath}/**/${generator_1.CategoryMetadataFilenamePattern}`,
                ];
                if (typeof version.sidebarFilePath === 'string') {
                    result.unshift(version.sidebarFilePath);
                }
                return result;
            }
            return versionsMetadata.flatMap(getVersionPathsToWatch);
        },
        async loadContent() {
            async function loadVersionDocsBase(versionMetadata, tagsFile) {
                const docFiles = await (0, docs_1.readVersionDocs)(versionMetadata, options);
                if (docFiles.length === 0) {
                    throw new Error(`Docs version "${versionMetadata.versionName}" has no docs! At least one doc should exist at "${path_1.default.relative(siteDir, versionMetadata.contentPath)}".`);
                }
                function processVersionDoc(docFile) {
                    return (0, docs_1.processDocMetadata)({
                        docFile,
                        versionMetadata,
                        context,
                        options,
                        env,
                        tagsFile,
                    });
                }
                return Promise.all(docFiles.map(processVersionDoc));
            }
            async function doLoadVersion(versionMetadata) {
                const tagsFile = await (0, utils_validation_1.getTagsFile)({
                    contentPaths: versionMetadata,
                    tags: options.tags,
                });
                const docsBase = await loadVersionDocsBase(versionMetadata, tagsFile);
                // TODO we only ever need draftIds in further code, not full draft items
                // To simplify and prevent mistakes, avoid exposing draft
                // replace draft=>draftIds in content loaded
                const [drafts, docs] = lodash_1.default.partition(docsBase, (doc) => doc.draft);
                const sidebars = await (0, sidebars_1.loadSidebars)(versionMetadata.sidebarFilePath, {
                    sidebarItemsGenerator: options.sidebarItemsGenerator,
                    numberPrefixParser: options.numberPrefixParser,
                    docs,
                    drafts,
                    version: versionMetadata,
                    sidebarOptions: {
                        sidebarCollapsed: options.sidebarCollapsed,
                        sidebarCollapsible: options.sidebarCollapsible,
                    },
                    categoryLabelSlugger: (0, utils_1.createSlugger)(),
                });
                const sidebarsUtils = (0, utils_2.createSidebarsUtils)(sidebars);
                const docsById = (0, docs_1.createDocsByIdIndex)(docs);
                const allDocIds = Object.keys(docsById);
                sidebarsUtils.checkLegacyVersionedSidebarNames({
                    sidebarFilePath: versionMetadata.sidebarFilePath,
                    versionMetadata,
                });
                sidebarsUtils.checkSidebarsDocIds({
                    allDocIds,
                    sidebarFilePath: versionMetadata.sidebarFilePath,
                    versionMetadata,
                });
                return {
                    ...versionMetadata,
                    docs: (0, docs_1.addDocNavigation)({
                        docs,
                        sidebarsUtils,
                    }),
                    drafts,
                    sidebars,
                };
            }
            async function loadVersion(versionMetadata) {
                try {
                    return await doLoadVersion(versionMetadata);
                }
                catch (err) {
                    logger_1.default.error `Loading of version failed for version name=${versionMetadata.versionName}`;
                    throw err;
                }
            }
            return {
                loadedVersions: await Promise.all(versionsMetadata.map(loadVersion)),
            };
        },
        translateContent({ content, translationFiles }) {
            return (0, translations_1.translateLoadedContent)(content, translationFiles);
        },
        async contentLoaded({ content, actions }) {
            sourceToPermalinkHelper.update(content);
            const versions = content.loadedVersions.map(versions_1.toFullVersion);
            await (0, routes_1.createAllRoutes)({
                baseUrl,
                versions,
                options,
                actions,
                aliasedSource,
            });
            actions.setGlobalData({
                path: (0, utils_1.normalizeUrl)([baseUrl, options.routeBasePath]),
                versions: versions.map(globalData_1.toGlobalDataVersion),
                breadcrumbs: options.breadcrumbs,
            });
        },
        configureWebpack(_config, isServer, utils, content) {
            const { rehypePlugins, remarkPlugins, recmaPlugins, beforeDefaultRehypePlugins, beforeDefaultRemarkPlugins, } = options;
            const contentDirs = versionsMetadata
                .flatMap(utils_1.getContentPathList)
                // Trailing slash is important, see https://github.com/facebook/docusaurus/pull/3970
                .map(utils_1.addTrailingPathSeparator);
            function createMDXLoader() {
                const loaderOptions = {
                    admonitions: options.admonitions,
                    remarkPlugins,
                    rehypePlugins,
                    recmaPlugins,
                    beforeDefaultRehypePlugins,
                    beforeDefaultRemarkPlugins,
                    staticDirs: siteConfig.staticDirectories.map((dir) => path_1.default.resolve(siteDir, dir)),
                    siteDir,
                    isMDXPartial: (0, utils_1.createAbsoluteFilePathMatcher)(options.exclude, contentDirs),
                    metadataPath: (mdxPath) => {
                        // Note that metadataPath must be the same/in-sync as
                        // the path from createData for each MDX.
                        const aliasedPath = (0, utils_1.aliasedSitePath)(mdxPath, siteDir);
                        return path_1.default.join(dataDir, `${(0, utils_1.docuHash)(aliasedPath)}.json`);
                    },
                    // Assets allow to convert some relative images paths to
                    // require(...) calls
                    createAssets: ({ frontMatter }) => ({
                        image: frontMatter.image,
                    }),
                    markdownConfig: siteConfig.markdown,
                    resolveMarkdownLink: ({ linkPathname, sourceFilePath }) => {
                        const version = (0, versions_1.getVersionFromSourceFilePath)(sourceFilePath, content.loadedVersions);
                        const permalink = (0, utils_1.resolveMarkdownLinkPathname)(linkPathname, {
                            sourceFilePath,
                            sourceToPermalink: sourceToPermalinkHelper.get(),
                            siteDir,
                            contentPaths: version,
                        });
                        if (permalink === null) {
                            logger_1.default.report(siteConfig.onBrokenMarkdownLinks) `Docs markdown link couldn't be resolved: (url=${linkPathname}) in source file path=${sourceFilePath} for version number=${version.versionName}`;
                        }
                        return permalink;
                    },
                };
                return {
                    loader: require.resolve('@docusaurus/mdx-loader'),
                    options: loaderOptions,
                };
            }
            return {
                ignoreWarnings: [
                    // Suppress warnings about non-existing of versions file.
                    (e) => e.message.includes("Can't resolve") &&
                        e.message.includes(constants_1.VERSIONS_JSON_FILE),
                ],
                resolve: {
                    alias: {
                        '~docs': pluginDataDirRoot,
                    },
                },
                module: {
                    rules: [
                        {
                            test: /\.mdx?$/i,
                            include: contentDirs,
                            use: [createMDXLoader()],
                        },
                    ],
                },
            };
        },
    };
}
var options_1 = require("./options");
Object.defineProperty(exports, "validateOptions", { enumerable: true, get: function () { return options_1.validateOptions; } });
