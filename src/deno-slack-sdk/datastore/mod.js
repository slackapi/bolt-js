"use strict";
exports.__esModule = true;
exports.SlackDatastore = exports.DefineDatastore = void 0;
/**
 * Define a datastore and primary key and attributes for use in a Slack application.
 * @param {SlackDatastoreDefinition<string, SlackDatastoreAttributes, string>} definition Defines information about your datastore.
 * @returns {SlackDatastore}
 */
var DefineDatastore = function (definition) {
    return new SlackDatastore(definition);
};
exports.DefineDatastore = DefineDatastore;
var SlackDatastore = /** @class */ (function () {
    function SlackDatastore(definition) {
        this.definition = definition;
        this.name = definition.name;
    }
    SlackDatastore.prototype.registerAttributeTypes = function (manifest) {
        var _a, _b;
        (_b = Object.values((_a = this.definition.attributes) !== null && _a !== void 0 ? _a : {})) === null || _b === void 0 ? void 0 : _b.forEach(function (attribute) {
            if (attribute.type instanceof Object) {
                manifest.registerType(attribute.type);
            }
        });
    };
    SlackDatastore.prototype["export"] = function () {
        return {
            primary_key: this.definition.primary_key,
            attributes: this.definition.attributes
        };
    };
    return SlackDatastore;
}());
exports.SlackDatastore = SlackDatastore;
