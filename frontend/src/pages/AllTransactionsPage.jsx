"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import demoApi from "@/demo/api.mjs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FileText, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function AllTransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {

    demoApi
      .get("/transactions/all")
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error("Error fetching all transactions:", err))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleBackHome = () => {
    navigate("/")
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBackHome}
          className="text-slate-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-blue-500" />
            All Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400">Loading transactions...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-300">Sender</TableHead>
                  <TableHead className="text-slate-300">Receiver</TableHead>
                  <TableHead className="text-slate-300">Amount</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Risk Score</TableHead>
                  <TableHead className="text-slate-300">Demo Flag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="border-slate-800">
                    <TableCell className="text-slate-200">{tx.sender}</TableCell>
                    <TableCell className="text-slate-200">{tx.receiver}</TableCell>
                    <TableCell className="text-slate-200">₹{tx.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-slate-200 border-slate-700">{tx.status}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-200">{tx.risk_score}</TableCell>
                    <TableCell>
                      {tx.flagged ? (
                        <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/20">Yes</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-800 text-slate-400">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AllTransactionsPage
