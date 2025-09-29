"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinimizer = getMinimizer;
const tslib_1 = require("tslib");
const terser_webpack_plugin_1 = tslib_1.__importDefault(require("terser-webpack-plugin"));
const css_minimizer_webpack_plugin_1 = tslib_1.__importDefault(require("css-minimizer-webpack-plugin"));
// See https://github.com/webpack-contrib/terser-webpack-plugin#parallel
function getTerserParallel() {
    let terserParallel = true;
    if (process.env.TERSER_PARALLEL === 'false') {
        terserParallel = false;
    }
    else if (process.env.TERSER_PARALLEL &&
        parseInt(process.env.TERSER_PARALLEL, 10) > 0) {
        terserParallel = parseInt(process.env.TERSER_PARALLEL, 10);
    }
    return terserParallel;
}
function getJsMinifierPlugin() {
    return new terser_webpack_plugin_1.default({
        parallel: getTerserParallel(),
        terserOptions: {
            parse: {
                // We want uglify-js to parse ecma 8 code. However, we don't want it
                // to apply any minification steps that turns valid ecma 5 code
                // into invalid ecma 5 code. This is why the 'compress' and 'output'
                // sections only apply transformations that are ecma 5 safe
                // https://github.com/facebook/create-react-app/pull/4234
                ecma: 2020,
            },
            compress: {
                ecma: 5,
            },
            mangle: {
                safari10: true,
            },
            output: {
                ecma: 5,
                comments: false,
                // Turned on because emoji and regex is not minified properly using
                // default. See https://github.com/facebook/create-react-app/issues/2488
                ascii_only: true,
            },
        },
    });
}
function getAdvancedCssMinifier() {
    // Using the array syntax to add 2 minimizers
    // see https://github.com/webpack-contrib/css-minimizer-webpack-plugin#array
    return new css_minimizer_webpack_plugin_1.default({
        minimizerOptions: [
            // CssNano options
            {
                preset: require.resolve('@docusaurus/cssnano-preset'),
            },
            // CleanCss options
            {
                inline: false,
                level: {
                    1: {
                        all: false,
                        removeWhitespace: true,
                    },
                    2: {
                        all: true,
                        restructureRules: true,
                        removeUnusedAtRules: false,
                    },
                },
            },
        ],
        minify: [
            css_minimizer_webpack_plugin_1.default.cssnanoMinify,
            css_minimizer_webpack_plugin_1.default.cleanCssMinify,
        ],
    });
}
function getMinimizer() {
    // This is an historical env variable to opt-out of the advanced minifier
    // Sometimes there's a bug in it and people are happy to disable it
    const useSimpleCssMinifier = process.env.USE_SIMPLE_CSS_MINIFIER === 'true';
    const minimizer = [getJsMinifierPlugin()];
    if (useSimpleCssMinifier) {
        minimizer.push(new css_minimizer_webpack_plugin_1.default());
    }
    else {
        minimizer.push(getAdvancedCssMinifier());
    }
    return minimizer;
}
