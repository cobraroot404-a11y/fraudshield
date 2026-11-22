"use client"

import { useEffect, useState } from "react"
import { useNavigate, NavLink } from "react-router-dom"
import { api } from "@/lib/api";
import { ShieldCheck, FileText, LayoutDashboard, User, PieChart, BarChart3, TrendingUp } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Pie, Cell, PieChart as RechartsPieChart, BarChart, Bar, CartesianGrid, Legend } from "recharts"

const AnalystDashboard = () => {
  const theme = "dark"
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState("")
  const [trendData, setTrendData] = useState([])
  const [riskData, setRiskData] = useState([])
  const [topSenders, setTopSenders] = useState([])
  const navigate = useNavigate()

  // Fetch data
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return navigate("/login")

    setLoading(true)
    Promise.all([
      api.get("http://localhost:8000/transactions/flagged", { headers: { Authorization: `Bearer ${token}` } }),
      api.get("http://localhost:8000/transactions/stats/monthly", { headers: { Authorization: `Bearer ${token}` } }),
      api.get("http://localhost:8000/transactions/stats/risk_distribution", { headers: { Authorization: `Bearer ${token}` } }),
      api.get("http://localhost:8000/transactions/stats/top_senders", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([flagged, trends, risks, topSendersRes]) => {
        setTransactions(flagged.data)
        setTrendData(trends.data)
        // add colors for pie chart
        const colorMap = {
          "Low Risk": "#10b981",
          "Medium Risk": "#f59e0b",
          "High Risk": "#ef4444"
        }
        setRiskData(
          risks.data.map(d => ({
            ...d,
            color: colorMap[d.name] || "#8884d8"
          }))
        )
        setTopSenders(topSendersRes.data)
      })
      .catch(() => setError("Could not load data"))
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    async function fetchAll() {
      const token = localStorage.getItem("token")
      // ...other code...
      const riskRes = await api.get("http://localhost:8000/transactions/stats/risk_distribution", {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log("riskRes.data", riskRes.data); // <-- ADD THIS
      setRiskData(riskRes.data)
    }
    fetchAll()
  }, [])

  // update transaction status
  const updateStatus = async (id, status) => {
    setActionLoading(id)
    setError("")
    try {
      const token = localStorage.getItem("token")
      await api.patch(
        `http://localhost:8000/transactions/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      )
    } catch (err) {
      setError("Failed to update status")
    }
    setActionLoading(null)
  }

  const totalFlagged = transactions.length
  const totalPending = transactions.filter(t => t.status === "pending").length
  const totalReviewed = transactions.filter(t => t.status !== "pending").length

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Analyst Panel</h1>
              <p className="text-emerald-400 text-xs">Transaction Review</p>
            </div>
          </div>
          <nav className="space-y-2">
            <NavLink to="/analyst" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-emerald-300 bg-slate-800/60">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </NavLink>
            <NavLink to="/flagged" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-emerald-300">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Flagged Transactions</span>
            </NavLink>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Analyst User</p>
              <p className="text-xs text-slate-400">ANALYST</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Analyst Dashboard
              </h2>
              <p className="text-sm text-slate-400">
                Review & update flagged transactions and see analytics
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-sm">Total Flagged</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalFlagged}</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-sm">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalPending}</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-sm">Reviewed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalReviewed}</div>
                </CardContent>
              </Card>
            </div>

            {/* --- Analytics Section --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Transaction Trends */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                    Transaction Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[210px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="flaggedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="total" stroke="#10b981" fill="url(#totalGradient)" strokeWidth={2} />
                        <Area type="monotone" dataKey="flagged" stroke="#ef4444" fill="url(#flaggedGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-emerald-400" />
                    Risk Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[210px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={riskData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label
                        >
                          {riskData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center space-x-4 mt-2">
                    {riskData.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-slate-300">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Senders */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Top Senders (by count)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[210px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topSenders}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sender" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Flagged Table */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  Flagged Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-2 text-red-500">{error}</div>
                )}
                {loading ? (
                  <div className="py-10 text-center text-gray-500">Loading transactions...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-slate-300">Sender</TableHead>
                          <TableHead className="text-slate-300">Receiver</TableHead>
                          <TableHead className="text-slate-300">Amount</TableHead>
                          <TableHead className="text-slate-300">Risk Score</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-slate-200">{tx.sender}</TableCell>
                            <TableCell className="text-slate-200">{tx.receiver}</TableCell>
                            <TableCell className="text-slate-200">₹{tx.amount}</TableCell>
                            <TableCell className="text-slate-200">{tx.risk_score}</TableCell>
                            <TableCell>
                              <Badge
                                variant={tx.status === "pending" ? "secondary" : tx.status === "approved" ? "default" : "destructive"}
                                className={
                                  tx.status === "pending"
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                    : tx.status === "approved"
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-red-500/20 text-red-400 border-red-500/30"
                                }
                              >
                                {tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateStatus(tx.id, "approved")}
                                  disabled={tx.status !== "pending" || actionLoading === tx.id}
                                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateStatus(tx.id, "blocked")}
                                  disabled={tx.status !== "pending" || actionLoading === tx.id}
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                                >
                                  Block
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AnalystDashboard
