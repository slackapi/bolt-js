"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = build;
const tslib_1 = require("tslib");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const logger_1 = tslib_1.__importDefault(require("@docusaurus/logger"));
const utils_1 = require("@docusaurus/utils");
const site_1 = require("../server/site");
const brokenLinks_1 = require("../server/brokenLinks");
const client_1 = require("../webpack/client");
const server_1 = tslib_1.__importDefault(require("../webpack/server"));
const configure_1 = require("../webpack/configure");
const utils_2 = require("../webpack/utils");
const utils_3 = require("../utils");
const i18n_1 = require("../server/i18n");
const ssg_1 = require("../ssg");
const templates_1 = require("../templates/templates");
const ssr_html_template_1 = tslib_1.__importDefault(require("../templates/ssr.html.template"));
async function build(siteDirParam = '.', cliOptions = {}, 
// When running build, we force terminate the process to prevent async
// operations from never returning. However, if run as part of docusaurus
// deploy, we have to let deploy finish.
// See https://github.com/facebook/docusaurus/pull/2496
forceTerminate = true) {
    process.env.BABEL_ENV = 'production';
    process.env.NODE_ENV = 'production';
    process.env.DOCUSAURUS_CURRENT_LOCALE = cliOptions.locale;
    if (cliOptions.dev) {
        logger_1.default.info `Building in dev mode`;
        process.env.BABEL_ENV = 'development';
        process.env.NODE_ENV = 'development';
    }
    const siteDir = await fs_extra_1.default.realpath(siteDirParam);
    ['SIGINT', 'SIGTERM'].forEach((sig) => {
        process.on(sig, () => process.exit());
    });
    async function tryToBuildLocale({ locale }) {
        try {
            await utils_3.PerfLogger.async(`${logger_1.default.name(locale)}`, () => buildLocale({
                siteDir,
                locale,
                cliOptions,
            }));
        }
        catch (err) {
            throw new Error(logger_1.default.interpolate `Unable to build website for locale name=${locale}.`, {
                cause: err,
            });
        }
    }
    const locales = await utils_3.PerfLogger.async('Get locales to build', () => getLocalesToBuild({ siteDir, cliOptions }));
    if (locales.length > 1) {
        logger_1.default.info `Website will be built for all these locales: ${locales}`;
    }
    await utils_3.PerfLogger.async(`Build`, () => (0, utils_1.mapAsyncSequential)(locales, async (locale) => {
        const isLastLocale = locales.indexOf(locale) === locales.length - 1;
        await tryToBuildLocale({ locale });
        if (isLastLocale) {
            logger_1.default.info `Use code=${'npm run serve'} command to test your build locally.`;
        }
        // TODO do we really need this historical forceTerminate exit???
        if (forceTerminate && isLastLocale && !cliOptions.bundleAnalyzer) {
            process.exit(0);
        }
    }));
}
async function getLocalesToBuild({ siteDir, cliOptions, }) {
    if (cliOptions.locale) {
        return [cliOptions.locale];
    }
    const context = await (0, site_1.loadContext)({
        siteDir,
        outDir: cliOptions.outDir,
        config: cliOptions.config,
        locale: cliOptions.locale,
        localizePath: cliOptions.locale ? false : undefined,
    });
    const i18n = await (0, i18n_1.loadI18n)(context.siteConfig, {
        locale: cliOptions.locale,
    });
    if (i18n.locales.length > 1) {
        logger_1.default.info `Website will be built for all these locales: ${i18n.locales}`;
    }
    // We need the default locale to always be the 1st in the list. If we build it
    // last, it would "erase" the localized sites built in sub-folders
    return [
        i18n.defaultLocale,
        ...i18n.locales.filter((locale) => locale !== i18n.defaultLocale),
    ];
}
async function buildLocale({ siteDir, locale, cliOptions, }) {
    // Temporary workaround to unlock the ability to translate the site config
    // We'll remove it if a better official API can be designed
    // See https://github.com/facebook/docusaurus/issues/4542
    process.env.DOCUSAURUS_CURRENT_LOCALE = locale;
    logger_1.default.info `name=${`[${locale}]`} Creating an optimized production build...`;
    const site = await utils_3.PerfLogger.async('Load site', () => (0, site_1.loadSite)({
        siteDir,
        outDir: cliOptions.outDir,
        config: cliOptions.config,
        locale,
        localizePath: cliOptions.locale ? false : undefined,
    }));
    const { props } = site;
    const { outDir, plugins, siteConfig } = props;
    const router = siteConfig.future.experimental_router;
    // We can build the 2 configs in parallel
    const [{ clientConfig, clientManifestPath }, { serverConfig, serverBundlePath }] = await utils_3.PerfLogger.async('Creating webpack configs', () => Promise.all([
        getBuildClientConfig({
            props,
            cliOptions,
        }),
        getBuildServerConfig({
            props,
        }),
    ]));
    // Run webpack to build JS bundle (client) and static html files (server).
    await utils_3.PerfLogger.async('Bundling with Webpack', () => {
        if (router === 'hash') {
            return (0, utils_2.compile)([clientConfig]);
        }
        else {
            return (0, utils_2.compile)([clientConfig, serverConfig]);
        }
    });
    const { collectedData } = await utils_3.PerfLogger.async('SSG', () => executeSSG({
        props,
        serverBundlePath,
        clientManifestPath,
        router,
    }));
    // Remove server.bundle.js because it is not needed.
    await utils_3.PerfLogger.async('Deleting server bundle', () => ensureUnlink(serverBundlePath));
    // Plugin Lifecycle - postBuild.
    await utils_3.PerfLogger.async('postBuild()', () => executePluginsPostBuild({ plugins, props, collectedData }));
    // TODO execute this in parallel to postBuild?
    await utils_3.PerfLogger.async('Broken links checker', () => executeBrokenLinksCheck({ props, collectedData }));
    logger_1.default.success `Generated static files in path=${path_1.default.relative(process.cwd(), outDir)}.`;
    return outDir;
}
async function executeSSG({ props, serverBundlePath, clientManifestPath, router, }) {
    const manifest = await utils_3.PerfLogger.async('Read client manifest', () => fs_extra_1.default.readJSON(clientManifestPath, 'utf-8'));
    const ssrTemplate = await utils_3.PerfLogger.async('Compile SSR template', () => (0, templates_1.compileSSRTemplate)(props.siteConfig.ssrTemplate ?? ssr_html_template_1.default));
    const params = {
        trailingSlash: props.siteConfig.trailingSlash,
        outDir: props.outDir,
        baseUrl: props.baseUrl,
        manifest,
        headTags: props.headTags,
        preBodyTags: props.preBodyTags,
        postBodyTags: props.postBodyTags,
        ssrTemplate,
        noIndex: props.siteConfig.noIndex,
        DOCUSAURUS_VERSION: utils_1.DOCUSAURUS_VERSION,
    };
    if (router === 'hash') {
        utils_3.PerfLogger.start('Generate Hash Router entry point');
        const content = (0, templates_1.renderHashRouterTemplate)({ params });
        await (0, ssg_1.generateHashRouterEntrypoint)({ content, params });
        utils_3.PerfLogger.end('Generate Hash Router entry point');
        return { collectedData: {} };
    }
    const renderer = await utils_3.PerfLogger.async('Load App renderer', () => (0, ssg_1.loadAppRenderer)({
        serverBundlePath,
    }));
    const ssgResult = await utils_3.PerfLogger.async('Generate static files', () => (0, ssg_1.generateStaticFiles)({
        pathnames: props.routesPaths,
        renderer,
        params,
    }));
    return ssgResult;
}
async function executePluginsPostBuild({ plugins, props, collectedData, }) {
    const head = lodash_1.default.mapValues(collectedData, (d) => d.helmet);
    await Promise.all(plugins.map(async (plugin) => {
        if (!plugin.postBuild) {
            return;
        }
        await plugin.postBuild({
            ...props,
            head,
            content: plugin.content,
        });
    }));
}
async function executeBrokenLinksCheck({ props: { routes, siteConfig: { onBrokenLinks, onBrokenAnchors }, }, collectedData, }) {
    const collectedLinks = lodash_1.default.mapValues(collectedData, (d) => ({
        links: d.links,
        anchors: d.anchors,
    }));
    await (0, brokenLinks_1.handleBrokenLinks)({
        collectedLinks,
        routes,
        onBrokenLinks,
        onBrokenAnchors,
    });
}
async function getBuildClientConfig({ props, cliOptions, }) {
    const { plugins } = props;
    const result = await (0, client_1.createBuildClientConfig)({
        props,
        minify: cliOptions.minify ?? true,
        bundleAnalyzer: cliOptions.bundleAnalyzer ?? false,
    });
    let { config } = result;
    config = (0, configure_1.executePluginsConfigureWebpack)({
        plugins,
        config,
        isServer: false,
        jsLoader: props.siteConfig.webpack?.jsLoader,
    });
    return { clientConfig: config, clientManifestPath: result.clientManifestPath };
}
async function getBuildServerConfig({ props }) {
    const { plugins } = props;
    const result = await (0, server_1.default)({
        props,
    });
    let { config } = result;
    config = (0, configure_1.executePluginsConfigureWebpack)({
        plugins,
        config,
        isServer: true,
        jsLoader: props.siteConfig.webpack?.jsLoader,
    });
    return { serverConfig: config, serverBundlePath: result.serverBundlePath };
}
async function ensureUnlink(filepath) {
    if (await fs_extra_1.default.pathExists(filepath)) {
        await fs_extra_1.default.unlink(filepath);
    }
}
