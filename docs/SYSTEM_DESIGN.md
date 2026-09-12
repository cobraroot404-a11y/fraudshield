# System design

## 1. Goals and non-goals

The public project makes the interface and architectural boundaries inspectable
without exposing the implementation responsible for commercial decisions.
Its goals are reproducible local setup, internally consistent synthetic
statistics, reusable presentation components, and clear disclosure of demo
behavior.

It does not aim to process money, validate identity, classify fraud, expose
private service endpoints, or reproduce the private dataset.

## 2. Component responsibilities

| Component | Responsibility | Deliberate boundary |
| --- | --- | --- |
| App/router | Navigation and persistent demo disclosure | No authentication |
| Dashboard | Summary cards and charts | No decision rules |
| Transaction screens | Display history and flagged samples | Read-only |
| UI components | Reusable styling and chart/table primitives | No data ownership |
| Demo adapter | Route dispatch, grouping, and copied responses | No HTTP or persistence |
| Fixtures | Fixed, fictional display records | No private dataset or model |

## 3. Read-side data flow

1. A page mounts and requests a named read route from the local adapter.
2. The adapter selects fixtures or calculates presentation aggregates.
3. It returns a new response object in the documented `{ data }` shape.
4. React updates the relevant cards, chart, or table.
5. Navigation changes the view; it does not create or modify transactions.

The dashboard refresh interval re-reads static fixtures. It is not a live event
stream. An actual streaming design would need authentication, reconnection,
ordering, deduplication, and server-side delivery semantics.

## 4. Data model and consistency

Each synthetic transaction has an ID, fictional sender and receiver, amount,
display status, display risk score and category, flag, and UTC creation time.
Monetary values are displayed as INR in the retained interface.

All summary and chart counts derive from the same set of records. Fixtures are
frozen, responses are copied, and timestamps are grouped in UTC. This prevents
consumer mutation and timezone-dependent monthly labels.

The adapter groups by the explicitly assigned risk category. It never infers
the category from a numeric threshold. Likewise, status is never decided from
the score or amount. These are presentation examples, not a simplified release
of the proprietary classifier.

The public numbers are ordinary display values, not an accounting ledger.
Production financial processing needs an explicit currency/precision model,
validated state transitions, durable audit history, and reconciliation.

## 5. Private application boundary

The broader implementation separates frontend presentation, backend application
logic, and MongoDB persistence. Its backend contains additional identity,
transaction-processing, inference, receipt-processing, and reporting concerns.
The current inference code is embedded in the application process.

The public edition neither calls those components nor includes their source,
model artifacts, training data, payment identifiers, or private configuration.
Replacing the demo adapter with a real API client must be an intentional private
integration, not a public configuration toggle.

## 6. Cloud deployment considerations

For the public edition, the deployment unit is the static frontend bundle.
History-based client routing requires a host that rewrites application routes
to `index.html`. Static hosting is not configured or provisioned here.

A future full-system deployment could use separate frontend delivery,
application compute, and managed database services. Before increasing replicas,
the application would need review of process-local caches, model-loading cost,
database connections, concurrency, and retry semantics.

Operational design would also cover TLS, restricted cross-origin access,
least-privilege identity, managed secrets, backups, logs without sensitive data,
metrics, alerts, rate limits, and recovery procedures. These are requirements
for future work, not implemented capabilities claimed by the demo.

## 7. Trade-offs

- **Fixtures instead of a hosted demo API:** deterministic setup, no credentials,
  and no private service exposure; it does not test network failure behavior.
- **Independent Git history:** prevents inherited private commits; updates must
  be manually reviewed and transferred by an explicit file allowlist.
- **Read-only public scope:** makes portfolio review safe and focused; it omits
  the richer operational workflows of the private application.
- **Retained visual components:** keeps the public interface recognizable while
  separating data access; additional accessibility/browser QA remains useful.
- **No deployment automation:** avoids assuming hosting permissions or spend;
  CI only tests and builds the public edition.

## 8. Verification and release discipline

The adapter tests check summary totals, category/month totals, response copying,
ordering, limits, and route rejection. A production build checks module and
asset compilation. Passing these checks is not evidence of fraud-model
accuracy, application security, or a full browser/accessibility audit.

Before every public push, review tracked files and Git history for forbidden
implementation files and secrets. Ignore rules are useful but do not remove
already-tracked files or guarantee a secret-free commit. Do not add the private
repository as a push target or merge its branches into this history.
