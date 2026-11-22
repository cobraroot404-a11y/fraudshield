# Fraudshield - Intelligent Banking Platform

**Completed and University-Presented Final-Year Master's Engineering Project**

**Project Owner and Developer: Gautham**

## 1. Project Overview

FraudShield integrates financial transaction submission, explainable fraud-risk scoring, graph-based anomaly analysis, and operational review in a full-stack application. An analyst can submit a synthetic transaction, inspect its initial classification, investigate flagged records, record a review decision, and export transaction data. A fixture-backed fintech marketplace provides a second entry point for transaction initiation and an optional Razorpay test-mode demonstration. The project was completed, demonstrated, and presented at university.

## 2. Project Abstract

Transaction monitoring requires a way to interpret individual risk indicators, examine relationships across records, and preserve the resulting assessments for operational review. FraudShield addresses these requirements through a React frontend, a FastAPI service layer, a MongoDB database, and Python analytics. The create endpoint validates incoming transaction data and uses historical transactions to build a relationship graph. Node2Vec represents graph nodes numerically, and Isolation Forest identifies anomalous nodes. A deterministic rules engine evaluates individual transaction attributes and assigns the initial operational status. Both outputs are persisted alongside the transaction. The standalone ML runner compares DBSCAN and Isolation Forest on the same graph embeddings. A separately configured Random Forest API offers supervised advisory scoring. Protected endpoints expose transaction histories, a flagged queue, review actions, aggregate statistics, and CSV export. The marketplace demonstrates how a browser Checkout handoff can coexist with an application-level risk workflow. Synthetic scenarios and automated tests provide functional evidence for the completed engineering project.

## 3. Problem Statement

Individual records can reveal unusual amounts or unexpected locations. Repeated use of a device or network address across senders introduces relationships that are harder to see from a transaction table. Reviewers need a record of the original assessment, a queue that surfaces flagged cases, and a way to persist decisions and aggregate results. The engineering problem is to connect these requirements across the user interface, service and permissions layer, analytics, database, and reporting.

## 4. Project Aim and Objectives

The aim was to build and demonstrate an integrated transaction monitoring and fraud assessment application.

- Implement authenticated registration, login, and role-aware API operations.
- Produce interpretable operational statuses from explicit rules and record a separate graph anomaly signal.
- Persist transaction inputs and assessment outputs for review, dashboards, and reporting.
- Support analyst decisions and administrative account management.
- Demonstrate synthetic marketplace transactions and a test-mode payment handoff.
- Verify selected workflows with automated tests, browser checks, and a frontend production build.

## 5. Implemented System Features

| Feature | Application behavior |
| --- | --- |
| Accounts | Analyst self-registration, bcrypt password verification, expiring bearer tokens, and administrator-managed users |
| Transaction processing | Validates inputs, timestamps transactions, runs graph analysis and rules, and returns the saved record |
| Monitoring | Transaction history, flagged records, dashboard summaries, risk distribution, and monthly aggregates |
| Review and export | Authorized status changes, administrator manual decisions, and CSV export |
| Marketplace | Synthetic catalog, product filters, manual transaction form, and optional test-mode Checkout |
| Optional analyses | Advisory Random Forest scoring and receipt OCR when configured |

## 6. Technology Stack

| Layer | Technologies and responsibilities |
| --- | --- |
| Web application | React renders forms and views. React Router connects pages. Vite serves and builds the frontend. |
| Interface | Tailwind CSS styles pages. shadcn/ui and Radix UI provide components and primitives. Lucide supplies icons and Recharts renders analytics. |
| HTTP API | Python and FastAPI implement routes and dependencies. Pydantic validates data and defines response models. Uvicorn serves the API. |
| Persistence | PyMongo connects the API to MongoDB for user records, transaction records, and aggregation queries. |
| Fraud analysis | pandas prepares records. NetworkX builds the graph. Node2Vec produces embeddings for Isolation Forest in the transaction pipeline and DBSCAN in the standalone experiment. A separate Random Forest classifier provides optional advisory scoring. |
| Identity | Passlib and bcrypt handle password hashing. PyJWT handles HS256 bearer tokens. |
| Checkout | Razorpay Checkout browser SDK opens the test payment interface when configured. |
| Verification | Python unittest, Node.js tests, offline browser scenarios, and a Vite production build. |

## 7. System Architecture

```mermaid
flowchart LR
    UI["React application"] -->|"HTTP requests and bearer token"| API["FastAPI"]
    API --> AUTH["Account and authorization routes"]
    API --> TX["Transaction and analytics routes"]
    AUTH --> DB[("MongoDB")]
    TX -->|"History, writes and queries"| DB
    TX -->|"History and proposed transaction"| GRAPH["NetworkX, Node2Vec and Isolation Forest"]
    TX -->|"Transaction attributes"| RULES["Deterministic scoring"]
    GRAPH -->|"Sender anomaly indicator"| TX
    RULES -->|"Risk score and initial status"| TX
    UI -->|"Optional test-mode handoff"| PAY["Razorpay Checkout"]
```

The API owns authorization and persistence. The browser renders the returned records and aggregated data. Core transaction creation calls the graph and rules components in process. Optional Random Forest and OCR routes are mounted separately when their configuration is present.

## 8. End-to-End Transaction Processing Workflow

```mermaid
flowchart TD
    REGISTER["Register analyst account"] --> HASH["Store bcrypt password hash"]
    HASH --> LOGIN["Verify credentials and issue JWT"]
    LOGIN --> SUBMIT["Submit transaction with bearer token"]
    SUBMIT --> VALIDATE["Check token, role and request schema"]
    VALIDATE --> HISTORY["Load cached or historical transaction inputs"]
    HISTORY --> GRAPH["Add candidate and construct relationship graph"]
    GRAPH --> EMBED["Generate Node2Vec embeddings"]
    EMBED --> FOREST["Evaluate node anomalies with Isolation Forest"]
    FOREST --> RULES["Compute rule score and initial status"]
    RULES --> SAVE["Persist the transaction and assessment"]
    SAVE --> RETURN["Return stored record to the interface"]
    RETURN --> MONITOR["Monitor flagged records and review status"]
    SAVE --> REPORT["Query dashboard statistics and export CSV"]
    RETURN -->|"Approved manual marketplace result"| CHECKOUT["Offer optional test-mode Checkout"]
```

An authenticated analyst or administrator submits an amount, sender, receiver, and applicable context such as location, IP, and device. The transaction route adds a UTC creation timestamp. On the first create request in a process, it loads a projection of historical records into a pandas cache. A lock serializes work against the cache. The route appends the candidate to the analysis input, builds the graph, and records whether the candidate sender appears in the anomaly results.

The rules run after graph analysis and set the initial status. The candidate enters the in-process cache after a successful MongoDB insert, and the API returns the transaction ID and assessment. The frontend can use the returned status immediately. Persisted records support later review, dashboard queries, and CSV exports. The Marketplace has a separate product Checkout flow described in section 15.

## 9. ML Integration and Fraud Detection Methodology

### Deterministic scoring

Let $A$, $L$, and $I$ be binary indicators for the conditions below. The operational risk score is $S = 50A + 25L + 15I$. A transaction is initially flagged for $S \ge 50$ and initially approved for $S < 50$.

| Indicator | Condition | Points | Stored reason |
| --- | --- | ---: | --- |
| $A$ | Amount strictly above 10,000 | 50 | High amount |
| $L$ | Location outside the configured set of India, US, and UK | 25 | Unusual location |
| $I$ | Provided IP string lacks the configured `192.` prefix | 15 | Suspicious IP |

**Synthetic calculation.** An amount of 12,000 with an unusual location and an IP string that satisfies the configured prefix yields $50 + 25 + 0 = 75$. The stored reasons include high amount and unusual location, and the initial status is flagged. The prefix check is a demonstration heuristic.

### Primary transaction pipeline — Node2Vec and Isolation Forest

1. **Build the graph.** The create route combines cached transaction history with the candidate transaction. An undirected NetworkX graph connects senders to device IDs and IP addresses when present. The builder also supports optional product nodes from historical data. Shared devices and IPs can connect otherwise separate senders.
2. **Learn node embeddings with Node2Vec.** The backend builds one 64-dimensional vector per graph node from random walks. The implementation requests 100 walks per node, a walk length of 10, and a context window of 5. The embeddings represent nodes in the context of their graph neighborhoods.
3. **Detect outliers with Isolation Forest.** The backend fits an unsupervised scikit-learn Isolation Forest on those vectors during transaction creation. The configured contamination of `0.05` sets an outlier cutoff over the fitted embeddings. The route checks whether the candidate sender received the outlier label `-1`.
4. **Store the anomaly signal alongside the rule decision.** The sender result populates `ml_flagged` and `ml_reason`. The deterministic rules set the initial `risk_score`, `flagged`, and `status`. The flagged review queue queries the rule-derived `flagged` field. The detector computes decision scores internally, and the create route discards them.

