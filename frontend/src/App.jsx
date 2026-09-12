import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import AllTransactionsPage from "./pages/AllTransactionsPage"
import FlaggedPage from "./pages/FlaggedPage"

function AboutDemo() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <article className="max-w-2xl mx-auto py-16 space-y-6">
        <p className="uppercase tracking-widest text-emerald-400 text-sm">FraudShield / Public proof of concept</p>
        <h1 className="text-4xl font-bold">Explore the interface. Understand the architecture.</h1>
        <p className="text-slate-300 text-lg">This read-only demo showcases the transaction-monitoring interface using entirely synthetic records. It does not connect to a bank, database, payment gateway, or fraud model.</p>
        <p className="text-slate-300">Risk scores and outcomes are predefined examples, not predictions. No login or personal information is required. The private implementation, algorithms, and commercial features are not included.</p>
        <Link className="inline-block rounded-lg bg-emerald-500 text-slate-950 px-5 py-3 font-semibold" to="/">Explore dashboard</Link>
        <p><a className="underline text-emerald-400" href="https://github.com/cobraroot404-a11y/fraudshield">Read the system-design documentation on GitHub</a></p>
      </article>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-amber-100 text-amber-950 px-4 py-2 text-center text-sm" role="note">
        Public demo · Synthetic data only · No live fraud detection or payments
      </div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/all-transactions" element={<AllTransactionsPage />} />
        <Route path="/flagged" element={<FlaggedPage />} />
        <Route path="/about" element={<AboutDemo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
