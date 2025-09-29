/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { PluginContext, RedirectItem } from './types';
export default function collectRedirects(pluginContext: PluginContext, trailingSlash: boolean | undefined): RedirectItem[];
