/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Globby } from '@docusaurus/utils';
export declare function safeGlobby(patterns: string[], options?: Globby.GlobbyOptions): Promise<string[]>;
