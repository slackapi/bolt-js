"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.WithUntypedObjectProxy = void 0;
var param_1 = require("./param");
var WithUntypedObjectProxy = function (
// deno-lint-ignore no-explicit-any
rootObject) {
    var path = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        path[_i - 1] = arguments[_i];
    }
    var parameterizedObject = __assign(__assign({}, rootObject), param_1.ParamReference.apply(void 0, path));
    var proxy = new Proxy(parameterizedObject, {
        get: function (obj, prop) {
            // If it's a property that exists, just access it directly
            if (prop in obj) {
                // deno-lint-ignore no-explicit-any
                return Reflect.get.apply(obj, arguments);
            }
            // We're attempting to access a property that doesn't exist, so create a new nested proxy
            if (typeof prop === "string") {
                return exports.WithUntypedObjectProxy.apply(void 0, __spreadArray(__spreadArray([obj], path, false), [prop], false));
            }
            // Fallback to trying to access it directly even if it's not in this objects props
            // deno-lint-ignore no-explicit-any
            return Reflect.get.apply(obj, arguments);
        }
    });
    return proxy;
};
exports.WithUntypedObjectProxy = WithUntypedObjectProxy;
