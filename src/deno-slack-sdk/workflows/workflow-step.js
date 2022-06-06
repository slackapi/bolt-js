"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.UntypedWorkflowStepDefinition = exports.TypedWorkflowStepDefinition = void 0;
var mod_1 = require("../parameters/mod");
var localFnPrefix = "#/functions/";
var BaseWorkflowStepDefinition = /** @class */ (function () {
    function BaseWorkflowStepDefinition(stepId, functionReference, inputs) {
        this.stepId = stepId;
        // ensures the function reference is a full path - local functions will only be passing in the function callback id
        this.functionReference = functionReference.includes("#/")
            ? functionReference
            : "".concat(localFnPrefix).concat(functionReference);
        this.inputs = inputs;
    }
    BaseWorkflowStepDefinition.prototype.templatizeInputs = function () {
        var templatizedInputs = {};
        for (var _i = 0, _a = Object.entries(this.inputs); _i < _a.length; _i++) {
            var _b = _a[_i], inputName = _b[0], inputValue = _b[1];
            templatizedInputs[inputName] = JSON.parse(JSON.stringify(inputValue));
        }
        return templatizedInputs;
    };
    BaseWorkflowStepDefinition.prototype["export"] = function () {
        return {
            id: this.stepId,
            function_id: this.functionReference,
            inputs: this.templatizeInputs()
        };
    };
    BaseWorkflowStepDefinition.prototype.toJSON = function () {
        return this["export"]();
    };
    BaseWorkflowStepDefinition.prototype.registerFunction = function (_manifest) {
        // default is a noop, only steps using a function definition will register themselves on the manifest
    };
    BaseWorkflowStepDefinition.prototype.isLocalFunctionReference = function () {
        return this.functionReference.startsWith(localFnPrefix);
    };
    return BaseWorkflowStepDefinition;
}());
var TypedWorkflowStepDefinition = /** @class */ (function (_super) {
    __extends(TypedWorkflowStepDefinition, _super);
    function TypedWorkflowStepDefinition(stepId, slackFunction, inputs) {
        var _this = this;
        var _a, _b, _c;
        _this = _super.call(this, stepId, slackFunction.id, inputs) || this;
        _this.definition = slackFunction;
        _this.outputs = {};
        // Setup step outputs for use in input template expressions
        for (var _i = 0, _d = Object.entries((_c = (_b = (_a = slackFunction === null || slackFunction === void 0 ? void 0 : slackFunction.definition) === null || _a === void 0 ? void 0 : _a.output_parameters) === null || _b === void 0 ? void 0 : _b.properties) !== null && _c !== void 0 ? _c : {}); _i < _d.length; _i++) {
            var _e = _d[_i], outputName = _e[0], outputDefinition = _e[1];
            // deno-lint-ignore ban-ts-comment
            //@ts-ignore
            _this.outputs[outputName] = (0, mod_1.ParameterVariable)("steps.".concat(_this.stepId), outputName, outputDefinition);
        }
        return _this;
    }
    TypedWorkflowStepDefinition.prototype.registerFunction = function (manifest) {
        if (this.isLocalFunctionReference()) {
            manifest.registerFunction(this.definition);
        }
    };
    return TypedWorkflowStepDefinition;
}(BaseWorkflowStepDefinition));
exports.TypedWorkflowStepDefinition = TypedWorkflowStepDefinition;
var UntypedWorkflowStepDefinition = /** @class */ (function (_super) {
    __extends(UntypedWorkflowStepDefinition, _super);
    function UntypedWorkflowStepDefinition(stepId, functionReference, 
    // deno-lint-ignore no-explicit-any
    inputs) {
        var _this = _super.call(this, stepId, functionReference, inputs) || this;
        _this.outputs = (0, mod_1.CreateUntypedObjectParameterVariable)("steps.".concat(stepId), "");
        return _this;
    }
    return UntypedWorkflowStepDefinition;
}(BaseWorkflowStepDefinition));
exports.UntypedWorkflowStepDefinition = UntypedWorkflowStepDefinition;
