// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const Manifest = (definition) => {
  const manifest = new SlackManifest(definition);
  return manifest.export();
};
class SlackManifest {
  constructor(definition) {
    this.definition = definition;
    this.registerFeatures();
  }
  export() {
    const def = this.definition;
    const manifest = {
      "_metadata": {
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
          display_name: def.displayName || def.name
        }
      },
      "outgoing_domains": def.outgoingDomains || []
    };
    if (def.functions) {
      manifest.functions = def.functions?.reduce((acc = {}, fn) => {
        acc[fn.id] = fn.export();
        return acc;
      }, {});
    }
    if (def.workflows) {
      manifest.workflows = def.workflows?.reduce((acc = {}, workflow) => {
        acc[workflow.id] = workflow.export();
        return acc;
      }, {});
    }
    if (def.types) {
      manifest.types = def.types?.reduce((acc = {}, customType) => {
        acc[customType.id] = customType.export();
        return acc;
      }, {});
    }
    if (def.datastores) {
      manifest.datastores = def.datastores?.reduce((acc = {}, datastore) => {
        acc[datastore.name] = datastore.export();
        return acc;
      }, {});
    }
    return manifest;
  }
  registerFeatures() {
    this.definition.workflows?.forEach((workflow) => {
      workflow.registerStepFunctions(this);
      workflow.registerParameterTypes(this);
    });
    this.definition.functions?.forEach((func) => {
      func.registerParameterTypes(this);
    });
    this.definition.datastores?.forEach((datastore) => {
      datastore.registerAttributeTypes(this);
    });
    const registeredTypes = this.definition.types || [];
    for (let i = 0; i < registeredTypes.length; i++) {
      this.definition.types?.[i].registerParameterTypes(this);
    }
  }
  registerFunction(func) {
    if (!this.definition.functions) this.definition.functions = [];
    else if (this.definition.functions.some((f) => func.id === f.id
    )) return;
    this.definition.functions.push(func);
  }
  registerTypes(parameterSet) {
    Object.values(parameterSet ?? {}).forEach((param) => {
      if (param.type instanceof Object) {
        this.registerType(param.type);
      }
    });
  }
  registerType(customType) {
    if (!this.definition.types) this.definition.types = [];
    if (this.definition.types.some((type) => type.id === customType.id
    )) {
      return;
    }
    this.definition.types.push(customType);
  }
  ensureBotScopes() {
    const includedScopes = this.definition.botScopes || [];
    if (Object.keys(this.definition.datastores ?? {}).length > 0) {
      const datastoreScopes = [
        "datastore:read",
        "datastore:write"
      ];
      datastoreScopes.forEach((scope) => {
        if (!includedScopes.includes(scope)) {
          includedScopes.push(scope);
        }
      });
    }
    return includedScopes;
  }
  definition;
}
const DefineFunction = (definition) => {
  return new SlackFunction(definition);
};
class SlackFunction {
  id;
  constructor(definition) {
    this.definition = definition;
    this.id = definition.callback_id;
    this.definition = definition;
  }
  registerParameterTypes(manifest) {
    const { input_parameters: inputParams, output_parameters: outputParams } = this.definition;
    manifest.registerTypes(inputParams?.properties ?? {});
    manifest.registerTypes(outputParams?.properties ?? {});
  }
  export() {
    return {
      title: this.definition.title,
      description: this.definition.description,
      source_file: this.definition.source_file,
      input_parameters: this.definition.input_parameters ?? {
        properties: {},
        required: []
      },
      output_parameters: this.definition.output_parameters ?? {
        properties: {},
        required: []
      }
    };
  }
  definition;
}
const ParamReference = (...path) => {
  const fullPath = path.filter(Boolean).join(".");
  return {
    toString: () => `{{${fullPath}}}`
    ,
    toJSON: () => `{{${fullPath}}}`
  };
};
const WithUntypedObjectProxy = (rootObject, ...path) => {
  const parameterizedObject = {
    ...rootObject,
    ...ParamReference(...path)
  };
  const proxy = new Proxy(parameterizedObject, {
    get: function (obj, prop) {
      if (prop in obj) {
        return Reflect.get.apply(obj, arguments);
      }
      if (typeof prop === "string") {
        return WithUntypedObjectProxy(obj, ...path, prop);
      }
      return Reflect.get.apply(obj, arguments);
    }
  });
  return proxy;
};
const ParameterVariable = (namespace, paramName, definition) => {
  let param = null;
  if (definition.type instanceof Object) {
    param = ParameterVariable(namespace, paramName, definition.type.definition);
  } else {
    param = CreateSingleParameterVariable(namespace, paramName);
  }
  return param;
};
const CreateUntypedObjectParameterVariable = (namespace, paramName) => {
  return WithUntypedObjectProxy({}, namespace, paramName);
};
const CreateSingleParameterVariable = (namespace, paramName) => {
  return ParamReference(namespace, paramName);
};
const localFnPrefix = "#/functions/";
class BaseWorkflowStepDefinition {
  stepId;
  functionReference;
  inputs;
  constructor(stepId, functionReference, inputs) {
    this.stepId = stepId;
    this.functionReference = functionReference.includes("#/") ? functionReference : `${localFnPrefix}${functionReference}`;
    this.inputs = inputs;
  }
  templatizeInputs() {
    const templatizedInputs = {};
    for (const [inputName, inputValue] of Object.entries(this.inputs)) {
      templatizedInputs[inputName] = JSON.parse(JSON.stringify(inputValue));
    }
    return templatizedInputs;
  }
  export() {
    return {
      id: this.stepId,
      function_id: this.functionReference,
      inputs: this.templatizeInputs()
    };
  }
  toJSON() {
    return this.export();
  }
  registerFunction(_manifest) { }
  isLocalFunctionReference() {
    return this.functionReference.startsWith(localFnPrefix);
  }
}
class TypedWorkflowStepDefinition extends BaseWorkflowStepDefinition {
  definition;
  outputs;
  constructor(stepId, slackFunction, inputs) {
    super(stepId, slackFunction.id, inputs);
    this.definition = slackFunction;
    this.outputs = {};
    for (const [outputName, outputDefinition] of Object.entries(slackFunction?.definition?.output_parameters?.properties ?? {})) {
      this.outputs[outputName] = ParameterVariable(`steps.${this.stepId}`, outputName, outputDefinition);
    }
  }
  registerFunction(manifest) {
    if (this.isLocalFunctionReference()) {
      manifest.registerFunction(this.definition);
    }
  }
}
class UntypedWorkflowStepDefinition extends BaseWorkflowStepDefinition {
  outputs;
  constructor(stepId, functionReference, inputs) {
    super(stepId, functionReference, inputs);
    this.outputs = CreateUntypedObjectParameterVariable(`steps.${stepId}`, "");
  }
}
const DefineWorkflow = (definition) => {
  return new WorkflowDefinition(definition);
};
class WorkflowDefinition {
  id;
  definition;
  inputs;
  outputs;
  steps = [];
  constructor(definition) {
    this.id = definition.callback_id;
    this.definition = definition;
    this.inputs = {};
    this.outputs = {};
    for (const [inputName, inputDefinition] of Object.entries(definition.input_parameters?.properties ? definition.input_parameters.properties : {})) {
      this.inputs[inputName] = ParameterVariable("inputs", inputName, inputDefinition);
    }
  }
  addStep(functionOrReference, inputs) {
    const stepId = `${this.steps.length}`;
    if (typeof functionOrReference === "string") {
      const newStep = new UntypedWorkflowStepDefinition(stepId, functionOrReference, inputs);
      this.steps.push(newStep);
      return newStep;
    }
    const slackFunction = functionOrReference;
    const newStep = new TypedWorkflowStepDefinition(stepId, slackFunction, inputs);
    this.steps.push(newStep);
    return newStep;
  }
  export() {
    return {
      title: this.definition.title,
      description: this.definition.description,
      input_parameters: this.definition.input_parameters,
      steps: this.steps.map((s) => s.export()
      )
    };
  }
  registerStepFunctions(manifest) {
    this.steps.forEach((s) => s.registerFunction(manifest)
    );
  }
  registerParameterTypes(manifest) {
    const { input_parameters: inputParams, output_parameters: outputParams } = this.definition;
    manifest.registerTypes(inputParams?.properties ?? {});
    manifest.registerTypes(outputParams?.properties ?? {});
  }
  toJSON() {
    return this.export();
  }
}
const DefineType = (definition) => {
  return new CustomType(definition);
};
class CustomType {
  id;
  title;
  description;
  constructor(definition) {
    this.definition = definition;
    this.id = definition.callback_id;
    this.definition = definition;
    this.description = definition.description;
    this.title = definition.title;
  }
  generateReferenceString() {
    return `#/types/${this.id}`;
  }
  toString() {
    return this.generateReferenceString();
  }
  toJSON() {
    return this.generateReferenceString();
  }
  registerParameterTypes(manifest) {
    if ("items" in this.definition) {
      if (this.definition.items.type instanceof Object) {
        manifest.registerType(this.definition.items.type);
      }
    } else if (this.definition.type instanceof Object) {
      manifest.registerType(this.definition.type);
    }
  }
  export() {
    const { callback_id: _c, ...definition } = this.definition;
    return definition;
  }
  definition;
}
const SchemaTypes = {
  string: "string",
  boolean: "boolean",
  array: "array"
};
const SlackTypes = {
  user_id: "slack#/types/user_id",
  channel_id: "slack#/types/channel_id"
};
const SlackSchema = {
  types: SlackTypes
};
const Schema = {
  types: SchemaTypes,
  slack: SlackSchema
};
const DefineDatastore = (definition) => {
  return new SlackDatastore(definition);
};
class SlackDatastore {
  name;
  constructor(definition) {
    this.definition = definition;
    this.name = definition.name;
  }
  registerAttributeTypes(manifest) {
    Object.values(this.definition.attributes ?? {})?.forEach((attribute) => {
      if (attribute.type instanceof Object) {
        manifest.registerType(attribute.type);
      }
    });
  }
  export() {
    return {
      primary_key: this.definition.primary_key,
      attributes: this.definition.attributes
    };
  }
  definition;
}
const SlackFunctionTester = (callbackId) => {
  const now = new Date();
  const testFnID = `fn${now.getTime()}`;
  const createContext = (args) => {
    const ts = new Date();
    return {
      inputs: args.inputs || {},
      env: args.env || {},
      token: args.token || "slack-function-test-token",
      event: args.event || {
        type: "function_executed",
        event_ts: `${ts.getTime()}`,
        function_execution_id: `fx${ts.getTime()}`,
        inputs: args.inputs,
        function: {
          id: testFnID,
          callback_id: callbackId,
          title: "Function Test Title"
        }
      }
    };
  };
  return {
    createContext
  };
};
export { Manifest as Manifest };
export { DefineFunction as DefineFunction };
export { DefineWorkflow as DefineWorkflow };
export { DefineType as DefineType };
export { Schema as Schema };
export { DefineDatastore as DefineDatastore };
export { SlackFunctionTester as SlackFunctionTester };
