import test from "node:test"
import assert from "node:assert/strict"
import { get } from "../src/demo/api.mjs"
import { transactions } from "../src/demo/fixtures.mjs"

test("summary matches the synthetic fixtures", async () => {
  const { data } = await get("/transactions/dashboard/summary")
  assert.equal(data.total_transactions, 12)
  assert.equal(data.flagged_transactions, 5)
  assert.equal(data.avg_risk_score, 39)
})
test("flagged list is read-only, newest first, and respects limits", async () => {
  const { data } = await get("/transactions/flagged?limit=2")
  assert.equal(data.length, 2)
  assert.ok(data.every(tx => tx.flagged))
  assert.ok(data[0].created_at >= data[1].created_at)
  data[0].sender = "changed@example.com"
  assert.notEqual((await get("/transactions/flagged?limit=2")).data[0].sender, data[0].sender)
})
test("monthly totals and risk categories reconcile", async () => {
  const monthly = (await get("/transactions/stats/monthly")).data
  const risk = (await get("/transactions/stats/risk_distribution")).data
  assert.equal(monthly.reduce((n, row) => n + row.total, 0), transactions.length)
  assert.equal(monthly.reduce((n, row) => n + row.flagged, 0), 5)
  assert.equal(risk.reduce((n, row) => n + row.value, 0), transactions.length)
})
test("limits cannot bypass the fixture set", async () => {
  assert.equal((await get("/transactions/all?limit=0")).data.length, 0)
  assert.equal((await get("/transactions/all?limit=999999")).data.length, 12)
  assert.equal((await get("/transactions/all?limit=invalid")).data.length, 12)
})
test("external URLs and unsupported actions are rejected", async () => {
  await assert.rejects(get("https://example.com/transactions/all"))
  await assert.rejects(get("/transactions/create"))
  await assert.rejects(get("/auth/login"))
})
test("fixtures have unique IDs and only reserved example email addresses", () => {
  assert.equal(new Set(transactions.map(tx => tx.id)).size, transactions.length)
  assert.ok(transactions.every(tx => tx.sender.endsWith("@example.com")))
  assert.ok(transactions.every(tx => Object.isFrozen(tx)))
})
