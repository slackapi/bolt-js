"use strict";
exports.__esModule = true;
exports.SlackFunction = exports.DefineFunction = void 0;
/**
 * Define a function and its input and output parameters for use in a Slack application.
 * @param {string} id Unique string identifier for the function; must be unique in your application (cannot be reused by other functions)
 * @param {FunctionDefinitionArgs<InputParameters, OutputParameters, RequiredInput, RequiredOutput>} definition Defines information about your function (title, description) as well as formalizes the input and output parameters of your function
 * @returns {SlackFunction}
 */
var DefineFunction = function (definition) {
    return new SlackFunction(definition);
};
exports.DefineFunction = DefineFunction;
var SlackFunction = /** @class */ (function () {
    function SlackFunction(definition) {
        this.definition = definition;
        this.id = definition.callback_id;
        this.definition = definition;
    }
    SlackFunction.prototype.registerParameterTypes = function (manifest) {
        var _a, _b;
        var _c = this.definition, inputParams = _c.input_parameters, outputParams = _c.output_parameters;
        manifest.registerTypes((_a = inputParams === null || inputParams === void 0 ? void 0 : inputParams.properties) !== null && _a !== void 0 ? _a : {});
        manifest.registerTypes((_b = outputParams === null || outputParams === void 0 ? void 0 : outputParams.properties) !== null && _b !== void 0 ? _b : {});
    };
    SlackFunction.prototype["export"] = function () {
        var _a, _b;
        return {
            title: this.definition.title,
            description: this.definition.description,
            source_file: this.definition.source_file,
            input_parameters: (_a = this.definition.input_parameters) !== null && _a !== void 0 ? _a : { properties: {}, required: [] },
            output_parameters: (_b = this.definition.output_parameters) !== null && _b !== void 0 ? _b : { properties: {}, required: [] }
        };
    };
    return SlackFunction;
}());
exports.SlackFunction = SlackFunction;
