// src/pages/AdminDashboard.jsx
"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { NavLink } from "react-router-dom"
import { api } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle2,
  Ban,
  Users,
  FileText,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  Bell,
  User,
  Shield,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Theme Context
const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
})

const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

function AdminDashboardContent() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [transactions, setTransactions] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    try {
      const txRes = await api.get("http://localhost:8000/transactions/flagged", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const usersRes = await api.get("http://localhost:8000/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTransactions(txRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      console.error("Error fetching admin data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return navigate("/login")
    fetchData()
  }, [navigate])

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token")
    try {
      await api.patch(
        `http://localhost:8000/transactions/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  const role = localStorage.getItem("role") || "admin"

  const StatCard = ({ title, value, icon: Icon, color = "emerald" }) => {
    const colorClasses = {
      emerald: "text-emerald-500 bg-emerald-500/10",
      red: "text-red-500 bg-red-500/10",
      amber: "text-amber-500 bg-amber-500/10",
      blue: "text-blue-500 bg-blue-500/10",
    }

    return (
      <Card
        className={`${
          theme === "dark"
            ? "bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70"
            : "bg-white border-gray-200 shadow-sm hover:shadow-md"
        } transition-all duration-200`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className={`text-sm font-medium ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
            {title}
          </CardTitle>
          <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{value}</div>
        </CardContent>
      </Card>
    )
  }

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Flagged Transactions", icon: FileText, path: "/admin/flagged" },
    { label: "User Management", icon: Users, path: "/admin/users" },
    { label: "Reports", icon: BarChart3, path: "/admin/reports" },
  ]

  return (
    <div className={`flex h-screen ${theme === "dark" ? "bg-slate-950" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <aside
        className={`w-60 ${
          theme === "dark" ? "bg-slate-950 border-r border-slate-800/50" : "bg-white border-r border-gray-200"
        } flex flex-col`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Admin Panel
              </h1>
              <p className="text-emerald-400 text-xs">Security Platform</p>
            </div>
          </div>

          <Separator className={`mb-4 ${theme === "dark" ? "bg-slate-800" : "bg-gray-200"}`} />

          <nav className="space-y-2">
  {navItems.map((item, index) => (
    <NavLink
      to={item.path || "#"}
      key={index}
      className={({ isActive }) =>
        `flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
          theme === "dark"
            ? `${isActive ? "bg-slate-800/60 text-emerald-300" : "text-slate-300 hover:bg-slate-800/50 hover:text-emerald-300"}`
            : `${isActive ? "bg-gray-100 text-emerald-600" : "text-gray-600 hover:bg-gray-100 hover:text-emerald-600"}`
        }`
      }
    >
      <item.icon className="w-5 h-5" />
      <span className="text-sm font-medium">{item.label}</span>
    </NavLink>
  ))}
</nav>

        </div>

        <div className={`mt-auto p-6 border-t ${theme === "dark" ? "border-slate-800" : "border-gray-200"}`}>
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-emerald-600 text-white text-sm">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Admin User</p>
              <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                {role?.toUpperCase()}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${
              theme === "dark" ? "border-emerald-500/30 text-emerald-400" : "border-emerald-300 text-emerald-600"
            }`}
          >
            Administrator
          </Badge>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className={`${
            theme === "dark"
              ? "bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/50"
              : "bg-white/80 backdrop-blur-sm border-b border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Admin Dashboard
              </h2>
              <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                Manage users and review flagged transactions
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`${
                  theme === "dark"
                    ? "text-slate-300 hover:text-white hover:bg-slate-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`relative ${
                  theme === "dark" ? "text-slate-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                  {transactions.filter((t) => t.status === "pending").length}
                </Badge>
              </Button>

              <Separator
                orientation="vertical"
                className={`h-6 ${theme === "dark" ? "bg-slate-700" : "bg-gray-300"}`}
              />

              <Button
                variant="outline"
                onClick={handleLogout}
                className={`${
                  theme === "dark"
                    ? "text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                    : "text-red-600 border-red-300 hover:bg-red-50"
                }`}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto p-6 ${
            theme === "dark"
              ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
              : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Users"
                value={users.length.toLocaleString()}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Flagged Transactions"
                value={transactions.length.toLocaleString()}
                icon={FileText}
                color="red"
              />
              <StatCard
                title="Pending Reviews"
                value={transactions.filter((t) => t.status === "pending").length.toLocaleString()}
                icon={ShieldCheck}
                color="amber"
              />
            </div>

            {/* Transactions Table */}
            <Card
              className={`${
                theme === "dark"
                  ? "bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
                  : "bg-white border-gray-200 shadow-sm backdrop-blur-sm"
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`text-lg flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Flagged Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                      Loading transactions...
                    </p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                      No flagged transactions found
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className={theme === "dark" ? "border-slate-700" : "border-gray-200"}>
                          <TableHead className={theme === "dark" ? "text-slate-300" : "text-gray-600"}>
                            Sender
                          </TableHead>
                          <TableHead className={theme === "dark" ? "text-slate-300" : "text-gray-600"}>
                            Receiver
                          </TableHead>
                          <TableHead className={theme === "dark" ? "text-slate-300" : "text-gray-600"}>
                            Amount
                          </TableHead>
                          <TableHead className={theme === "dark" ? "text-slate-300" : "text-gray-600"}>
                            Status
                          </TableHead>
                          <TableHead className={theme === "dark" ? "text-slate-300" : "text-gray-600"}>
                            Risk Score
                          </TableHead>
                          <TableHead className={theme === "dark" ? "text-slate-300" : "text-gray-600"}>
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TableRow
                            key={tx.id}
                            className={`${
                              theme === "dark"
                                ? "border-slate-700 hover:bg-slate-800/50"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <TableCell className={theme === "dark" ? "text-slate-300" : "text-gray-900"}>
                              {tx.sender}
                            </TableCell>
                            <TableCell className={theme === "dark" ? "text-slate-300" : "text-gray-900"}>
                              {tx.receiver}
                            </TableCell>
                            <TableCell className={theme === "dark" ? "text-slate-300" : "text-gray-900"}>
                              ₹{tx.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={tx.status === "pending" ? "secondary" : tx.status === "approved" ? "default" : "destructive"}
                                className={`${
                                  tx.status === "pending"
                                    ? theme === "dark"
                                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                      : "bg-amber-100 text-amber-700 border-amber-200"
                                    : tx.status === "approved"
                                      ? theme === "dark"
                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                        : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                      : theme === "dark"
                                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                                        : "bg-red-100 text-red-700 border-red-200"
                                }`}
                              >
                                {tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell className={theme === "dark" ? "text-slate-300" : "text-gray-900"}>
                              <Badge
                                variant="outline"
                                className={`${
                                  theme === "dark"
                                    ? "border-slate-600 text-slate-400"
                                    : "border-gray-300 text-gray-600"
                                }`}
                              >
                                {tx.risk_score}
                              </Badge>
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(tx.id, "approved")}
                                disabled={tx.status !== "flagged"}
                                className={`${
                                  theme === "dark"
                                    ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                                    : "border-emerald-300 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                }`}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(tx.id, "blocked")}
                                disabled={tx.status !== "flagged"}
                                className={`${
                                  theme === "dark"
                                    ? "border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                                    : "border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                }`}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Block
                              </Button>
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

function AdminDashboard() {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    // Load theme from localStorage on component mount
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AdminDashboardContent />
    </ThemeContext.Provider>
  )
}

export { ThemeContext }
export default AdminDashboard