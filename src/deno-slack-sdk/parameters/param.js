"use strict";
exports.__esModule = true;
exports.ParamReference = void 0;
// deno-lint-ignore no-explicit-any
var ParamReference = function () {
    var path = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        path[_i] = arguments[_i];
    }
    var fullPath = path.filter(Boolean).join(".");
    return {
        toString: function () { return "{{".concat(fullPath, "}}"); },
        toJSON: function () { return "{{".concat(fullPath, "}}"); }
    };
};
exports.ParamReference = ParamReference;
