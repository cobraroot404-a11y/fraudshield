// Hand-authored fictional records. Scores and outcomes are not calculated.
// These fixtures are independent of the private training data and model.
export const transactions = [
  { id: "demo-001", sender: "alex@example.com", receiver: "Demo Books", amount: 840, status: "approved", risk_score: 12, risk_label: "Low Risk", flagged: false, created_at: "2026-01-12T10:00:00Z" },
  { id: "demo-002", sender: "blair@example.com", receiver: "Demo Cafe", amount: 220, status: "review", risk_score: 63, risk_label: "Medium Risk", flagged: true, created_at: "2026-01-22T11:00:00Z" },
  { id: "demo-003", sender: "casey@example.com", receiver: "Demo Supplies", amount: 4900, status: "approved", risk_score: 18, risk_label: "Low Risk", flagged: false, created_at: "2026-02-08T12:00:00Z" },
  { id: "demo-004", sender: "drew@example.com", receiver: "Demo Studio", amount: 1750, status: "blocked", risk_score: 91, risk_label: "High Risk", flagged: true, created_at: "2026-02-19T13:00:00Z" },
  { id: "demo-005", sender: "alex@example.com", receiver: "Demo Market", amount: 610, status: "approved", risk_score: 8, risk_label: "Low Risk", flagged: false, created_at: "2026-03-03T14:00:00Z" },
  { id: "demo-006", sender: "ellis@example.com", receiver: "Demo Books", amount: 1250, status: "review", risk_score: 57, risk_label: "Medium Risk", flagged: true, created_at: "2026-03-24T15:00:00Z" },
  { id: "demo-007", sender: "blair@example.com", receiver: "Demo Cafe", amount: 430, status: "approved", risk_score: 15, risk_label: "Low Risk", flagged: false, created_at: "2026-04-05T16:00:00Z" },
  { id: "demo-008", sender: "casey@example.com", receiver: "Demo Market", amount: 2800, status: "approved", risk_score: 22, risk_label: "Low Risk", flagged: false, created_at: "2026-04-17T17:00:00Z" },
  { id: "demo-009", sender: "drew@example.com", receiver: "Demo Supplies", amount: 980, status: "blocked", risk_score: 94, risk_label: "High Risk", flagged: true, created_at: "2026-05-06T18:00:00Z" },
  { id: "demo-010", sender: "ellis@example.com", receiver: "Demo Studio", amount: 3200, status: "approved", risk_score: 11, risk_label: "Low Risk", flagged: false, created_at: "2026-05-28T19:00:00Z" },
  { id: "demo-011", sender: "alex@example.com", receiver: "Demo Cafe", amount: 360, status: "review", risk_score: 68, risk_label: "Medium Risk", flagged: true, created_at: "2026-06-11T20:00:00Z" },
  { id: "demo-012", sender: "blair@example.com", receiver: "Demo Books", amount: 720, status: "approved", risk_score: 9, risk_label: "Low Risk", flagged: false, created_at: "2026-06-26T21:00:00Z" },
].map(Object.freeze)
Object.freeze(transactions)
