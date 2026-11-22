import assert from "node:assert/strict";
import test from "node:test";
import { api } from "../src/lib/api.js";
import { isTestCheckoutKey } from "../src/lib/checkout.js";

test("sends JSON and preserves bearer authentication", async (context) => {
  context.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.headers.get("Authorization"), "Bearer fixture");
    assert.equal(options.headers.get("Content-Type"), "application/json");
    assert.equal(options.body, '{"amount":42}');
    return Response.json({ id: "fixture" });
  });
  const response = await api.post("/transactions/", { amount: 42 }, {
    headers: { Authorization: "Bearer fixture" },
  });
  assert.equal(response.data.id, "fixture");
});

test("preserves API error details", async (context) => {
  context.mock.method(globalThis, "fetch", async () => Response.json({ detail: "Invalid credentials" }, { status: 401 }));
  await assert.rejects(api.post("/auth/login", {}), (error) => (
    error.response.status === 401 && error.response.data.detail === "Invalid credentials"
  ));
});

test("returns a blob for CSV exports", async (context) => {
  context.mock.method(globalThis, "fetch", async () => new Response("amount\n42", {
    headers: { "Content-Type": "text/csv" },
  }));
  const response = await api.get("/transactions/export", { responseType: "blob" });
  assert.equal(await response.data.text(), "amount\n42");
});

test("allows only test-mode checkout keys", () => {
  assert.equal(isTestCheckoutKey("rzp_test_" + "fixture"), true);
  for (const key of [undefined, "", "rzp_test_", "rzp_live_" + "fixture"]) {
    assert.equal(isTestCheckoutKey(key), false);
  }
});
