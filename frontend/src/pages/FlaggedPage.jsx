// src/pages/FlaggedPage.jsx
"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function FlaggedPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return navigate("/login")

    api
      .get("http://localhost:8000/transactions/flagged", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error("Error fetching flagged transactions:", err))
      .finally(() => setLoading(false))
  }, [navigate])

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Flagged Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-300">Sender</TableHead>
                    <TableHead className="text-slate-300">Receiver</TableHead>
                    <TableHead className="text-slate-300">Amount</TableHead>
                    <TableHead className="text-slate-300">Risk Score</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Flagged</TableHead>
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
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-red-500/20 border-red-500/30 text-red-400">
                          {tx.flagged ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FlaggedPage
