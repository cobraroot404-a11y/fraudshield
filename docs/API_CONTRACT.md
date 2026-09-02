# Public demo data contract

These paths are handled by `frontend/src/demo/api.mjs` inside the browser.
They are not deployed HTTP endpoints and are not a promise of private API
compatibility. Calls resolve to `{ data: ... }`; unsupported routes reject.

| Local read route | Data |
| --- | --- |
| `/transactions/dashboard/summary` | Total count, flagged count, average sample score |
| `/transactions/stats/monthly` | Month label, total count, flagged count |
| `/transactions/stats/risk_distribution` | Category name and count |
| `/transactions/all` | Synthetic records, newest first |
| `/transactions/flagged` | Flagged synthetic records, newest first |

The last two routes accept `?limit=N`. A nonnegative integer is capped at the
fixture count. Invalid values fall back to the fixture count; zero returns an
empty list.

Example transaction shape:

```json
{
  "id": "demo-001",
  "sender": "alex@example.com",
  "receiver": "Demo Books",
  "amount": 840,
  "status": "approved",
  "risk_score": 12,
  "risk_label": "Low Risk",
  "flagged": false,
  "created_at": "2026-01-12T10:00:00Z"
}
```

`risk_score`, `risk_label`, `status`, and `flagged` are fictional fixture values.
They are not calculated from transaction characteristics. The contract contains
no training features, thresholds, model confidence claims, payment tokens,
credentials, or mutation operations.
