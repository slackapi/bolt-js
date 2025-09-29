/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import CopyWebpackPlugin from 'copy-webpack-plugin';
import type { Props } from '@docusaurus/types';
export declare function createStaticDirectoriesCopyPlugin({ props, }: {
    props: Props;
}): Promise<CopyWebpackPlugin | undefined>;
