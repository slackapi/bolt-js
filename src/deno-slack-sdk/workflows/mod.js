"use strict";
exports.__esModule = true;
exports.WorkflowDefinition = exports.DefineWorkflow = void 0;
var mod_1 = require("../parameters/mod");
var workflow_step_1 = require("./workflow-step");
var DefineWorkflow = function (definition) {
    return new WorkflowDefinition(definition);
};
exports.DefineWorkflow = DefineWorkflow;
var WorkflowDefinition = /** @class */ (function () {
    function WorkflowDefinition(definition) {
        var _a;
        this.steps = [];
        this.id = definition.callback_id;
        this.definition = definition;
        this.inputs = {};
        this.outputs = {};
        for (var _i = 0, _b = Object.entries(((_a = definition.input_parameters) === null || _a === void 0 ? void 0 : _a.properties)
            ? definition.input_parameters.properties
            : {}); _i < _b.length; _i++) {
            var _c = _b[_i], inputName = _c[0], inputDefinition = _c[1];
            // deno-lint-ignore ban-ts-comment
            //@ts-ignore
            this.inputs[inputName] = (0, mod_1.ParameterVariable)("inputs", inputName, inputDefinition);
        }
    }
    // The runtime implementation of addStep handles both signatures (straight function-reference & config, or ISlackFunction)
    WorkflowDefinition.prototype.addStep = function (functionOrReference, inputs) {
        var stepId = "".concat(this.steps.length);
        if (typeof functionOrReference === "string") {
            var newStep_1 = new workflow_step_1.UntypedWorkflowStepDefinition(stepId, functionOrReference, inputs);
            this.steps.push(newStep_1);
            return newStep_1;
        }
        var slackFunction = functionOrReference;
        var newStep = new workflow_step_1.TypedWorkflowStepDefinition(stepId, slackFunction, inputs);
        this.steps.push(newStep);
        return newStep;
    };
    WorkflowDefinition.prototype["export"] = function () {
        return {
            title: this.definition.title,
            description: this.definition.description,
            input_parameters: this.definition.input_parameters,
            steps: this.steps.map(function (s) { return s["export"](); })
        };
    };
    WorkflowDefinition.prototype.registerStepFunctions = function (manifest) {
        this.steps.forEach(function (s) { return s.registerFunction(manifest); });
    };
    WorkflowDefinition.prototype.registerParameterTypes = function (manifest) {
        var _a, _b;
        var _c = this.definition, inputParams = _c.input_parameters, outputParams = _c.output_parameters;
        manifest.registerTypes((_a = inputParams === null || inputParams === void 0 ? void 0 : inputParams.properties) !== null && _a !== void 0 ? _a : {});
        manifest.registerTypes((_b = outputParams === null || outputParams === void 0 ? void 0 : outputParams.properties) !== null && _b !== void 0 ? _b : {});
    };
    WorkflowDefinition.prototype.toJSON = function () {
        return this["export"]();
    };
    return WorkflowDefinition;
}());
exports.WorkflowDefinition = WorkflowDefinition;
