import { useEffect, useState, useContext } from "react"
import { api } from "@/lib/api";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeContext } from "./AdminDashboard"
import { Download, Search, CheckCircle2, AlertTriangle, Loader2, Circle } from "lucide-react"

const AdminReports = () => {
  const { theme } = useContext(ThemeContext)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Stats
  const total = transactions.length
  const approved = transactions.filter(tx => tx.status === "approved").length
  const flagged = transactions.filter(tx => tx.status === "flagged").length
  const pending = transactions.filter(tx => tx.status === "pending").length

  useEffect(() => {
    const token = localStorage.getItem("token")
    api
      .get("http://localhost:8000/transactions/all", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setTransactions(res.data))
      .finally(() => setLoading(false))
  }, [])

  // Download CSV
  const downloadCSV = () => {
    const token = localStorage.getItem("token")
    api.get("http://localhost:8000/transactions/export", {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob"
    }).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "transactions.csv")
      document.body.appendChild(link)
      link.click()
      link.remove()
    })
  }

  // Search logic
  const filteredTx = transactions.filter(tx => {
    const term = search.toLowerCase()
    return (
      tx.sender?.toLowerCase().includes(term) ||
      tx.receiver?.toLowerCase().includes(term) ||
      tx.status?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-8 px-4">
      <Card className="bg-slate-900/80 border-slate-800 text-white shadow-lg">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Download className="w-5 h-5" /> Transaction Logs & History
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sender, receiver, status..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-800 text-white px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
            </div>
            <Button onClick={downloadCSV} className="bg-blue-700 hover:bg-emerald-700 text-white flex gap-2">
              <Download className="w-4 h-4" /> Download CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-6 mb-5 mt-2">
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm">Total</span>
              <span className="font-bold text-lg text-white">{total}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm">Approved</span>
              <span className="font-bold text-lg text-emerald-200">{approved}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm">Flagged</span>
              <span className="font-bold text-lg text-amber-200">{flagged}</span>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-cyan-300 text-sm">Pending</span>
              <span className="font-bold text-lg text-cyan-200">{pending}</span>
            </div>
          </div>
          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-300">Sender</TableHead>
                    <TableHead className="text-slate-300">Receiver</TableHead>
                    <TableHead className="text-slate-300">Amount</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Risk</TableHead>
                    <TableHead className="text-slate-300">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTx.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTx.map(tx => (
                      <TableRow key={tx.id} className="hover:bg-slate-800/60">
                        <TableCell className="text-white">{tx.sender}</TableCell>
                        <TableCell className="text-white">{tx.receiver}</TableCell>
                        <TableCell className="text-emerald-300 font-semibold">₹{tx.amount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.status === "approved"
                                ? "default"
                                : tx.status === "flagged"
                                ? "destructive"
                                : "secondary"
                            }
                            className={
                              tx.status === "approved"
                                ? "bg-emerald-700/50 border-emerald-600 text-emerald-300"
                                : tx.status === "flagged"
                                ? "bg-red-700/50 border-red-600 text-red-300"
                                : "bg-cyan-800/60 border-cyan-500 text-cyan-200"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-slate-800 border-slate-600 text-slate-200">
                            {tx.risk_score ?? "--"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-200">
                          {tx.created_at ? new Date(tx.created_at).toLocaleString() : "--"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminReports
