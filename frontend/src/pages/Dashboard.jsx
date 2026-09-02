"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import {
  BarChart3,
  Shield,
  AlertTriangle,
  FileText,
  TrendingUp,
  Activity,
  LogOut,
  User,
  Bell,
  PieChart,
  LineChart,
  Sun,
  Moon,
} from "lucide-react"
import { XAxis, YAxis, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart } from "recharts"
import demoApi from "@/demo/api.mjs"

// Theme Context
const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => { },
})

const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

const chartConfig = {
  total: {
    label: "Total Transactions",
    color: "#10b981",
  },
  flagged: {
    label: "Flagged Transactions",
    color: "#ef4444",
  },
}

function DashboardContent() {
  const navigate = useNavigate()
  const [trendData, setTrendData] = useState([]) // Monthly chart data
  const [riskData, setRiskData] = useState([])
  const [notifications, setNotifications] = useState([]) // Synthetic sample alerts
  const location = useLocation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNotifs, setShowNotifs] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {

    async function fetchAll() {
      setLoading(true)
      try {
        // 1. Dashboard summary
        const statsRes = await demoApi.get("/transactions/dashboard/summary")
        setStats(statsRes.data)

        // 2. Monthly trends for line/area chart
        const trendsRes = await demoApi.get("/transactions/stats/monthly")
        setTrendData(trendsRes.data)

        // 3. Risk distribution for pie chart
        const riskRes = await demoApi.get("/transactions/stats/risk_distribution")
        // Add color property for pie chart
        const colorMap = {
          "Low Risk": "#10b981",
          "Medium Risk": "#f59e0b",
          "High Risk": "#ef4444"
        }
        setRiskData(riskRes.data.map(d => ({
          ...d,
          color: colorMap[d.name] || "#8884d8"
        })))

        // 4. Latest flagged transactions for the bell dropdown
        const flaggedRes = await demoApi.get("/transactions/flagged?limit=5")
        setNotifications(flaggedRes.data)
      } catch (err) {
        console.error("Failed to fetch dashboard data", err)
      }
      setLoading(false)
    }
    fetchAll()

    // Set up polling every 30 seconds
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [navigate])

  const handleAboutDemo = () => {
    navigate("/about")
  }
  const role = "analyst"
  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    // Only show this if NOT viewer
    ...(role !== "viewer"
      ? [{ path: "/flagged", label: "Flagged Transactions", icon: AlertTriangle }]
      : []),
    ...(role !== "viewer"
      ? [{ path: "/all-transactions", label: "All Transactions", icon: FileText }]
      : [])
  ]

  const NavItem = ({ path, label, icon: Icon }) => (
    <Button
      variant={isActive(path) ? "secondary" : "ghost"}
      onClick={() => navigate(path)}
      className={`w-full justify-start text-left h-10 ${isActive(path)
        ? theme === "dark"
          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-l-2 border-emerald-400"
          : "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500"
        : theme === "dark"
          ? "text-slate-300 hover:bg-slate-800/50 hover:text-emerald-300"
          : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
        }`}
    >
      <Icon className="mr-3 h-4 w-4" />
      <span className="text-sm">{label}</span>
    </Button>
  )

  const StatCard = ({ title, value, description, icon: Icon, trend, color = "emerald" }) => {
    const colorClasses = {
      emerald: "text-emerald-500 bg-emerald-500/10",
      red: "text-red-500 bg-red-500/10",
      amber: "text-amber-500 bg-amber-500/10",
      blue: "text-blue-500 bg-blue-500/10",
    }

    return (
      <Card
        className={`${theme === "dark"
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
          <div className={`text-2xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{value}</div>
          <p className={`text-xs mb-2 ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>{description}</p>
          {trend && (
            <div className="flex items-center">
              <TrendingUp className="h-3 w-3 text-emerald-400 mr-1" />
              <span className="text-xs text-emerald-400 font-medium">{trend}</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`flex h-screen ${theme === "dark" ? "bg-slate-950" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <aside
        className={`w-56 ${theme === "dark" ? "bg-slate-950 border-r border-slate-800/50" : "bg-white border-r border-gray-200"
          } flex flex-col`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>FraudShield</h1>
              <p className="text-emerald-400 text-xs">Public UI Demo</p>
            </div>
          </div>

          <Separator className={`mb-4 ${theme === "dark" ? "bg-slate-800" : "bg-gray-200"}`} />

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.path} path={item.path} label={item.label} icon={item.icon} />
            ))}
          </nav>
        </div>

        <div className={`mt-auto p-4 border-t ${theme === "dark" ? "border-slate-800" : "border-gray-200"}`}>
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-emerald-600 text-white text-xs">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>{role?.toUpperCase()}</p>

              <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>Security Officer</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${theme === "dark" ? "border-emerald-500/30 text-emerald-400" : "border-emerald-300 text-emerald-600"
              }`}
          >
            Synthetic Data
          </Badge>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className={`relative z-50 ${theme === "dark"
            ? "bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/50"
            : "bg-white/80 backdrop-blur-sm border-b border-gray-200"
            }`}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Dashboard
              </h2>
              <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                Explore synthetic transaction metrics
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`${theme === "dark"
                  ? "text-slate-300 hover:text-white hover:bg-slate-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifs(!showNotifs)}
                  className={`relative ${theme === "dark" ? "text-slate-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <Bell className="h-4 w-4" />
                  {stats && stats.flagged_transactions > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-2 border-slate-950 font-bold">
                      {stats.flagged_transactions}
                    </Badge>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {showNotifs && (
                  <div className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden border ${theme === "dark"
                    ? "bg-slate-900 border-slate-700 shadow-slate-950/50"
                    : "bg-white border-gray-200 shadow-gray-200/50"
                    }`}>
                    <div className="px-4 py-3 border-b border-slate-800/50 flex justify-between items-center">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      <Badge variant="outline" className="text-[10px] py-0 h-5 border-red-500/50 text-red-400">
                        {stats?.flagged_transactions || 0} New
                      </Badge>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-xs text-slate-500 italic">Updating status...</div>
                      ) : stats?.flagged_transactions > 0 ? (
                        <div className="divide-y divide-slate-800/30">
                          {notifications.map((notif) => (
                            <div key={notif.id} className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer group" onClick={() => navigate("/flagged")}>
                              <div className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse"></div>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center w-full">
                                    <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">Flagged: ₹{notif.amount}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                  <p className="text-[11px] text-slate-500 leading-relaxed truncate w-56">From {notif.sender} to {notif.receiver}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-slate-800/20">
                          <Shield className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">All systems clear. No active threats.</p>
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-slate-800/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/50"
                        onClick={() => {
                          setShowNotifs(false)
                          navigate("/flagged")
                        }}
                      >
                        View All Alert Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator
                orientation="vertical"
                className={`h-6 ${theme === "dark" ? "bg-slate-700" : "bg-gray-300"}`}
              />

              <Button
                variant="outline"
                onClick={handleAboutDemo}
                className={`${theme === "dark"
                  ? "text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                  : "text-red-600 border-red-300 hover:bg-red-50"
                  }`}
              >
                <LogOut className="h-4 w-4 mr-2" />
                About demo
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main
          className={`flex-1 overflow-y-auto p-6 ${theme === "dark"
            ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
            }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">


            {/* Stats Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className={`animate-pulse ${theme === "dark" ? "bg-slate-900/50 border-slate-700/50" : "bg-white border-gray-200 shadow-sm"
                      }`}
                  >
                    <CardHeader className="space-y-2">
                      <div className={`h-4 rounded ${theme === "dark" ? "bg-slate-800" : "bg-gray-200"}`}></div>
                      <div className={`h-8 rounded ${theme === "dark" ? "bg-slate-800" : "bg-gray-200"}`}></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Transactions"
                  value={stats.total_transactions?.toLocaleString() || "0"}
                  description="All processed transactions"
                  icon={BarChart3}
                  trend="Synthetic sample records"
                  color="emerald"
                />

                <StatCard
                  title="Flagged Transactions"
                  value={stats.flagged_transactions?.toLocaleString() || "0"}
                  description="Requiring immediate attention"
                  icon={AlertTriangle}
                  trend={`${((stats.flagged_transactions / stats.total_transactions) * 100).toFixed(1)}% of total`}
                  color="red"
                />

                <StatCard
                  title="Average Risk Score"
                  value={typeof stats.avg_risk_score === "number" ? stats.avg_risk_score.toFixed(2) : "0.00"}
                  description="Illustrative sample scores"
                  icon={Shield}
                  trend="Illustrative values only"
                  color="amber"
                />
              </div>
            ) : (
              <Card
                className={`${theme === "dark" ? "bg-slate-900/50 border-slate-700/50" : "bg-white border-gray-200 shadow-sm"
                  }`}
              >
                <CardContent className="flex items-center justify-center h-32">
                  <p className={`${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                    Unable to load dashboard statistics
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transaction Trends Chart */}
              <Card
                className={`${theme === "dark"
                  ? "bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
                  : "bg-white border-gray-200 shadow-sm backdrop-blur-sm"
                  }`}
              >
                <CardHeader>
                  <CardTitle
                    className={`text-lg flex items-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    <LineChart className="h-5 w-5 mr-2 text-emerald-400" />
                    Transaction Trends
                  </CardTitle>
                  <CardDescription className={`${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                    Monthly transaction volume and flagged cases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
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
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: theme === "dark" ? "#94a3b8" : "#6b7280", fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: theme === "dark" ? "#94a3b8" : "#6b7280", fontSize: 12 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#totalGradient)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="flagged"
                          stroke="#ef4444"
                          fillOpacity={1}
                          fill="url(#flaggedGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Risk Distribution Chart */}
              <Card
                className={`${theme === "dark"
                  ? "bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
                  : "bg-white border-gray-200 shadow-sm backdrop-blur-sm"
                  }`}
              >
                <CardHeader>
                  <CardTitle
                    className={`text-lg flex items-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    <PieChart className="h-5 w-5 mr-2 text-emerald-400" />
                    Risk Distribution
                  </CardTitle>
                  <CardDescription className={`${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                    Predefined sample categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={riskData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {riskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div
                                  className={`rounded-lg p-3 shadow-lg ${theme === "dark"
                                    ? "bg-slate-800 border border-slate-700"
                                    : "bg-white border border-gray-200"
                                    }`}
                                >
                                  <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                    {data.name}
                                  </p>
                                  <p className={`${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                                    {data.value}%
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center space-x-6 mt-4">
                    {riskData.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className={`text-sm ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

              </Card>
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card
                className={`${theme === "dark"
                  ? "bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
                  : "bg-white border-gray-200 shadow-sm backdrop-blur-sm"
                  }`}
              >
                <CardHeader>
                  <CardTitle className={`text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    System Status
                  </CardTitle>
                  <CardDescription className={`${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                    Illustrative status — not production telemetry
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                      Demo Data Adapter
                    </span>
                    <Badge
                      className={`${theme === "dark"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}
                    >
                      Local fixtures
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                      Data Source
                    </span>
                    <Badge
                      className={`${theme === "dark"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}
                    >
                      In-browser fixtures
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                      Risk Engine
                    </span>
                    <Badge
                      variant="secondary"
                      className={`${theme === "dark" ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-700"}`}
                    >
                      Not included
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`${theme === "dark"
                  ? "bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
                  : "bg-white border-gray-200 shadow-sm backdrop-blur-sm"
                  }`}
              >
                <CardHeader>
                  <CardTitle className={`text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Quick Actions
                  </CardTitle>
                  <CardDescription className={`${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Only for non-viewers */}
                  {role !== "viewer" && (
                    <Button
                      variant="outline"
                      className={`w-full justify-start ${theme === "dark"
                        ? "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      onClick={() => navigate("/flagged")}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Review Flagged Transactions
                    </Button>
                  )}
                  {role !== "viewer" && (
                    <Button
                      variant="outline"
                      className={`w-full justify-start ${theme === "dark"
                        ? "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      onClick={() => navigate("/all-transactions")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View All Transactions
                    </Button>
                  )}
                </CardContent>

              </Card>
            </div>
          </div>
        </main>
      </div >
    </div >
  )
}

function Dashboard() {
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
      <DashboardContent />
    </ThemeContext.Provider>
  )
}

export default Dashboard
