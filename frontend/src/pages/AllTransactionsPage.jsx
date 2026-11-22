"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function AllTransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return navigate("/login")

    api
      .get("http://localhost:8000/transactions/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error("Error fetching all transactions:", err))
      .finally(() => setLoading(false))
  }, [navigate])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            All Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading transactions...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>ML Flagged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.sender}</TableCell>
                    <TableCell>{tx.receiver}</TableCell>
                    <TableCell>₹{tx.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.status}</Badge>
                    </TableCell>
                    <TableCell>{tx.risk_score}</TableCell>
                    <TableCell>
                      {tx.ml_flagged ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
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
