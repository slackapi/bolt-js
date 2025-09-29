"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomizableJSLoader = void 0;
exports.formatStatsErrorMessage = formatStatsErrorMessage;
exports.printStatsWarnings = printStatsWarnings;
exports.getStyleLoaders = getStyleLoaders;
exports.getCustomBabelConfigFilePath = getCustomBabelConfigFilePath;
exports.getBabelOptions = getBabelOptions;
exports.compile = compile;
exports.getHttpsConfig = getHttpsConfig;
const tslib_1 = require("tslib");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const logger_1 = tslib_1.__importDefault(require("@docusaurus/logger"));
const utils_1 = require("@docusaurus/utils");
const mini_css_extract_plugin_1 = tslib_1.__importDefault(require("mini-css-extract-plugin"));
const webpack_1 = tslib_1.__importDefault(require("webpack"));
const formatWebpackMessages_1 = tslib_1.__importDefault(require("react-dev-utils/formatWebpackMessages"));
function formatStatsErrorMessage(statsJson) {
    if (statsJson?.errors?.length) {
        // TODO formatWebpackMessages does not print stack-traces
        // Also the error causal chain is lost here
        // We log the stacktrace inside serverEntry.tsx for now (not ideal)
        const { errors } = (0, formatWebpackMessages_1.default)(statsJson);
        return errors
            .map((str) => logger_1.default.red(str))
            .join(`\n\n${logger_1.default.yellow('--------------------------')}\n\n`);
    }
    return undefined;
}
function printStatsWarnings(statsJson) {
    if (statsJson?.warnings?.length) {
        statsJson.warnings?.forEach((warning) => {
            logger_1.default.warn(warning);
        });
    }
}
// Utility method to get style loaders
function getStyleLoaders(isServer, cssOptionsArg = {}) {
    const cssOptions = {
        // TODO turn esModule on later, see https://github.com/facebook/docusaurus/pull/6424
        esModule: false,
        ...cssOptionsArg,
    };
    if (isServer) {
        return cssOptions.modules
            ? [
                {
                    loader: require.resolve('css-loader'),
                    options: cssOptions,
                },
            ]
            : [
                {
                    loader: mini_css_extract_plugin_1.default.loader,
                    options: {
                        // Don't emit CSS files for SSR (previously used null-loader)
                        // See https://github.com/webpack-contrib/mini-css-extract-plugin/issues/90#issuecomment-811991738
                        emit: false,
                    },
                },
                {
                    loader: require.resolve('css-loader'),
                    options: cssOptions,
                },
            ];
    }
    return [
        {
            loader: mini_css_extract_plugin_1.default.loader,
            options: {
                esModule: true,
            },
        },
        {
            loader: require.resolve('css-loader'),
            options: cssOptions,
        },
        {
            // Options for PostCSS as we reference these options twice
            // Adds vendor prefixing based on your specified browser support in
            // package.json
            loader: require.resolve('postcss-loader'),
            options: {
                postcssOptions: {
                    // Necessary for external CSS imports to work
                    // https://github.com/facebook/create-react-app/issues/2677
                    ident: 'postcss',
                    plugins: [
                        // eslint-disable-next-line global-require
                        require('autoprefixer'),
                    ],
                },
            },
        },
    ];
}
async function getCustomBabelConfigFilePath(siteDir) {
    const customBabelConfigurationPath = path_1.default.join(siteDir, utils_1.BABEL_CONFIG_FILE_NAME);
    return (await fs_extra_1.default.pathExists(customBabelConfigurationPath))
        ? customBabelConfigurationPath
        : undefined;
}
function getBabelOptions({ isServer, babelOptions, } = {}) {
    if (typeof babelOptions === 'string') {
        return {
            babelrc: false,
            configFile: babelOptions,
            caller: { name: isServer ? 'server' : 'client' },
        };
    }
    return {
        ...(babelOptions ?? { presets: [require.resolve('../babel/preset')] }),
        babelrc: false,
        configFile: false,
        caller: { name: isServer ? 'server' : 'client' },
    };
}
// Name is generic on purpose
// we want to support multiple js loader implementations (babel + esbuild)
function getDefaultBabelLoader({ isServer, babelOptions, }) {
    return {
        loader: require.resolve('babel-loader'),
        options: getBabelOptions({ isServer, babelOptions }),
    };
}
const getCustomizableJSLoader = (jsLoader = 'babel') => ({ isServer, babelOptions, }) => jsLoader === 'babel'
    ? getDefaultBabelLoader({ isServer, babelOptions })
    : jsLoader(isServer);
exports.getCustomizableJSLoader = getCustomizableJSLoader;
function compile(config) {
    return new Promise((resolve, reject) => {
        const compiler = (0, webpack_1.default)(config);
        compiler.run((err, stats) => {
            if (err) {
                logger_1.default.error(err.stack ?? err);
                if (err.details) {
                    logger_1.default.error(err.details);
                }
                reject(err);
            }
            // Let plugins consume all the stats
            const errorsWarnings = stats?.toJson('errors-warnings');
            if (stats?.hasErrors()) {
                const statsErrorMessage = formatStatsErrorMessage(errorsWarnings);
                reject(new Error(`Failed to compile due to Webpack errors.\n${statsErrorMessage}`));
            }
            printStatsWarnings(errorsWarnings);
            // Webpack 5 requires calling close() so that persistent caching works
            // See https://github.com/webpack/webpack.js.org/pull/4775
            compiler.close((errClose) => {
                if (errClose) {
                    logger_1.default.error(`Error while closing Webpack compiler: ${errClose}`);
                    reject(errClose);
                }
                else {
                    resolve(stats);
                }
            });
        });
    });
}
// Ensure the certificate and key provided are valid and if not
// throw an easy to debug error
function validateKeyAndCerts({ cert, key, keyFile, crtFile, }) {
    let encrypted;
    try {
        // publicEncrypt will throw an error with an invalid cert
        encrypted = crypto_1.default.publicEncrypt(cert, Buffer.from('test'));
    }
    catch (err) {
        logger_1.default.error `The certificate path=${crtFile} is invalid.`;
        throw err;
    }
    try {
        // privateDecrypt will throw an error with an invalid key
        crypto_1.default.privateDecrypt(key, encrypted);
    }
    catch (err) {
        logger_1.default.error `The certificate key path=${keyFile} is invalid.`;
        throw err;
    }
}
// Read file and throw an error if it doesn't exist
async function readEnvFile(file, type) {
    if (!(await fs_extra_1.default.pathExists(file))) {
        throw new Error(`You specified ${type} in your env, but the file "${file}" can't be found.`);
    }
    return fs_extra_1.default.readFile(file);
}
// Get the https config
// Return cert files if provided in env, otherwise just true or false
async function getHttpsConfig() {
    const appDirectory = await fs_extra_1.default.realpath(process.cwd());
    const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
    const isHttps = HTTPS === 'true';
    if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
        const crtFile = path_1.default.resolve(appDirectory, SSL_CRT_FILE);
        const keyFile = path_1.default.resolve(appDirectory, SSL_KEY_FILE);
        const config = {
            cert: await readEnvFile(crtFile, 'SSL_CRT_FILE'),
            key: await readEnvFile(keyFile, 'SSL_KEY_FILE'),
        };
        validateKeyAndCerts({ ...config, keyFile, crtFile });
        return config;
    }
    return isHttps;
}
