import { WithUntypedObjectProxy } from "./with-untyped-object-proxy";
import { assertStrictEquals } from "../dev_deps";

Deno.test("WithUntypedObjectProxy", () => {
  const ctx = WithUntypedObjectProxy({});

  assertStrictEquals(`${ctx.foo}`, "{{foo}}");
  assertStrictEquals(`${ctx.foo.baz}`, "{{foo.baz}}");
  assertStrictEquals(
    `${ctx.foo.baz.biz.buzz.wut.wut.hi.bye}`,
    "{{foo.baz.biz.buzz.wut.wut.hi.bye}}",
  );
  assertStrictEquals(`Some text ${ctx.variable}`, "Some text {{variable}}");
});

Deno.test("WithUntypedObjectProxy with namespace", () => {
  const ctx = WithUntypedObjectProxy({}, "metadata");

  assertStrictEquals(`${ctx.foo}`, "{{metadata.foo}}");
  assertStrictEquals(`${ctx.foo.baz}`, "{{metadata.foo.baz}}");
  assertStrictEquals(
    `${ctx.foo.baz.biz.buzz.wut.wut.hi.bye}`,
    "{{metadata.foo.baz.biz.buzz.wut.wut.hi.bye}}",
  );
  assertStrictEquals(
    `Some text ${ctx.variable}`,
    "Some text {{metadata.variable}}",
  );
});
