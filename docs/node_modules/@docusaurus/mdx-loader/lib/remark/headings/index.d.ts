/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Transformer } from 'unified';
export interface PluginOptions {
    anchorsMaintainCase: boolean;
}
export default function plugin({ anchorsMaintainCase, }: PluginOptions): Transformer;
//# sourceMappingURL=index.d.ts.map