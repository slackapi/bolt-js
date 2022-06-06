"use strict";
exports.__esModule = true;
exports.SlackManifest = exports.Manifest = void 0;
var Manifest = function (definition) {
    var manifest = new SlackManifest(definition);
    return manifest["export"]();
};
exports.Manifest = Manifest;
var SlackManifest = /** @class */ (function () {
    function SlackManifest(definition) {
        this.definition = definition;
        this.registerFeatures();
    }
    SlackManifest.prototype["export"] = function () {
        var _a, _b, _c, _d;
        var def = this.definition;
        var manifest = {
            "_metadata": {
                // todo: is there a more idiomatic way of defining this? constant file?
                "major_version": 2
            },
            "display_information": {
                background_color: def.backgroundColor,
                name: def.name,
                long_description: def.longDescription,
                short_description: def.description
            },
            icon: def.icon,
            "oauth_config": {
                scopes: {
                    bot: this.ensureBotScopes()
                }
            },
            features: {
                bot_user: {
                    display_name: def.displayName ||
                        def.name
                }
            },
            "outgoing_domains": def.outgoingDomains || []
        };
        if (def.functions) {
            manifest.functions = (_a = def.functions) === null || _a === void 0 ? void 0 : _a.reduce(function (acc, fn) {
                if (acc === void 0) { acc = {}; }
                acc[fn.id] = fn["export"]();
                return acc;
            }, {});
        }
        if (def.workflows) {
            manifest.workflows = (_b = def.workflows) === null || _b === void 0 ? void 0 : _b.reduce(function (acc, workflow) {
                if (acc === void 0) { acc = {}; }
                acc[workflow.id] = workflow["export"]();
                return acc;
            }, {});
        }
        if (def.types) {
            manifest.types = (_c = def.types) === null || _c === void 0 ? void 0 : _c.reduce(function (acc, customType) {
                if (acc === void 0) { acc = {}; }
                acc[customType.id] = customType["export"]();
                return acc;
            }, {});
        }
        if (def.datastores) {
            manifest.datastores = (_d = def.datastores) === null || _d === void 0 ? void 0 : _d.reduce(function (acc, datastore) {
                if (acc === void 0) { acc = {}; }
                acc[datastore.name] = datastore["export"]();
                return acc;
            }, {});
        }
        return manifest;
    };
    SlackManifest.prototype.registerFeatures = function () {
        var _this = this;
        var _a, _b, _c, _d;
        (_a = this.definition.workflows) === null || _a === void 0 ? void 0 : _a.forEach(function (workflow) {
            workflow.registerStepFunctions(_this);
            workflow.registerParameterTypes(_this);
        });
        // Loop through functions to automatically register any referenced types
        (_b = this.definition.functions) === null || _b === void 0 ? void 0 : _b.forEach(function (func) {
            func.registerParameterTypes(_this);
        });
        // Loop through datastores to automatically register any referenced types
        (_c = this.definition.datastores) === null || _c === void 0 ? void 0 : _c.forEach(function (datastore) {
            datastore.registerAttributeTypes(_this);
        });
        // Loop through types to automatically register any referenced sub-types
        var registeredTypes = this.definition.types || [];
        for (var i = 0; i < registeredTypes.length; i++) {
            (_d = this.definition.types) === null || _d === void 0 ? void 0 : _d[i].registerParameterTypes(this);
        }
    };
    SlackManifest.prototype.registerFunction = function (func) {
        if (!this.definition.functions)
            this.definition.functions = [];
        // Check to make sure function doesn't already exist on manifest
        else if (this.definition.functions.some(function (f) { return func.id === f.id; }))
            return;
        // Add function to manifest
        this.definition.functions.push(func);
    };
    // Loop through a ParameterSetDefinition to register each individual type
    SlackManifest.prototype.registerTypes = function (parameterSet) {
        var _this = this;
        Object.values(parameterSet !== null && parameterSet !== void 0 ? parameterSet : {}).forEach(function (param) {
            if (param.type instanceof Object) {
                _this.registerType(param.type);
            }
        });
    };
    SlackManifest.prototype.registerType = function (customType) {
        if (!this.definition.types)
            this.definition.types = [];
        // Check to make sure type doesn't already exist on manifest
        if (this.definition.types.some(function (type) { return type.id === customType.id; })) {
            return;
        }
        // Add type to manifest
        this.definition.types.push(customType);
    };
    SlackManifest.prototype.ensureBotScopes = function () {
        var _a;
        var includedScopes = this.definition.botScopes || [];
        // Add datastore scopes if necessary
        if (Object.keys((_a = this.definition.datastores) !== null && _a !== void 0 ? _a : {}).length > 0) {
            var datastoreScopes = ["datastore:read", "datastore:write"];
            datastoreScopes.forEach(function (scope) {
                if (!includedScopes.includes(scope)) {
                    includedScopes.push(scope);
                }
            });
        }
        return includedScopes;
    };
    return SlackManifest;
}());
exports.SlackManifest = SlackManifest;
