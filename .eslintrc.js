module.exports = {
    "env": {
        "es6": true,
        "node": true,
    },
    "extends": [
        "airbnb-typescript/base",
        // "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        // "plugin:@typescript-eslint/eslint-recommended"
        // 'plugin:import/errors',
        // 'plugin:import/warnings',
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.eslint.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/naming-convention": [
            "error",
            // custom rule to ignore cases that require quoting
            {
                "selector": "property",
                "format": ["camelCase", "UPPER_CASE"],
                "leadingUnderscore": "allow",
                "filter": {
                    // you can expand this regex as you find more cases that require quoting that you want to allow
                    "regex": "[_ ]",
                    "match": false
                }
            }
        ],
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/consistent-type-definitions": "error",
        "@typescript-eslint/dot-notation": "warn",
        "@typescript-eslint/explicit-member-accessibility": [
            "error",
            {
                "accessibility": "explicit"
            }
        ],
        "@typescript-eslint/indent": [
            "off",
            2,
            {
                "CallExpression": {
                    "arguments": "first"
                },
                "ArrayExpression": "first",
                "ObjectExpression": "first",
                "FunctionDeclaration": {
                    "parameters": "first"
                },
                "FunctionExpression": {
                    "parameters": "first"
                }
            }
        ],
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-dynamic-delete" : "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-for-in-array": "error",
        "@typescript-eslint/no-require-imports": "error",
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/prefer-regexp-exec" : "off",
        "@typescript-eslint/quotes": [
            "error",
            "single",
            {
                "avoidEscape": true
            }
        ],
        "@typescript-eslint/semi": [
            "error",
            "always"
        ],
        "@typescript-eslint/strict-boolean-expressions": "error",
        // Equivalent of typedef in TSLint
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/type-annotation-spacing": "error",
        "accessor-pairs": "off",
        "array-bracket-newline": [
            "off",
            "consistent"
        ],
        "array-bracket-spacing": [
            "error",
            "never"
        ],
        "array-callback-return": [
            "error",
            {
                "allowImplicit": true,
                "checkForEach": false
            }
        ],
        "array-element-newline": [
            "off",
            {
                "multiline": true,
                "minItems": 3
            }
        ],
        "arrow-body-style": [
            "error",
            "as-needed",
            {
                "requireReturnForObjectLiteral": false
            }
        ],
        "arrow-parens": [
            "off",
            "always"
        ],
        "arrow-spacing": [
            "error",
            {
                "before": true,
                "after": true
            }
        ],
        "block-scoped-var": "error",
        "block-spacing": [
            "error",
            "always"
        ],
        "brace-style": [
            "error",
            "1tbs"
        ],
        "callback-return": "off",
        "camelcase": "off",
        "capitalized-comments": [
            "off",
            "never",
            {
                "line": {
                    "ignorePattern": ".*",
                    "ignoreInlineComments": true,
                    "ignoreConsecutiveComments": true
                },
                "block": {
                    "ignorePattern": ".*",
                    "ignoreInlineComments": true,
                    "ignoreConsecutiveComments": true
                }
            }
        ],
        "class-methods-use-this": [
            "error",
            {
                "exceptMethods": []
            }
        ],
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
        "comma-spacing": [
            "error",
            {
                "before": false,
                "after": true
            }
        ],
        "comma-style": [
            "error",
            "last",
            {
                "exceptions": {
                    "ArrayExpression": false,
                    "ArrayPattern": false,
                    "ArrowFunctionExpression": false,
                    "CallExpression": false,
                    "FunctionDeclaration": false,
                    "FunctionExpression": false,
                    "ImportDeclaration": false,
                    "ObjectExpression": false,
                    "ObjectPattern": false,
                    "VariableDeclaration": false,
                    "NewExpression": false
                }
            }
        ],
        "complexity": [
            "off",
            11
        ],
        "computed-property-spacing": [
            "error",
            "never"
        ],
        "consistent-return": "error",
        "consistent-this": "off",
        "constructor-super": "error",
        "curly": [
            "error",
            "multi-line"
        ],
        "default-case": [
            "error",
            {
                "commentPattern": "^no default$"
            }
        ],
        "default-case-last": "off",
        "default-param-last": "off",
        "dot-location": [
            "error",
            "property"
        ],
        "eol-last": "error",
        "eqeqeq": [
            "error",
            "smart"
        ],
        "for-direction": "error",
        "func-call-spacing": [
            "error",
            "never"
        ],
        "func-name-matching": [
            "off",
            "always",
            {
                "includeCommonJSModuleExports": false,
                "considerPropertyDescriptor": true
            }
        ],
        "func-names": "warn",
        "func-style": [
            "off",
            "expression"
        ],
        "function-call-argument-newline": [
            "off",
            "consistent"
        ],
        "function-paren-newline": [
            "error",
            "consistent"
        ],
        "generator-star-spacing": [
            "error",
            {
                "before": false,
                "after": true
            }
        ],
        "getter-return": [
            "error",
            {
                "allowImplicit": true
            }
        ],
        "global-require": "error",
        "grouped-accessor-pairs": "off",
        "guard-for-in": "error",
        "handle-callback-err": "off",
        "id-blacklist": [
            "error",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined"
        ],
        "id-length": "off",
        "id-match": "error",
        "implicit-arrow-linebreak": [
            "error",
            "beside"
        ],
        "import/default": "off",
        "import/dynamic-import-chunkname": [
            "off",
            {
                "importFunctions": [],
                "webpackChunknameFormat": "[0-9a-zA-Z-_/.]+"
            }
        ],
        "import/export": "error",
        "import/exports-last": "off",
        "import/extensions": "off",
        // "import/extensions": [
        //     "error",
        //     "ignorePackages",
        //     {
        //         "js": "never",
        //         // "mjs": "never",
        //         "ts": "never"
        //     }
        // ],
        "import/first": "error",
        "import/group-exports": "off",
        "import/imports-first": "off",
        "import/max-dependencies": [
            "off",
            {
                "max": 10
            }
        ],
        "import/named": "error",
        "import/namespace": "off",
        "import/newline-after-import": "error",
        "import/no-absolute-path": "error",
        "import/no-amd": "error",
        "import/no-anonymous-default-export": [
            "off",
            {
                "allowArray": false,
                "allowArrowFunction": false,
                "allowAnonymousClass": false,
                "allowAnonymousFunction": false,
                "allowLiteral": false,
                "allowObject": false
            }
        ],
        "import/no-commonjs": "off",
        // "import/no-cycle": [
        //     "error",
        //     {
        //         "maxDepth": null,
        //         "ignoreExternal": false
        //     }
        // ],
        "import/no-default-export": "off",
        "import/no-deprecated": "off",
        "import/no-duplicates": "error",
        "import/no-dynamic-require": "error",
        "import/no-extraneous-dependencies": "error",
        "import/no-internal-modules": "error",
        "import/no-mutable-exports": "error",
        "import/no-named-as-default": "error",
        "import/no-named-as-default-member": "error",
        "import/no-named-default": "error",
        "import/no-named-export": "off",
        "import/no-namespace": "off",
        "import/no-nodejs-modules": "off",
        "import/no-relative-parent-imports": "off",
        "import/no-restricted-paths": "off",
        "import/no-self-import": "error",
        "import/no-unassigned-import": "off",
        "import/no-unresolved": "off",
        "import/no-unused-modules": [
            "off",
            {
                "ignoreExports": [],
                "missingExports": true,
                "unusedExports": true
            }
        ],
        "import/no-useless-path-segments": [
            "error",
            {
                "commonjs": true
            }
        ],
        "import/no-webpack-loader-syntax": "error",
        "import/order": [
            "off",
            {
                "groups": [
                    [
                        "builtin",
                        "external",
                        "internal"
                    ]
                ]
            }
        ],
        "import/prefer-default-export": "off",
        "import/unambiguous": "off",
        "indent": ["off", 2],
        "init-declarations": "off",
        // "jsdoc/check-alignment": "error",
        // "jsdoc/check-indentation": "error",
        // "jsdoc/newline-after-description": "error",
        // "jsdoc/no-types": "error",
        // "jsx-quotes": [
        //     "off",
        //     "prefer-double"
        // ],
        "key-spacing": [
            "error",
            {
                "beforeColon": false,
                "afterColon": true
            }
        ],
        "keyword-spacing": [
            "error",
            {
                "before": true,
                "after": true,
                "overrides": {
                    "return": {
                        "after": true
                    },
                    "throw": {
                        "after": true
                    },
                    "case": {
                        "after": true
                    }
                }
            }
        ],
        "line-comment-position": [
            "off",
            {
                "position": "above",
                "ignorePattern": "",
                "applyDefaultPatterns": true
            }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "lines-around-comment": "off",
        "lines-around-directive": [
            "error",
            {
                "before": "always",
                "after": "always"
            }
        ],
        "lines-between-class-members": [
            "error",
            "always",
            {
                "exceptAfterSingleLine": false
            }
        ],
        "max-classes-per-file": [
            "error",
            1
        ],
        "max-depth": [
            "off",
            4
        ],
        "max-len": [
            "error",
            {
                "code": 120
            }
        ],
        "max-lines": [
            "off",
            {
                "max": 300,
                "skipBlankLines": true,
                "skipComments": true
            }
        ],
        "max-lines-per-function": [
            "off",
            {
                "max": 50,
                "skipBlankLines": true,
                "skipComments": true,
                "IIFEs": true
            }
        ],
        "max-nested-callbacks": "off",
        "max-params": [
            "off",
            3
        ],
        "max-statements": [
            "off",
            10
        ],
        "max-statements-per-line": [
            "off",
            {
                "max": 1
            }
        ],
        "multiline-comment-style": [
            "off",
            "starred-block"
        ],
        "multiline-ternary": [
            "off",
            "never"
        ],
        "new-cap": [
            "error",
            {
                "newIsCap": true,
                "newIsCapExceptions": [],
                "capIsNew": false,
                "capIsNewExceptions": [
                    "Immutable.Map",
                    "Immutable.Set",
                    "Immutable.List"
                ],
                "properties": true
            }
        ],
        "new-parens": "error",
        "newline-after-var": "off",
        "newline-before-return": "off",
        "newline-per-chained-call": [
            "error",
            {
                "ignoreChainWithDepth": 4
            }
        ],
        "no-alert": "warn",
        "no-array-constructor": "error",
        "no-async-promise-executor": "error",
        "no-await-in-loop": "error",
        "no-bitwise": "error",
        "no-buffer-constructor": "error",
        "no-caller": "error",
        "no-case-declarations": "error",
        "no-catch-shadow": "off",
        "no-class-assign": "error",
        "no-compare-neg-zero": "error",
        "no-cond-assign": [
            "error",
            "always"
        ],
        "no-confusing-arrow": [
            "error",
            {
                "allowParens": true
            }
        ],
        "no-console": "warn",
        "no-const-assign": "error",
        "no-constant-condition": "warn",
        "no-constructor-return": "off",
        "no-continue": "error",
        "no-control-regex": "error",
        "no-debugger": "error",
        "no-delete-var": "error",
        "no-div-regex": "off",
        "no-dupe-args": "error",
        "no-dupe-class-members": "error",
        "no-dupe-else-if": "off",
        "no-dupe-keys": "error",
        "no-duplicate-case": "error",
        "no-duplicate-imports": "error",
        "no-else-return": [
            "error",
            {
                "allowElseIf": false
            }
        ],
        "no-empty": "error",
        "no-empty-character-class": "error",
        "no-empty-function": [
            "error",
            {
                "allow": [
                    "arrowFunctions",
                    "functions",
                    "methods"
                ]
            }
        ],
        "no-empty-pattern": "error",
        "no-eq-null": "off",
        "no-eval": "error",
        "no-ex-assign": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-boolean-cast": "error",
        "no-extra-label": "error",
        "no-extra-parens": [
            "off",
            "all",
            {
                "conditionalAssign": true,
                "nestedBinaryExpressions": false,
                "returnAssign": false,
                "ignoreJSX": "all",
                "enforceForArrowConditionals": false
            }
        ],
        "no-extra-semi": "error",
        "no-fallthrough": "error",
        "no-floating-decimal": "error",
        "no-func-assign": "error",
        "no-global-assign": [
            "error",
            {
                "exceptions": []
            }
        ],
        "no-implicit-coercion": [
            "off",
            {
                "boolean": false,
                "number": true,
                "string": true,
                "allow": []
            }
        ],
        "no-implicit-globals": "off",
        "no-implied-eval": "error",
        "no-import-assign": "off",
        "no-inline-comments": "off",
        "no-inner-declarations": "error",
        "no-invalid-regexp": "error",
        "no-invalid-this": "off",
        "no-irregular-whitespace": "error",
        "no-iterator": "error",
        "no-label-var": "error",
        "no-labels": [
            "error",
            {
                "allowLoop": false,
                "allowSwitch": false
            }
        ],
        "no-lone-blocks": "error",
        "no-lonely-if": "error",
        "no-loop-func": "error",
        "no-loss-of-precision": "off",
        "no-magic-numbers": [
            "off",
            {
                "ignore": [],
                "ignoreArrayIndexes": true,
                "enforceConst": true,
                "detectObjects": false
            }
        ],
        "no-misleading-character-class": "error",
        "no-mixed-operators": [
            "error",
            {
                "groups": [
                    [
                        "%",
                        "**"
                    ],
                    [
                        "%",
                        "+"
                    ],
                    [
                        "%",
                        "-"
                    ],
                    [
                        "%",
                        "*"
                    ],
                    [
                        "%",
                        "/"
                    ],
                    [
                        "/",
                        "*"
                    ],
                    [
                        "&",
                        "|",
                        "<<",
                        ">>",
                        ">>>"
                    ],
                    [
                        "==",
                        "!=",
                        "===",
                        "!=="
                    ],
                    [
                        "&&",
                        "||"
                    ]
                ],
                "allowSamePrecedence": false
            }
        ],
        "no-mixed-requires": [
            "off",
            false
        ],
        "no-mixed-spaces-and-tabs": "error",
        "no-multi-assign": "error",
        "no-multi-spaces": [
            "error",
            {
                "ignoreEOLComments": false
            }
        ],
        "no-multi-str": "error",
        "no-multiple-empty-lines": "error",
        "no-native-reassign": "off",
        "no-negated-condition": "off",
        "no-negated-in-lhs": "off",
        "no-nested-ternary": "error",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-object": "error",
        "no-new-require": "error",
        "no-new-symbol": "error",
        "no-new-wrappers": "error",
        "no-obj-calls": "error",
        "no-octal": "error",
        "no-octal-escape": "error",
        "no-param-reassign": [
            "error",
            {
                "props": true,
                "ignorePropertyModificationsFor": [
                    "acc",
                    "accumulator",
                    "e",
                    "ctx",
                    "context",
                    "req",
                    "request",
                    "res",
                    "response",
                    "$scope",
                    "staticContext"
                ]
            }
        ],
        "no-path-concat": "error",
        "no-plusplus": "error",
        "no-process-env": "off",
        "no-process-exit": "off",
        "no-proto": "error",
        "no-prototype-builtins": "error",
        "no-redeclare": "error",
        "no-regex-spaces": "error",
        "no-restricted-exports": [
            "off",
            {
                "restrictedNamedExports": [
                    "default",
                    "then"
                ]
            }
        ],
        "no-restricted-globals": [
            "error",
            "isFinite",
            "isNaN",
            "addEventListener",
            "blur",
            "close",
            "closed",
            "confirm",
            "defaultStatus",
            "defaultstatus",
            "event",
            "external",
            "find",
            "focus",
            "frameElement",
            "frames",
            "history",
            "innerHeight",
            "innerWidth",
            "length",
            "location",
            "locationbar",
            "menubar",
            "moveBy",
            "moveTo",
            "name",
            "onblur",
            "onerror",
            "onfocus",
            "onload",
            "onresize",
            "onunload",
            "open",
            "opener",
            "opera",
            "outerHeight",
            "outerWidth",
            "pageXOffset",
            "pageYOffset",
            "parent",
            "print",
            "removeEventListener",
            "resizeBy",
            "resizeTo",
            "screen",
            "screenLeft",
            "screenTop",
            "screenX",
            "screenY",
            "scroll",
            "scrollbars",
            "scrollBy",
            "scrollTo",
            "scrollX",
            "scrollY",
            "self",
            "status",
            "statusbar",
            "stop",
            "toolbar",
            "top"
        ],
        "no-restricted-imports": [
            "off",
            {
                "paths": [],
                "patterns": []
            }
        ],
        "no-restricted-modules": "off",
        "no-restricted-properties": [
            "error",
            {
                "object": "arguments",
                "property": "callee",
                "message": "arguments.callee is deprecated"
            },
            {
                "object": "global",
                "property": "isFinite",
                "message": "Please use Number.isFinite instead"
            },
            {
                "object": "self",
                "property": "isFinite",
                "message": "Please use Number.isFinite instead"
            },
            {
                "object": "window",
                "property": "isFinite",
                "message": "Please use Number.isFinite instead"
            },
            {
                "object": "global",
                "property": "isNaN",
                "message": "Please use Number.isNaN instead"
            },
            {
                "object": "self",
                "property": "isNaN",
                "message": "Please use Number.isNaN instead"
            },
            {
                "object": "window",
                "property": "isNaN",
                "message": "Please use Number.isNaN instead"
            },
            {
                "property": "__defineGetter__",
                "message": "Please use Object.defineProperty instead."
            },
            {
                "property": "__defineSetter__",
                "message": "Please use Object.defineProperty instead."
            },
            {
                "object": "Math",
                "property": "pow",
                "message": "Use the exponentiation operator (**) instead."
            }
        ],
        "no-restricted-syntax": [
            "error",
            {
                "selector": "ForInStatement",
                "message": "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array."
            },
            {
                "selector": "ForOfStatement",
                "message": "iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations."
            },
            {
                "selector": "LabeledStatement",
                "message": "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand."
            },
            {
                "selector": "WithStatement",
                "message": "`with` is disallowed in strict mode because it makes code impossible to predict and optimize."
            }
        ],
        "no-return-assign": [
            "error",
            "always"
        ],
        "no-return-await": "error",
        "no-script-url": "error",
        "no-self-assign": [
            "error",
            {
                "props": true
            }
        ],
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-setter-return": "off",
        "no-shadow": "error",
        "no-shadow-restricted-names": "error",
        "no-spaced-func": "error",
        "no-sparse-arrays": "error",
        "no-sync": "off",
        "no-tabs": "error",
        "no-template-curly-in-string": "error",
        "no-ternary": "off",
        "no-this-before-super": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef": "error",
        "no-undef-init": "error",
        "no-undefined": "off",
        "no-underscore-dangle": "error",
        "no-unexpected-multiline": "error",
        "no-unmodified-loop-condition": "off",
        "no-unneeded-ternary": [
            "error",
            {
                "defaultAssignment": false
            }
        ],
        "no-unreachable": "error",
        "no-unsafe-finally": "error",
        "no-unsafe-negation": "error",
        "no-unused-expressions": [
            "error",
            {
                "allowShortCircuit": false,
                "allowTernary": false,
                "allowTaggedTemplates": false
            }
        ],
        "no-unused-labels": "error",
        "no-unused-vars": "off",
        // "no-unused-vars": [
        //     "error",
        //     {
        //         "vars": "all",
        //         "args": "after-used",
        //         "ignoreRestSiblings": true
        //     }
        // ],
        "no-use-before-define": [
            "error",
            {
                "functions": true,
                "classes": true,
                "variables": true
            }
        ],
        "no-useless-backreference": "off",
        "no-useless-call": "off",
        "no-useless-catch": "error",
        "no-useless-computed-key": "error",
        "no-useless-concat": "error",
        "no-useless-constructor": "error",
        "no-useless-escape": "error",
        "no-useless-rename": [
            "error",
            {
                "ignoreDestructuring": false,
                "ignoreImport": false,
                "ignoreExport": false
            }
        ],
        "no-useless-return": "error",
        "no-var": "error",
        "no-void": "error",
        "no-warning-comments": [
            "off",
            {
                "terms": [
                    "todo",
                    "fixme",
                    "xxx"
                ],
                "location": "start"
            }
        ],
        "no-whitespace-before-property": "error",
        "no-with": "error",
        "nonblock-statement-body-position": [
            "error",
            "beside",
            {
                "overrides": {}
            }
        ],
        "object-curly-newline": [
            "error",
            {
                "ObjectExpression": {
                    "minProperties": 4,
                    "multiline": true,
                    "consistent": true
                },
                "ObjectPattern": {
                    "minProperties": 4,
                    "multiline": true,
                    "consistent": true
                },
                "ImportDeclaration": {
                    "minProperties": 4,
                    "multiline": true,
                    "consistent": true
                },
                "ExportDeclaration": {
                    "minProperties": 4,
                    "multiline": true,
                    "consistent": true
                }
            }
        ],
        "object-curly-spacing": [
            "error",
            "always"
        ],
        "object-property-newline": [
            "error",
            {
                "allowAllPropertiesOnSameLine": true,
                "allowMultiplePropertiesPerLine": false
            }
        ],
        "object-shorthand": "error",
        "one-var": [
            "error",
            "never"
        ],
        "one-var-declaration-per-line": [
            "error",
            "always"
        ],
        "operator-assignment": [
            "error",
            "always"
        ],
        "operator-linebreak": [
            "error",
            "before",
            {
                "overrides": {
                    "=": "none"
                }
            }
        ],
        "padded-blocks": [
            "error",
            {
                "blocks": "never",
                "classes": "never",
                "switches": "never"
            },
            {
                "allowSingleLineBlocks": true
            }
        ],
        "padding-line-between-statements": "off",
        "prefer-arrow-callback": [
            "error",
            {
                "allowNamedFunctions": false,
                "allowUnboundThis": true
            }
        ],
        "prefer-const": "error",
        "prefer-destructuring": [
            "error",
            {
                "VariableDeclarator": {
                    "array": false,
                    "object": true
                },
                "AssignmentExpression": {
                    "array": true,
                    "object": false
                }
            },
            {
                "enforceForRenamedProperties": false
            }
        ],
        "prefer-exponentiation-operator": "off",
        "prefer-named-capture-group": "off",
        "prefer-numeric-literals": "error",
        "prefer-object-spread": "error",
        "prefer-promise-reject-errors": [
            "error",
            {
                "allowEmptyReject": true
            }
        ],
        "prefer-reflect": "off",
        "prefer-regex-literals": "off",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "prefer-template": "error",
        "quote-props": [
            "error",
            "as-needed"
        ],
        "quotes": [
            "error",
            "single",
            {
                "avoidEscape": true
            }
        ],
        "radix": "error",
        "require-atomic-updates": "off",
        "require-await": "off",
        "require-jsdoc": "off",
        "require-unicode-regexp": "off",
        "require-yield": "error",
        "rest-spread-spacing": [
            "error",
            "never"
        ],
        "semi": [
            "error",
            "always"
        ],
        "semi-spacing": [
            "error",
            {
                "before": false,
                "after": true
            }
        ],
        "semi-style": [
            "error",
            "last"
        ],
        "sort-imports": [
            "off",
            {
                "ignoreCase": false,
                "ignoreDeclarationSort": false,
                "ignoreMemberSort": false,
                "memberSyntaxSortOrder": [
                    "none",
                    "all",
                    "multiple",
                    "single"
                ]
            }
        ],
        "sort-keys": [
            "off",
            "asc",
            {
                "caseSensitive": false,
                "natural": true
            }
        ],
        "sort-vars": "off",
        "space-before-blocks": "error",
        "space-before-function-paren": [
            "error",
            {
                "anonymous": "always",
                "named": "never"
            }
        ],
        "space-in-parens": [
            "error",
            "never"
        ],
        "space-infix-ops": "error",
        "space-unary-ops": [
            "error",
            {
                "words": true,
                "nonwords": false,
                "overrides": {}
            }
        ],
        "spaced-comment": [
            "error",
            "always",
            {
                "markers": [
                    "/"
                ]
            }
        ],
        "strict": [
            "error",
            "never"
        ],
        "switch-colon-spacing": [
            "error",
            {
                "after": true,
                "before": false
            }
        ],
        "symbol-description": "error",
        "template-curly-spacing": "error",
        "template-tag-spacing": [
            "error",
            "never"
        ],
        "unicode-bom": [
            "error",
            "never"
        ],
        "use-isnan": "error",
        "valid-jsdoc": "off",
        "valid-typeof": [
            "error",
            {
                "requireStringLiterals": true
            }
        ],
        "vars-on-top": "error",
        "wrap-iife": [
            "error",
            "outside",
            {
                "functionPrototypeMethods": false
            }
        ],
        "wrap-regex": "off",
        "yield-star-spacing": [
            "error",
            "after"
        ],
        "yoda": "error"
    },
    "settings": {
        "react": {
            "version": "999.999.999"
        },
        "import/resolver": {
            "node": {
                "extensions": [
                    ".mjs",
                    ".js",
                    ".json"
                ]
            }
        },
        "import/extensions": [
            ".js",
            // ".mjs",
            ".ts"
        ],
        "import/core-modules": [],
        "import/ignore": [
            "node_modules",
            "\\.(coffee|scss|css|less|hbs|svg|json)$"
        ]
    }
};
