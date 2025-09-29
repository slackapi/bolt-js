"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OPTIONS = void 0;
exports.validateOptions = validateOptions;
const utils_validation_1 = require("@docusaurus/utils-validation");
exports.DEFAULT_OPTIONS = {
    fromExtensions: [],
    toExtensions: [],
    redirects: [],
};
const RedirectPluginOptionValidation = utils_validation_1.Joi.object({
    from: utils_validation_1.Joi.alternatives().try(utils_validation_1.PathnameSchema.required(), utils_validation_1.Joi.array().items(utils_validation_1.PathnameSchema.required())),
    to: utils_validation_1.Joi.string().required(),
});
const isString = utils_validation_1.Joi.string().required().not(null);
const UserOptionsSchema = utils_validation_1.Joi.object({
    fromExtensions: utils_validation_1.Joi.array()
        .items(isString)
        .default(exports.DEFAULT_OPTIONS.fromExtensions),
    toExtensions: utils_validation_1.Joi.array()
        .items(isString)
        .default(exports.DEFAULT_OPTIONS.toExtensions),
    redirects: utils_validation_1.Joi.array()
        .items(RedirectPluginOptionValidation)
        .default(exports.DEFAULT_OPTIONS.redirects),
    createRedirects: utils_validation_1.Joi.function().maxArity(1),
}).default(exports.DEFAULT_OPTIONS);
function validateOptions({ validate, options: userOptions, }) {
    return validate(UserOptionsSchema, userOptions);
}
