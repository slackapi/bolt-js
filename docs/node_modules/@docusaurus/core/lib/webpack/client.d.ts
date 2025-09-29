/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Props } from '@docusaurus/types';
import type { Configuration } from 'webpack';
export declare function createStartClientConfig({ props, minify, poll, }: {
    props: Props;
    minify: boolean;
    poll: number | boolean | undefined;
}): Promise<{
    clientConfig: Configuration;
}>;
export declare function createBuildClientConfig({ props, minify, bundleAnalyzer, }: {
    props: Props;
    minify: boolean;
    bundleAnalyzer: boolean;
}): Promise<{
    config: Configuration;
    clientManifestPath: string;
}>;
