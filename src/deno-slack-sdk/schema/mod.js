"use strict";
exports.__esModule = true;
var schema_types_1 = require("./schema_types");
var mod_1 = require("./slack/mod");
var Schema = {
    // Contains primitive types
    types: schema_types_1["default"],
    // Contains slack-specific schema types
    slack: mod_1["default"]
};
exports["default"] = Schema;