### Standalone experiment — DBSCAN

The standalone ML runner applies Isolation Forest and DBSCAN to the same Node2Vec embeddings from a CSV-built graph. DBSCAN groups nearby vectors by density using `eps=0.5` and `min_samples=5`. The runner treats the noise label `-1` as an anomaly candidate and writes separate node lists to `anomalies_iforest.txt` and `anomalies_dbscan.txt`. CSV preprocessing derives sessions from gaps greater than 30 minutes per sender. The runner prints session summaries and supplies the Node2Vec vectors to both detectors. DBSCAN is exercised through the standalone workflow.

### Optional advisory API — Random Forest

Set `FRAUDSHIELD_FOREST_DATASET` at API startup to enable `POST /ml/random-forest/score` for analysts and administrators. The supervised classifier trains on first use and caches the fitted model in memory. Its local CSV accepts up to 10,000 rows with both binary `flagged` classes. The model uses amount, one-hot encoded currency and product name, and hour and weekday derived in UTC. It uses 100 trees with a maximum depth of 10. The endpoint returns its predicted `flagged` label and positive-class `probability` as advisory output. Transaction creation, persistence, and review decisions run independently of this endpoint.

### Evaluation scope

Synthetic fixtures exercise the workflows and let reviewers inspect model outputs. The Isolation Forest contamination setting, DBSCAN noise counts, and Random Forest probabilities describe model configuration or outputs. Estimating precision, recall, and false-positive rates requires held-out representative labeled data.

## 10. MongoDB Database Integration

| Collection | Stored data | Use |
| --- | --- | --- |
| `users` | Email, bcrypt hash, and role | Registration, login, and administrator account management |
| `transactions` | Inputs, UTC creation timestamp, operational status and flag, rule score and reasons, graph anomaly fields | Monitoring, review updates, aggregation, and export |

The API uses MongoDB object IDs internally and exposes transaction IDs as strings. It sorts listings and the flagged queue by descending creation time. Dashboard queries combine document counts with aggregations for monthly totals, average rule score, and sender counts. A CSV export reads transaction records and converts object IDs into serializable IDs. The historical analysis cache is process-local and transaction creation performs the graph computation synchronously.

## 11. Authentication and Authorization

Public registration assigns the analyst role. The service hashes the password with bcrypt and returns an account response without the hash. Login verifies the password and issues an HS256 JWT with an expiry, a subject, and a role. Protected routes validate the bearer token and enforce their allowed roles.

| Role | Relevant privileges |
| --- | --- |
| Viewer | Transaction detail and history, summary and general analytics, and CSV export |
| Analyst | Viewer operations plus transaction creation, flagged review, status updates, top-sender statistics, and configured advisory endpoints |
| Administrator | Analyst operations plus manual approval or blocking and user administration |
| Auditor | Access to the designated auditor-or-admin authentication route |

Use a locally generated signing secret and disposable accounts for demonstrations. Public analyst enrollment and the shared dataset shape the local deployment boundary. Provision the administrator separately through trusted local administration.

## 12. Dashboard Analytics and Fraud Monitoring

Dashboard summary queries return total transactions, flagged transactions, and average rule risk score. Monthly analytics group records by year and month to count total and flagged records. Risk distribution uses three score buckets spanning 0–40, 41–70, and 71–100. Top-sender statistics group transaction counts by sender and sort them in descending order. Recharts visualizes dashboard analytics. A flagged queue and transaction history support record navigation, and the CSV endpoint provides a transaction export for offline review.

## 13. Transaction Review and Administrative Operations

The flagged queue uses the persisted `flagged` Boolean. The analyst and administrator status endpoint sets `approved`, `blocked`, or `false_positive` by updating `status`. An update through this endpoint can leave a record in the flagged queue. The administrator-only manual decision route maps `approve` or `block` to a stored status and also clears the flag. Account administration supports listing users, creating accounts with an assigned role, changing roles, and deleting users.

## 14. FraudShield Marketplace

