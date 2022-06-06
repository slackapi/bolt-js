"use strict";
exports.__esModule = true;
exports.SlackFunctionTester = void 0;
var SlackFunctionTester = function (callbackId) {
    var now = new Date();
    var testFnID = "fn".concat(now.getTime());
    var createContext = function (args) {
        var ts = new Date();
        return {
            inputs: (args.inputs || {}),
            env: args.env || {},
            token: args.token || "slack-function-test-token",
            event: args.event || {
                type: "function_executed",
                event_ts: "".concat(ts.getTime()),
                function_execution_id: "fx".concat(ts.getTime()),
                inputs: args.inputs,
                "function": {
                    id: testFnID,
                    callback_id: callbackId,
                    title: "Function Test Title"
                }
            }
        };
    };
    return { createContext: createContext };
};
exports.SlackFunctionTester = SlackFunctionTester;
