"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerfLogger = exports.PerfDebuggingEnabled = void 0;
const tslib_1 = require("tslib");
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const async_hooks_1 = require("async_hooks");
const logger_1 = tslib_1.__importDefault(require("@docusaurus/logger"));
// For now this is a private env variable we use internally
// But we'll want to expose this feature officially some day
exports.PerfDebuggingEnabled = !!process.env.DOCUSAURUS_PERF_LOGGER;
const Thresholds = {
    min: 5,
    yellow: 100,
    red: 1000,
};
const PerfPrefix = logger_1.default.yellow(`[PERF] `);
// This is what enables to "see the parent stack" for each log
// Parent1 > Parent2 > Parent3 > child trace
const ParentPrefix = new async_hooks_1.AsyncLocalStorage();
function applyParentPrefix(label) {
    const parentPrefix = ParentPrefix.getStore();
    return parentPrefix ? `${parentPrefix} > ${label}` : label;
}
function createPerfLogger() {
    if (!exports.PerfDebuggingEnabled) {
        const noop = () => { };
        return {
            start: noop,
            end: noop,
            log: noop,
            async: async (_label, asyncFn) => asyncFn(),
        };
    }
    const formatDuration = (duration) => {
        if (duration > Thresholds.red) {
            return logger_1.default.red(`${(duration / 1000).toFixed(2)} seconds!`);
        }
        else if (duration > Thresholds.yellow) {
            return logger_1.default.yellow(`${duration.toFixed(2)} ms`);
        }
        else {
            return logger_1.default.green(`${duration.toFixed(2)} ms`);
        }
    };
    const logDuration = (label, duration) => {
        if (duration < Thresholds.min) {
            return;
        }
        console.log(`${PerfPrefix + label} - ${formatDuration(duration)}`);
    };
    const start = (label) => performance.mark(label);
    const end = (label) => {
        const { duration } = performance.measure(label);
        performance.clearMarks(label);
        logDuration(applyParentPrefix(label), duration);
    };
    const log = (label) => console.log(PerfPrefix + applyParentPrefix(label));
    const async = async (label, asyncFn) => {
        const finalLabel = applyParentPrefix(label);
        const before = performance.now();
        const result = await ParentPrefix.run(finalLabel, () => asyncFn());
        const duration = performance.now() - before;
        logDuration(finalLabel, duration);
        return result;
    };
    return {
        start,
        end,
        log,
        async,
    };
}
exports.PerfLogger = createPerfLogger();
