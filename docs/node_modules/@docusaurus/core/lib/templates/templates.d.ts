/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { SSGParams } from '../ssg';
import type { AppRenderResult } from '../common';
export type SSRTemplateData = {
    appHtml: string;
    baseUrl: string;
    htmlAttributes: string;
    bodyAttributes: string;
    headTags: string;
    preBodyTags: string;
    postBodyTags: string;
    metaAttributes: string[];
    scripts: string[];
    stylesheets: string[];
    noIndex: boolean;
    version: string;
};
export type SSRTemplateCompiled = (data: SSRTemplateData) => string;
export declare function compileSSRTemplate(template: string): Promise<SSRTemplateCompiled>;
export declare function renderSSRTemplate({ params, result, }: {
    params: SSGParams;
    result: AppRenderResult;
}): string;
export declare function renderHashRouterTemplate({ params, }: {
    params: SSGParams;
}): string;