The marketplace displays a synthetic fintech product catalog that users can browse or filter. Its manual **New Transaction** form gathers buyer details, amount, and location, obtains IP context, and submits the transaction with the current bearer token. An approved response makes **Pay Now** available. A flagged response displays a review message. Product selection opens a separate buyer-details and Checkout flow. Catalog listings and their promotional figures are demonstration fixtures.

## 15. Razorpay Payment Gateway Integration

The frontend reads `VITE_RAZORPAY_KEY_ID` and requires a test-mode key ID format and a loaded Razorpay SDK. Both paths set the currency to INR, convert rupees to paise by multiplying by 100, and prefill buyer name, email, and contact details where provided.

| Path | Before Checkout | Browser success handler |
| --- | --- | --- |
| Manual transaction | Submits to FraudShield first. An approved response exposes **Pay Now**. | Displays the returned payment ID in the browser. |
| Product selection | Opens Checkout after product and buyer details are selected and the SDK guard passes. | Submits a transaction using the selected product amount and buyer and device context. |

The product path performs the FraudShield submission in the client callback. The server does not bind the transaction to a Razorpay order or verify a payment signature. The captured pre-checkout state demonstrates the manual form's approval and payment entry point. Hosted payment confirmation and settlement are outside that screenshot's scope.

## 16. Optional System Components

- **Advisory Random Forest.** A configured local CSV enables the advisory scoring endpoint for analysts and administrators. See section 9 for its training data, features, and outputs.
- **Receipt OCR.** A separately configured worker accepts an authorized PNG or JPEG upload and can return merchant and amount fields. An optional marketplace control can suggest the extracted amount for the user to review.
- **Standalone graph experiments.** From the ML workspace, run `python main.py example_transactions.csv` after installing its dependencies to compare the detectors on the bundled synthetic data.

See the [optional components setup](docs/OPTIONAL_COMPONENTS.md) and [ML workspace](ML/README.md).

## 17. Application Interface and Screenshots

### Dashboard overview

The historical dashboard shows transaction summaries and risk charts using synthetic data.

![FraudShield dashboard with transaction summaries and risk charts](docs/images/dashboard-overview.png)

### Fraud alerts

The historical flagged queue displays records for fraud review.

![FraudShield flagged transaction queue](docs/images/fraud-alerts.png)

### Transaction overview

The historical transaction list shows synthetic records and operational statuses.

![FraudShield transaction history with operational statuses](docs/images/transaction-overview.png)

### Marketplace demo

The marketplace shows the synthetic fintech product catalog.

![FraudShield Marketplace synthetic product catalog](docs/images/marketplace-demo.png)

### Simulated Razorpay pre-checkout

The manual form shows an approved synthetic transaction and the **Pay Now** entry point. No hosted checkout opened and no payment was completed in this capture.

![FraudShield manual transaction approval and Pay Now entry point](docs/images/razorpay-pre-checkout-demo.png)

### Recorded demo screenshots

These frames show the local prototype with demo records and Razorpay test-mode payments. Contact details in account and transaction views are masked. The payment success screen shows the sandbox browser result.

#### Project introduction

![Project introduction](docs/images/video-demo-project-introduction.jpg)

*0:02 in the demo recording.*

#### Admin dashboard

![Admin dashboard](docs/images/video-demo-admin-dashboard.jpg)

*0:06 in the demo recording.*

#### Admin flagged transactions

![Admin flagged transactions](docs/images/video-demo-admin-flagged-transactions.jpg)

*0:10 in the demo recording.*

#### User management

![User management](docs/images/video-demo-user-management.jpg)

*0:12 in the demo recording.*

#### User role selection

![User role selection](docs/images/video-demo-role-selection.jpg)

*0:19 in the demo recording.*

#### Analyst dashboard

![Analyst dashboard](docs/images/video-demo-analyst-dashboard.jpg)

*0:25 in the demo recording.*

#### Analyst dashboard transaction table

![Analyst dashboard transaction table](docs/images/video-demo-analyst-transaction-table.jpg)

*0:30 in the demo recording.*

#### High-risk transaction intake

![High-risk transaction intake](docs/images/video-demo-high-risk-intake.jpg)

*0:33 in the demo recording.*

#### Razorpay test checkout payment options

![Razorpay test checkout payment options](docs/images/video-demo-checkout-payment-options.jpg)

*0:38 in the demo recording.*

#### Razorpay test checkout UPI entry

