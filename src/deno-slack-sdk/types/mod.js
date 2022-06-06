"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.CustomType = exports.DefineType = void 0;
var DefineType = function (definition) {
    return new CustomType(definition);
};
exports.DefineType = DefineType;
var CustomType = /** @class */ (function () {
    function CustomType(definition) {
        this.definition = definition;
        this.id = definition.callback_id;
        this.definition = definition;
        this.description = definition.description;
        this.title = definition.title;
    }
    CustomType.prototype.generateReferenceString = function () {
        return "#/types/".concat(this.id);
    };
    CustomType.prototype.toString = function () {
        return this.generateReferenceString();
    };
    CustomType.prototype.toJSON = function () {
        return this.generateReferenceString();
    };
    CustomType.prototype.registerParameterTypes = function (manifest) {
        if ("items" in this.definition) {
            // Register the item if its a type
            if (this.definition.items.type instanceof Object) {
                manifest.registerType(this.definition.items.type);
            }
            // } else if ("properties" in this.definition) {
            //   // Loop through the properties and register any types
            //   Object.values(this.definition.properties)?.forEach((property) => {
            //     if ("type" in property && property.type instanceof Object) {
            //       manifest.registerType(property.type);
            //     }
            //   });
        }
        else if (this.definition.type instanceof Object) {
            // The referenced type is a Custom Type
            manifest.registerType(this.definition.type);
        }
    };
    CustomType.prototype["export"] = function () {
        // remove callback_id from the definition we pass to the manifest
        var _a = this.definition, _c = _a.callback_id, definition = __rest(_a, ["callback_id"]);
        return definition;
    };
    return CustomType;
}());
exports.CustomType = CustomType;
