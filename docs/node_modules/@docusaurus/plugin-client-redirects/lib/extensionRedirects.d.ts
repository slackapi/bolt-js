/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { RedirectItem } from './types';
/**
 * Create new `/path` that redirects to existing an `/path.html`
 */
export declare function createToExtensionsRedirects(paths: string[], extensions: string[]): RedirectItem[];
/**
 * Create new `/path.html/index.html` that redirects to existing an `/path`
 * The filename pattern might look weird but it's on purpose (see
 * https://github.com/facebook/docusaurus/issues/5055)
 */
export declare function createFromExtensionsRedirects(paths: string[], extensions: string[]): RedirectItem[];
