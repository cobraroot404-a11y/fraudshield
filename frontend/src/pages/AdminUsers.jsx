// src/pages/AdminUsers.jsx
"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/api";
import { Users, UserCheck, Trash2, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const ROLES = ["admin", "analyst", "viewer"]

const AdminUsers = () => {
  const theme = "dark"
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [promoteOpen, setPromoteOpen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState("")
  // Add User Modal State
  const [showAdd, setShowAdd] = useState(false)
  const [addData, setAddData] = useState({ email: "", password: "", role: "viewer" })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState("")

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      if (!token) return navigate("/login")
      const res = await api.get("http://localhost:8000/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (err) {
      setError("Could not load users")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line
  }, [])

  const promoteUser = async (id, newRole) => {
    setActionLoading(id)
    setError("")
    try {
      const token = localStorage.getItem("token")
      await api.patch(`http://localhost:8000/auth/users/${id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(users =>
        users.map(u => (u.id === id ? { ...u, role: newRole } : u))
      )
    } catch (err) {
      setError("Promote failed")
    }
    setActionLoading(null)
  }

  const removeUser = async (id) => {
    setActionLoading(id)
    setError("")
    try {
      const token = localStorage.getItem("token")
      await api.delete(`http://localhost:8000/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(users => users.filter(u => u.id !== id))
    } catch (err) {
      setError("Remove failed")
    }
    setActionLoading(null)
  }

  // Add User Logic
  const handleAddUser = async (e) => {
    e.preventDefault()
    setAddError("")
    setAddLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await api.post(
        "http://localhost:8000/auth/users",
        {
          email: addData.email,
          password: addData.password,
          role: addData.role
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setUsers(users => [...users, res.data])
      setShowAdd(false)
      setAddData({ email: "", password: "", role: "viewer" })
    } catch (err) {
      setAddError("Add user failed")
    }
    setAddLoading(false)
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-emerald-400" />
                User Management
              </h2>
              <p className="text-sm text-white">
                Manage all users & roles
              </p>
            </div>
            <Button
              onClick={() => setShowAdd(true)}
              variant="outline"
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </header>

        {/* Add User Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <form
              onSubmit={handleAddUser}
              className="bg-slate-900 rounded-lg border border-slate-700 p-8 min-w-[340px] shadow-2xl"
              autoComplete="off"
            >
              <h3 className="text-lg text-white mb-5">Add New User</h3>
              <div className="mb-3">
                <label className="block text-slate-300 mb-1 text-sm">Email</label>
                <input
                  type="email"
                  value={addData.email}
                  required
                  onChange={e => setAddData(a => ({ ...a, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none"
                />
              </div>
              <div className="mb-3">
                <label className="block text-slate-300 mb-1 text-sm">Password</label>
                <input
                  type="password"
                  value={addData.password}
                  required
                  onChange={e => setAddData(a => ({ ...a, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="block text-slate-300 mb-1 text-sm">Role</label>
                <select
                  value={addData.role}
                  onChange={e => setAddData(a => ({ ...a, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
              {addError && <div className="mb-2 text-red-400">{addError}</div>}
              <div className="flex gap-2 mt-4">
                <Button
                  type="submit"
                  disabled={addLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {addLoading ? "Adding..." : "Add User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowAdd(false); setAddError("") }}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex text-white items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  All Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-2 text-red-500">{error}</div>
                )}
                {loading ? (
                  <div className="py-10 text-center text-gray-500">Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-slate-300">Email</TableHead>
                          <TableHead className="text-slate-300">Role</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map(u => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium text-slate-200">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-emerald-400 border-emerald-700">
                                {u.role || "user"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs text-white">
                                {u.active !== false ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="space-x-2 relative">
                              {/* Promote Dropdown */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPromoteOpen(promoteOpen === u.id ? null : u.id)}
                                disabled={actionLoading === u.id}
                                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Promote
                              </Button>
                              {promoteOpen === u.id && (
                                <div className="absolute z-20 mt-1 left-0 w-36 rounded-lg border border-slate-700 shadow-lg bg-slate-900">
                                  {ROLES.filter(r => r !== u.role).map(roleOpt => (
                                    <button
                                      key={roleOpt}
                                      className="block w-full text-left px-4 py-2 text-sm hover:bg-emerald-500/10 text-slate-200"
                                      onClick={async () => {
                                        setPromoteOpen(null)
                                        await promoteUser(u.id, roleOpt)
                                      }}
                                    >
                                      {roleOpt.charAt(0).toUpperCase() + roleOpt.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {/* Remove Button */}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeUser(u.id)}
                                disabled={actionLoading === u.id}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
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

export default AdminUsers
