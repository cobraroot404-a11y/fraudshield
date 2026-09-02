import { transactions } from "./fixtures.mjs"

const labels = ["Low Risk", "Medium Risk", "High Risk"]
const latest = [...transactions].sort((a, b) => b.created_at.localeCompare(a.created_at))

// Presentation-only aggregation. There is no scoring, classification, or I/O.
const monthly = () => {
  const months = new Map()
  for (const tx of transactions) {
    const key = tx.created_at.slice(0, 7)
    const row = months.get(key) ?? {
      month: new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(new Date(tx.created_at)),
      total: 0,
      flagged: 0,
    }
    row.total++
    row.flagged += Number(tx.flagged)
    months.set(key, row)
  }
  return [...months.values()]
}

export async function get(path) {
  if (typeof path !== "string" || !path.startsWith("/transactions/")) {
    throw new Error("Only local demo routes are supported")
  }
  const url = new URL(path, "https://demo.invalid")
  const parsedLimit = Number(url.searchParams.get("limit") ?? latest.length)
  const limit = Number.isInteger(parsedLimit) && parsedLimit >= 0 ? Math.min(parsedLimit, latest.length) : latest.length
  let data
  switch (url.pathname) {
    case "/transactions/dashboard/summary":
      data = {
        total_transactions: transactions.length,
        flagged_transactions: transactions.filter(tx => tx.flagged).length,
        avg_risk_score: Number((transactions.reduce((sum, tx) => sum + tx.risk_score, 0) / transactions.length).toFixed(2)),
      }
      break
    case "/transactions/stats/monthly": data = monthly(); break
    case "/transactions/stats/risk_distribution":
      data = labels.map(name => ({ name, value: transactions.filter(tx => tx.risk_label === name).length }))
      break
    case "/transactions/flagged": data = latest.filter(tx => tx.flagged).slice(0, limit); break
    case "/transactions/all": data = latest.slice(0, limit); break
    default: throw new Error(`Unsupported demo route: ${url.pathname}`)
  }
  return { data: structuredClone(data) }
}

export default { get }
