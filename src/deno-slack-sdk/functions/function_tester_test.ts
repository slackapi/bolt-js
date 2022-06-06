import { assertEquals } from "../dev_deps";
import { SlackFunctionTester } from "./function_tester";

Deno.test("SlackFunctionTester.createContext", () => {
  const callbackId = "my_callback_id";
  const { createContext } = SlackFunctionTester(callbackId);

  const inputs = {
    myValue: "some value",
  };
  const ctx = createContext({
    inputs,
  });

  assertEquals(ctx.inputs, inputs);
  assertEquals(ctx.env, {});
  assertEquals(typeof ctx.token, "string");
  assertEquals(ctx.event.type, "function_executed");
  assertEquals(ctx.event.function.callback_id, callbackId);
});

Deno.test("SlackFunctionTester.createContext with empty inputs", () => {
  const callbackId = "my_callback_id";
  const { createContext } = SlackFunctionTester(callbackId);

  const ctx = createContext({ inputs: {} });

  assertEquals(ctx.inputs, {});
  assertEquals(ctx.env, {});
  assertEquals(typeof ctx.token, "string");
  assertEquals(ctx.event.type, "function_executed");
  assertEquals(ctx.event.function.callback_id, callbackId);
});