![Razorpay test checkout UPI entry](docs/images/video-demo-checkout-upi-entry.jpg)

*0:46 in the demo recording.*

#### Sandbox UPI confirmation prompt

![Sandbox UPI confirmation prompt](docs/images/video-demo-checkout-upi-prompt.jpg)

*0:48 in the demo recording.*

#### Sandbox payment confirmation in progress

![Sandbox payment confirmation in progress](docs/images/video-demo-checkout-confirming.jpg)

*0:51 in the demo recording.*

#### Sandbox payment success

![Sandbox payment success](docs/images/video-demo-checkout-success.jpg)

*0:55 in the demo recording.*

#### Analyst review controls

![Analyst review controls](docs/images/video-demo-analyst-review.jpg)

*0:57 in the demo recording.*

#### Flagged transaction review queue

![Flagged transaction review queue](docs/images/video-demo-flagged-review-queue.jpg)

*1:00 in the demo recording.*

#### Admin review before approval

![Admin review before approval](docs/images/video-demo-admin-before-approval.jpg)

*1:03 in the demo recording.*

#### Admin review after approval

![Admin review after approval](docs/images/video-demo-admin-after-approval.jpg)

*1:09 in the demo recording.*

#### Review queue after approval

![Review queue after approval](docs/images/video-demo-queue-after-approval.jpg)

*1:12 in the demo recording.*

#### Viewer dashboard in dark mode

![Viewer dashboard in dark mode](docs/images/video-demo-viewer-dark.jpg)

*1:17 in the demo recording.*

#### Viewer system status and quick actions

![Viewer system status and quick actions](docs/images/video-demo-viewer-system-status.jpg)

*1:21 in the demo recording.*

#### Viewer dashboard in light mode

![Viewer dashboard in light mode](docs/images/video-demo-viewer-light.jpg)

*1:27 in the demo recording.*

#### Project summary

![Project summary](docs/images/video-demo-project-summary.jpg)

*1:31 in the demo recording.*

See the [screenshot provenance and capture hashes](docs/FraudShield-demo-screenshots.md).

## 18. API Architecture

FastAPI organizes JSON endpoints by domain. Authenticated routes accept a bearer token. Transaction exports return CSV and receipt scans use multipart input.

| Method and path | Access | Purpose |
| --- | --- | --- |
| `POST /auth/register` | Public | Register an analyst |
| `POST /auth/login` | Public | Verify credentials and issue an access token |
| `GET /auth/users`, `POST /auth/users` | Admin | List or create users |
| `PATCH /auth/users/{id}/role`, `DELETE /auth/users/{id}` | Admin | Change a role or remove a user |
| `GET /auth/admin-only` | Admin | Check access to the admin route |
| `GET /auth/auditor-or-admin` | Auditor, admin | Check access to the auditor-or-admin route |
| `POST /transactions/` | Analyst, admin | Evaluate and persist a transaction |
| `GET /transactions/all`, `GET /transactions/{id}` | Viewer, analyst, admin | List or retrieve transactions |
| `GET /transactions/flagged` | Analyst, admin | List flagged records |
| `PATCH /transactions/{id}/status` | Analyst, admin | Set the operational status |
| `POST /transactions/manual-approval` | Admin | Approve or block using a transaction ID and decision |
| `GET /transactions/dashboard/summary` | Viewer, analyst, admin | Retrieve totals and average risk score |
| `GET /transactions/stats/monthly`, `GET /transactions/stats/risk_distribution` | Viewer, analyst, admin | Retrieve time series and rule-score buckets |
| `GET /transactions/stats/top_senders` | Analyst, admin | Retrieve sender counts |
| `GET /transactions/export` | Viewer, analyst, admin | Download the transaction CSV |
| `POST /ml/random-forest/score` | Analyst, admin, when configured | Return advisory classification and probability |
| `POST /ocr/scan` | Analyst, admin, when configured | Extract receipt merchant and amount |

The interactive OpenAPI reference is available at `http://localhost:8000/docs` when the backend is running.

## 19. Installation and Local Setup

Use Python 3.12, Node.js 22 with npm, and a running local MongoDB instance. Use synthetic data and keep the development services on localhost. The commands use PowerShell.

```powershell
git clone https://github.com/cobraroot404-a11y/fraudshield.git
cd fraudshield/backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements_updated.txt
Copy-Item .env.example .env
.\.venv\Scripts\python -c "import secrets; print(secrets.token_urlsafe(32))"
```

