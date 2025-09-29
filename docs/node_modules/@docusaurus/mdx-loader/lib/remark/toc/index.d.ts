/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Root } from 'mdast';
import type { Transformer } from 'unified';
interface PluginOptions {
    name?: string;
}
export default function plugin(options?: PluginOptions): Transformer<Root>;
export {};
//# sourceMappingURL=index.d.ts.map