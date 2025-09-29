"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSocials = exports.AuthorSocialsSchema = void 0;
const utils_validation_1 = require("@docusaurus/utils-validation");
exports.AuthorSocialsSchema = utils_validation_1.Joi.object({
    twitter: utils_validation_1.Joi.string(),
    github: utils_validation_1.Joi.string(),
    linkedin: utils_validation_1.Joi.string(),
    // StackOverflow userIds like '82609' are parsed as numbers by Yaml
    stackoverflow: utils_validation_1.Joi.alternatives()
        .try(utils_validation_1.Joi.number(), utils_validation_1.Joi.string())
        .custom((val) => String(val)),
    x: utils_validation_1.Joi.string(),
}).unknown();
const PredefinedPlatformNormalizers = {
    x: (handle) => `https://x.com/${handle}`,
    twitter: (handle) => `https://twitter.com/${handle}`,
    github: (handle) => `https://github.com/${handle}`,
    linkedin: (handle) => `https://www.linkedin.com/in/${handle}/`,
    stackoverflow: (userId) => `https://stackoverflow.com/users/${userId}`,
};
function normalizeSocialEntry([platform, value]) {
    const normalizer = PredefinedPlatformNormalizers[platform.toLowerCase()];
    const isAbsoluteUrl = value.startsWith('http://') || value.startsWith('https://');
    if (isAbsoluteUrl) {
        return [platform, value];
    }
    else if (value.includes('/')) {
        throw new Error(`Author socials should be usernames/userIds/handles, or fully qualified HTTP(s) absolute URLs.
Social platform '${platform}' has illegal value '${value}'`);
    }
    if (normalizer && !isAbsoluteUrl) {
        const normalizedPlatform = platform.toLowerCase();
        const normalizedValue = normalizer(value);
        return [normalizedPlatform, normalizedValue];
    }
    return [platform, value];
}
const normalizeSocials = (socials) => {
    return Object.fromEntries(Object.entries(socials).map(normalizeSocialEntry));
};
exports.normalizeSocials = normalizeSocials;
