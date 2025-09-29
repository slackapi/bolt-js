"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createRedirectPageContent;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const eta = tslib_1.__importStar(require("eta"));
const redirectPage_template_html_1 = tslib_1.__importDefault(require("./templates/redirectPage.template.html"));
const getCompiledRedirectPageTemplate = lodash_1.default.memoize(() => eta.compile(redirectPage_template_html_1.default.trim()));
function renderRedirectPageTemplate(data) {
    const compiled = getCompiledRedirectPageTemplate();
    return compiled(data, eta.defaultConfig);
}
// if the target url does not include ?search#anchor,
// we forward search/anchor that the redirect page receives
function searchAnchorForwarding(toUrl) {
    try {
        const url = new URL(toUrl, 'https://example.com');
        const containsSearchOrAnchor = url.search || url.hash;
        return !containsSearchOrAnchor;
    }
    catch (e) {
        return false;
    }
}
function createRedirectPageContent({ toUrl, }) {
    return renderRedirectPageTemplate({
        toUrl: encodeURI(toUrl),
        searchAnchorForwarding: searchAnchorForwarding(toUrl),
    });
}
