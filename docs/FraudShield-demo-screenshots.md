# FraudShield demo screenshots

Captured November 21, 2026 for local review and approval. The images are unretouched screenshots of FraudShield running locally in Microsoft Edge 158.0.4370.33 on Windows at 1440 × 1000. The Marketplace capture used the existing `review/local-project` candidate frontend, staged tree `26327e701430dbf3d3d0c7a6e1a9741d079235e2`, with the checkout key empty.

## FraudShield Marketplace Demo — Synthetic Product Catalog

![FraudShield marketplace showing category filters and synthetic product cards](images/marketplace-demo.png)

Opened **Go to Marketplace** from `/login`. The `/marketplace` route renders the product fixtures in `frontend/src/pages/Marketplace.jsx`. Product claims, prices, ratings, review counts, and customer metrics are demo copy. **All** showed 12 product cards and **Analytics** showed two. The screenshot shows the top of the **All** view.

## Simulated pre-checkout

**FraudShield simulated pre-checkout. No hosted checkout opened and no payment was completed.**

![FraudShield Create Transaction dialog with synthetic buyer details and a Pay Now button](images/razorpay-pre-checkout-demo.png)

The **New Transaction** dialog shows a synthetic ₹499 transaction and the app’s **Pay Now** button. A browser fixture supplied a reserved documentation IP, a fictional location, and the transaction API’s `approved` response. The browser verified that the dialog renders the fixture approval exactly once. The browser intercepted the API request, so the backend and database were outside this test. The screenshot shows FraudShield’s own screen before the Razorpay handoff.

The pre-checkout image was recaptured from the production frontend build of the staged candidate plus the local display-only deletion of the duplicate status block in `frontend/src/pages/Marketplace.jsx`. An offline browser harness opened `/marketplace`, supplied the transaction and geolocation fixtures, and blocked outbound requests. The capture stopped at **Pay Now**. No Razorpay credentials were configured, no hosted checkout opened, and no payment was initiated or completed.

## Provenance and third-party notices

- The product UI and catalog come from the candidate’s local source. The new captures were made from that running build. Gautham confirmed ownership of the original first-party screenshot content in the four historical captures. The prior provenance review traced them to the same synthetic demo and identified visible Lucide and Feather icons and Recharts output. All four historical images remain in the original Git history and are excluded from this release tree.
- The visible SVG icons come from `lucide-react` 0.511.0. The accompanying notice includes the complete bundled Lucide ISC and Feather MIT terms. Visible Feather-derived icons include the plus-circle, lock, smartphone, and dialog close icon. Keep the accompanying [icon notice](FraudShield-screenshot-icon-notice.txt) with these review assets. Preserve applicable upstream notices when distributing icon source. [Feather upstream license](https://raw.githubusercontent.com/feathericons/feather/v4.29.2/LICENSE)
- The app uses shadcn/ui button, card, and dialog components, with Radix Dialog and Tailwind CSS. The existing root `THIRD_PARTY_NOTICES.md` contains the shadcn/ui and Vite MIT notices. The locked Radix Dialog 1.1.14 and Tailwind CSS 4.1.8 packages are MIT. The PNGs contain rendered pixels and ship without package source or bundles.
- The platform renders text and emoji glyphs into the PNGs. No font files are included. Microsoft’s Windows font FAQ covers graphic output and system emoji fonts. [Windows font redistribution FAQ](https://learn.microsoft.com/en-us/typography/fonts/font-faq)
- These images show FraudShield screens without Razorpay-hosted artwork or a Razorpay logo. Review any future hosted checkout capture against Razorpay’s terms and brand usage agreement before approving publication. [Razorpay terms](https://razorpay.com/terms/) · [Razorpay brand assets](https://razorpay.com/newsroom/brand-assets/)

## Historical captures retained in Git history

The paths below are recorded at public base commit `a109a54ba8521c9d3deb7ba77fc71c9eba4aa03c`. The companion notice includes Recharts 2.15.3 MIT terms for chart output in the historical dashboard, alongside the Lucide and Feather icon notices. The new gallery uses the two current captures below.

| Historical path | Git blob |
| --- | --- |
| `docs/images/about-demo.png` | `e056e8526014cb0ab1588ce20ab09d9a7c3e42b3` |
| `docs/images/dashboard-overview.png` | `41bddebff0e2bff018a23e7361ce92a888387143` |
| `docs/images/fraud-alerts.png` | `5387dbfa3bd437f7a984615c76e99f8f692bbe69` |
| `docs/images/transaction-overview.png` | `7af65222496efefc06d4a4c098baf5e12646c1be` |

## Current screenshot hashes

| File | SHA-256 |
| --- | --- |
| `images/marketplace-demo.png` | `928d4bf2f4a20c02fe2bfcc1a245d8621844006895a89fcde2a3bf0900d772cc` |
| `images/razorpay-pre-checkout-demo.png` | `a2ff181e39512e86523dbbeda222ab28af3bc2cd68b33cbc07dc48a1cf28956d` |
