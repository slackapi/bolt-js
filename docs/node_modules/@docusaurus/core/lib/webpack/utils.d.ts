/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import webpack, { type Configuration, type RuleSetRule } from 'webpack';
import type { TransformOptions } from '@babel/core';
export declare function formatStatsErrorMessage(statsJson: ReturnType<webpack.Stats['toJson']> | undefined): string | undefined;
export declare function printStatsWarnings(statsJson: ReturnType<webpack.Stats['toJson']> | undefined): void;
export declare function getStyleLoaders(isServer: boolean, cssOptionsArg?: {
    [key: string]: unknown;
}): RuleSetRule[];
export declare function getCustomBabelConfigFilePath(siteDir: string): Promise<string | undefined>;
export declare function getBabelOptions({ isServer, babelOptions, }?: {
    isServer?: boolean;
    babelOptions?: TransformOptions | string;
}): TransformOptions;
export declare const getCustomizableJSLoader: (jsLoader?: "babel" | ((isServer: boolean) => RuleSetRule)) => ({ isServer, babelOptions, }: {
    isServer: boolean;
    babelOptions?: TransformOptions | string;
}) => RuleSetRule;
declare global {
    interface Error {
        /** @see https://webpack.js.org/api/node/#error-handling */
        details: unknown;
    }
}
export declare function compile(config: Configuration[]): Promise<webpack.MultiStats>;
export declare function getHttpsConfig(): Promise<boolean | {
    cert: Buffer;
    key: Buffer;
}>;
