/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Configuration, RuleSetRule } from 'webpack';
import type { Plugin, LoadedPlugin } from '@docusaurus/types';
/**
 * Helper function to modify webpack config
 * @param configureWebpack a webpack config or a function to modify config
 * @param config initial webpack config
 * @param isServer indicates if this is a server webpack configuration
 * @param jsLoader custom js loader config
 * @param content content loaded by the plugin
 * @returns final/ modified webpack config
 */
export declare function applyConfigureWebpack(configureWebpack: NonNullable<Plugin['configureWebpack']>, config: Configuration, isServer: boolean, jsLoader: 'babel' | ((isServer: boolean) => RuleSetRule) | undefined, content: unknown): Configuration;
export declare function applyConfigurePostCss(configurePostCss: NonNullable<Plugin['configurePostCss']>, config: Configuration): Configuration;
export declare function executePluginsConfigureWebpack({ plugins, config, isServer, jsLoader, }: {
    plugins: LoadedPlugin[];
    config: Configuration;
    isServer: boolean;
    jsLoader: 'babel' | ((isServer: boolean) => RuleSetRule) | undefined;
}): Configuration;