In `backend/.env`, set `SECRET_KEY` to the generated value and use the local MongoDB URI and token lifetime from [the backend environment example](backend/.env.example). Keep the secret outside version control. Start the API from `backend`.

```powershell
.\.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

In a second terminal, from the repository root:

```powershell
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open `http://localhost:5173/login`. The [frontend environment example](frontend/.env.example) leaves Checkout disabled. For a separate test-mode session, place your own Razorpay test key ID in the local frontend environment before starting Vite.

## 20. Demonstration Workflow

1. Register and sign in with a disposable analyst account. Open the transaction history and flagged queue.
2. Open the marketplace and use **New Transaction** with synthetic buyer details and an amount above 10,000 to exercise the flagged path. Inspect the returned record and find it in the queue.
3. Use an authorized role to record a status update and observe the persisted decision. Compare transaction totals and risk distribution, then download the CSV export.
4. Exercise the approved manual path with synthetic context and applicable rule inputs. The approval view offers **Pay Now**. With a blank Checkout key, the browser guards the SDK path.
5. Browse the catalog and compare the independent product flow with the manual submission. Use a separately configured test-mode session if demonstrating the hosted handoff.

## 21. Testing and Verification

| Recorded local Windows release check | Result | Coverage |
| --- | --- | --- |
| Backend unittest suite | 16 passed | JWT validation, manual review persistence with a mocked collection, advisory Random Forest, and OCR input and worker behavior |
| Frontend test suite | 4 passed | API request and response behavior and the Checkout test-key guard |
| Offline browser checks | 4 passed | Synthetic approved, flagged, and blocked manual outcomes and disabled product Checkout |
| Frontend production build | Passed | Vite compiled the production bundle and reported a bundle-size warning |
| University presentation | Completed | The project owner confirmed the completed project was demonstrated and presented at university |

From `backend`, with its dependencies installed:

```powershell
.\.venv\Scripts\python -m unittest discover -s tests -v
```

From `frontend`, after `npm ci`:

```powershell
npm test
npm run build
```

Browser checks used synthetic fixtures. These results describe functional behavior and build validation. Independent hosted Razorpay verification and broader production testing were outside the recorded checks.

## 22. Engineering Contributions and Technical Outcomes

The project connects graph analytics and explainable rules to a working authenticated transaction pipeline. It persists both outputs in the same operational record and uses explicit status and flag fields to link the original assessment with review. The dashboard and CSV views make those records accessible across operational and reporting tasks. The marketplace demonstrates how application-level fraud assessment interacts with browser-managed Checkout paths. Optional components show how advisory scoring and OCR can be configured independently of core transaction creation.

## 23. Project Scope and Future Engineering Extensions

The completed project demonstrates integrated workflows with synthetic records. A shared deployment could add controlled enrollment, per-user or tenant-level data boundaries, stronger validation of client-supplied risk context, and auditable review events. Workload testing and representative labeled evaluation would quantify scoring latency and model performance. A production payments extension would need server-side order creation and signature verification, idempotent updates, and settlement reconciliation. Moving graph recomputation out of the request path is a separate scalability extension.

## 24. Supporting Documentation

- [Security guidance](SECURITY.md)
- [Optional Random Forest and receipt OCR setup](docs/OPTIONAL_COMPONENTS.md)
- [Standalone ML workspace](ML/README.md)
- [Screenshot provenance, capture hashes, and notices](docs/FraudShield-demo-screenshots.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)
- [Screenshot icon notice](docs/FraudShield-screenshot-icon-notice.txt)
- [Proprietary Source-Visible License](LICENSE)

## 25. Project Ownership and Licensing

**Project Owner and Developer: Gautham**

**Copyright (c) 2026 Gautham. All rights reserved.**

FraudShield is source-visible and proprietary under the [Proprietary Source-Visible License](LICENSE). Third-party components retain their own terms. See the [third-party notices](THIRD_PARTY_NOTICES.md) and [screenshot icon notice](docs/FraudShield-screenshot-icon-notice.txt).

## 26. Conclusion

FraudShield was completed and presented at university as a final-year master's engineering project. It demonstrates the full path from authenticated transaction submission through explainable scoring, graph anomaly analysis, persistent review, and reporting. Its integrated interface and synthetic marketplace make those engineering workflows demonstrable within a single application.
