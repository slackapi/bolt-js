"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRedirect = validateRedirect;
const utils_validation_1 = require("@docusaurus/utils-validation");
const RedirectSchema = utils_validation_1.Joi.object({
    from: utils_validation_1.PathnameSchema.required(),
    to: utils_validation_1.Joi.string().required(),
});
function validateRedirect(redirect) {
    const { error } = RedirectSchema.validate(redirect, {
        abortEarly: true,
        convert: false,
    });
    if (error) {
        // Tells the user which redirect is the problem!
        throw new Error(`${JSON.stringify(redirect)} => Validation error: ${error.message}`);
    }
}
