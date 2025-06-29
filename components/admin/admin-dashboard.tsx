"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Edit,
  MoreHorizontal,
  Search,
  Shield,
  Trash,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { get } from "http"

type User = {
  id: string
  name: string
  email: string
  avatar?: string
  first_name: string
  last_name?: string
  [key: string]: any
  role: string
}

export function AdminDashboard() {
  // Handler for Add User form submission
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setAddUserLoading(true)
      setAddUserError(null)
      // Prepare a SignUp object instead of FormData
      const signUpData = {
        ...addUserForm,
        profile_picture: typeof addUserForm.profile_picture === 'string'
          ? addUserForm.profile_picture
          : '', // or handle file upload logic here
      }
      const result = await addUser('', signUpData)
      if (result && result.success) {
        toast({
          title: "User added!",
          description: `${addUserForm.first_name} ${addUserForm.last_name} has been registered.`,
          variant: "success",
        })
        setIsAddUserOpen(false)
        setAddUserForm({
          password: "",
          is_superuser: false,
          email: "",
          username: "",
          is_active: true,
          is_staff: false,
          first_name: "",
          last_name: "",
          middle_name: "",
          department: "",
          bio: "",
          profile_picture: "",
          role: "STUDENT",
        })
        // Refresh users after successful addition
        const response = await getUsers()
        if (response && response.success && Array.isArray(response.data)) {
          setUsers(response.data)
        }
      }
    } catch (err: any) {
      console.error(err)
      // Prefer backend error message if available
      if (err?.response?.data?.detail) {
        setAddUserError(err.response.data.detail)
      } else if (err?.response?.data) {
        // If backend returns a dict of field errors, show the first
        const firstKey = Object.keys(err.response.data)[0]
        const firstError = err.response.data[firstKey]?.[0] || err.response.data[firstKey]
        setAddUserError(firstError || err.message)
      } else {
        setAddUserError(err.message)
      }
    } finally {
      setAddUserLoading(false)
    }
  }
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("users")
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editRole, setEditRole] = useState<string>("")
  const [isEditOpen, setIsEditOpen] = useState(false)
  // Add User modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [addUserLoading, setAddUserLoading] = useState(false)
  const [addUserForm, setAddUserForm] = useState<{
    password: string
    is_superuser: boolean
    email: string
    username: string
    is_active: boolean
    is_staff: boolean
    first_name: string
    last_name: string
    middle_name: string
    department: string
    bio: string
    profile_picture: string | File
    role: string
  }>({
    password: "",
    is_superuser: false,
    email: "",
    username: "",
    is_active: true,
    is_staff: false,
    first_name: "",
    last_name: "",
    middle_name: "",
    department: "",
    bio: "",
    profile_picture: "",
    role: "STUDENT",
  })
  const [addUserError, setAddUserError] = useState<string | null>(null)
  const [incidentsData, setIncidents] = useState<any[]>([])

  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [incidentToDelete, setIncidentToDelete] = useState<any>(null)

  const getUsers = useAuthStore((state) => state.adminGetAllUsers)
  const deleteUser = useAuthStore((state) => state.deleteUser)
  const addUser = useAuthStore((state)=> state.addUser)
  const updateRole = useAuthStore((state) => state.postAdminChangeRole)
  const getRoles = useAuthStore((state)=> state.getRoles)
  const incidents = useAuthStore((state) => state.incidents)
  const updateIncident = useAuthStore((state)=> state.updateIncident)
  const deleteIncident = useAuthStore((state) => state.deleteAdminIncident)
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await getUsers()
        if (response && response.success && Array.isArray(response.data)) {
          setUsers(response.data)
          console.log("Fetched users:", response.data)
        } else {
          setUsers([])
          toast({
            title: "Error",
            description: response?.message || "Failed to fetch users. Please try again later.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again later.",
          variant: "destructive",
        })
      }
    }
    fetchUsers()
  }, [getUsers, toast])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    async function fetchIncidents() {
      try {
        const response = await incidents()
        if (response && response.success && Array.isArray(response.data)) {
          setIncidents(response.data)
          console.log("Fetched incidents:", response.data)
        } else {
          setIncidents([])
          toast({
            title: "Error",
            description: response?.message || "Failed to fetch incidents. Please try again later.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to fetch incidents:", error)
        toast({
          title: "Error",
          description: "Failed to fetch incidents. Please try again later.",
          variant: "destructive",
        })
      }
    }

    fetchIncidents()
    intervalId = setInterval(fetchIncidents, 3000) // refresh every 3 seconds

    return () => clearInterval(intervalId)
  }, [incidents, toast])

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles('', {})
        if (response && response.success) {
          console.log("Fetched roles:", response.data)
        } else {
          toast({
            title: "Error",
            description: response?.message || "Failed to fetch roles. Please try again later.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error)
        toast({
          title: "Error",
          description: "Failed to fetch roles. Please try again later.",
          variant: "destructive",
        })
      }
    }
    fetchRoles()
  }, [getRoles, toast])

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId)
    toast({
      title: "User deleted",
      description: `User ID: ${userId} has been deleted.`,
      variant: "destructive"
    })
  }

  const handleResetPassword = (userId: string) => {
    toast({
      title: "Password reset email sent",
      description: `A password reset email has been sent to the user.`,
    })
  }

  const handleDeleteIncident = (incidentId: string) => {
    const foundIncident = incidentsData.find((incident) => incident.id === incidentId)
    setIncidentToDelete(foundIncident)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteIncident = async () => {
    if (!incidentToDelete) return
    await deleteIncident(incidentToDelete.id)
    toast({
      title: "Incident deleted",
      description: `Incident "${incidentToDelete.title || incidentToDelete.id}" has been deleted.`,
      variant: "destructive"
    })
    setDeleteDialogOpen(false)
    setIncidentToDelete(null)
  }

  const handleResolveIncident = async (incidentId: string) => {
   const result= await updateIncident(incidentId, { status: "RESOLVED" })
   if (result && result.success) {
      const resolvedIncident = incidentsData.find((incident) => incident.id === incidentId)
      toast({
        title: "Incident resolved",
        description: `Incident "${resolvedIncident?.title || incidentId}" has been marked as resolved.`,
        variant: "success",
      })
    }
    // Refresh incidents after resolving
    const response = await incidents()
    if (response && response.success && Array.isArray(response.data)) {
      setIncidents(response.data)

    }
  }

  // Handler for opening the edit modal
  const handleEditUser = (user: User) => {
    setEditUser(user)
    setEditRole(user.role || "Student")
    setIsEditOpen(true)
  }

  // Handler for submitting the role update
  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    const roleMap: Record<string, string> = {
      Student: "STUDENT",
      Admin: "ADMIN",
      Security: "SECURITY_PERSONNEL",
    }
    const payload = {
      user_id: editUser.id,
      role_id: roleMap[editRole],
    }
    try {
      const response = await updateRole(payload)
      if (response && response.success) {
        toast({ title: "Role updated!", description: `User role updated to ${editRole}`, 
          variant: "success"
        })
        // Optionally update local state
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editUser.id ? { ...u, role: editRole } : u
          )
        )
      } else {
        toast({
          title: "Error updating role",
          description: response?.message || "Failed to update user role.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error updating role",
        description: "An error occurred while updating the user role.",
        variant: "destructive",
      })
    }
    setIsEditOpen(false)
  }

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      searchQuery === "" ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter incidents based on search query
  const filteredIncidents = incidentsData.filter(
    (incident) =>
      searchQuery === "" ||
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Tabs defaultValue="users" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="incidents">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Incidents
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Shield className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`Search ${activeTab}...`}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {activeTab === "users" && (
                <Button className="ml-4" onClick={() => setIsAddUserOpen(true)}>
                  Add User
                </Button>
              )}
      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Fill in the details to register a new user.</DialogDescription>
          </DialogHeader>
  <form
    className="space-y-3 bg-orange-50 border border-orange-200 rounded-lg p-6 shadow-md"
    onSubmit={handleAddUserSubmit}
  >
            <div className="grid grid-cols-2 gap-2">
              <div>
              <Label htmlFor="first_name" className="text-orange-700">First Name</Label>
              <Input id="first_name" value={addUserForm.first_name} onChange={e => setAddUserForm(f => ({ ...f, first_name: e.target.value }))} required className="bg-orange-100 border-orange-300 text-orange-900 placeholder:text-orange-400 focus:ring-orange-400 focus:border-orange-400" />
              </div>
              <div>
              <Label htmlFor="last_name" className="text-orange-700">Last Name</Label>
              <Input id="last_name" value={addUserForm.last_name} onChange={e => setAddUserForm(f => ({ ...f, last_name: e.target.value }))} className="bg-orange-100 border-orange-300 text-orange-900 placeholder:text-orange-400 focus:ring-orange-400 focus:border-orange-400" />
              </div>
              <div>
              <Label htmlFor="middle_name" className="text-orange-700">Middle Name</Label>
              <Input id="middle_name" value={addUserForm.middle_name} onChange={e => setAddUserForm(f => ({ ...f, middle_name: e.target.value }))} className="bg-orange-100 border-orange-300 text-orange-900 placeholder:text-orange-400 focus:ring-orange-400 focus:border-orange-400" />
              </div>
              <div>
              <Label htmlFor="department" className="text-orange-700">Department</Label>
              <Input id="department" value={addUserForm.department} onChange={e => setAddUserForm(f => ({ ...f, department: e.target.value }))} className="bg-orange-100 border-orange-300 text-orange-900 placeholder:text-orange-400 focus:ring-orange-400 focus:border-orange-400" />
              </div>
              <div>
              <Label htmlFor="email" className="text-orange-700">Email</Label>
              <Input id="email" type="email" value={addUserForm.email} onChange={e => setAddUserForm(f => ({ ...f, email: e.target.value }))} required className="bg-orange-100 border-orange-300 text-orange-900 placeholder:text-orange-400 focus:ring-orange-400 focus:border-orange-400" />
              </div>
              <div>
              <Label htmlFor="username" className="text-orange-700">Username</Label>
              <Input id="username" value={addUserForm.username} onChange={e => setAddUserForm(f => ({ ...f, username: e.target.value }))} required className="bg-orange-100 border-orange-300 text-orange-900 placeholder:text-orange-400 focus:ring-orange-400 focus:border-orange-400" />
              </div>
              <div>
              <Label htmlFor="password" className="text-orange-700">Password</Label>
              <Input id="password" type="password" value={addUserForm.password} onChange={e => setAddUserForm(f => ({ ...f, password: e.target.value }))} required className="bg-orange-100 border-orange-300 text-orange-900 placeholder:text-orange-400 focus:ring-orange-400 focus:border-orange-400" />
              </div>
              <div>
              <Label htmlFor="role" className="text-orange-700">Role</Label>
              <select
                id="role"
                className="w-full border rounded px-3 py-2 bg-orange-100 border-orange-300 text-orange-900 focus:ring-orange-400 focus:border-orange-400"
                value={addUserForm.role}
                onChange={e => setAddUserForm(f => ({ ...f, role: e.target.value }))}
                required
              >
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
                <option value="SECURITY_PERSONNEL">Security</option>
              </select>
              </div>
            </div>
            <div>
              <Label htmlFor="bio" className="text-orange-700">Bio</Label>
              <Input id="bio" value={addUserForm.bio} onChange={e => setAddUserForm(f => ({ ...f, bio: e.target.value }))} className="bg-orange-100 border-orange-300 text-orange-900 placeholder:text-orange-400 focus:ring-orange-400 focus:border-orange-400" />
            </div>
            <div>
              <Label htmlFor="profile_picture" className="text-orange-700">Profile Picture</Label>
              <input
                id="profile_picture"
                type="file"
                accept="image/*"
                className="block w-full text-orange-700 bg-orange-50 border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 file:bg-orange-100 file:text-orange-700 file:border-0 file:rounded file:px-3 file:py-1"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setAddUserForm(f => ({ ...f, profile_picture: file }))
                  }
                }}
              />
              {addUserForm.profile_picture && typeof addUserForm.profile_picture !== 'string' && (
                <img
                  src={URL.createObjectURL(addUserForm.profile_picture)}
                  alt="Preview"
                  className="mt-2 w-20 h-20 object-cover rounded border border-orange-300 bg-orange-100"
                />
              )}
            </div>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={addUserForm.is_superuser} onChange={e => setAddUserForm(f => ({ ...f, is_superuser: e.target.checked }))} />
                Superuser
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={addUserForm.is_staff} onChange={e => setAddUserForm(f => ({ ...f, is_staff: e.target.checked }))} />
                Staff
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={addUserForm.is_active} onChange={e => setAddUserForm(f => ({ ...f, is_active: e.target.checked }))} />
                Active
              </label>
            </div>
            {addUserError && <div className="text-destructive text-sm">{addUserError}</div>}
            <DialogFooter>
              <Button type="submit" disabled={addUserLoading}>{addUserLoading ? "Adding..." : "Add User"}</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
            </div>

            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Reports</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.first_name} />
                                <AvatarFallback>{user.first_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.first_name}</p>
                                {/* <p className="font-medium">{user.first_name} {user.last_name}</p> */}
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "ADMIN" ? "default" : user.role === "STUDENT" ? "secondary" : "outlineStudent"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user?.number_of_reported_incidents}</TableCell>
                          <TableCell>
                            {user.date_joined
                              ? new Date(user.date_joined).toLocaleDateString("en-GB")
                              : ""}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.role === "ADMIN" ? (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    disabled={true}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                                ) : (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onSelect={e => e.preventDefault()}
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete User
                                      </DropdownMenuItem>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-destructive">
                                          <AlertTriangle className="h-5 w-5 text-destructive" />
                                          Delete User
                                        </DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to delete user <span className="font-bold">{user.first_name}</span>?<br />
                                          This action cannot be undone.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter>
                                        <Button
                                          variant="destructive"
                                          onClick={() => {
                                            handleDeleteUser(user.id)
                                          }}
                                        >
                                          Delete
                                        </Button>
                                        <DialogClose asChild>
                                          <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}

                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center">
                              <Users className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">No users found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incidents" className="mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Incident Management</CardTitle>
                  <CardDescription>Review, update, and manage reported incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Incident</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...filteredIncidents]
                        .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
                        .map((incident) => (
                          <TableRow key={incident.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-1.5 rounded-full ${
                                    incident.severity === "HIGH"
                                      ? "bg-red-100 dark:bg-red-900"
                                      : incident.severity === "MEDIUM"
                                        ? "bg-yellow-100 dark:bg-yellow-900"
                                        : "bg-blue-100 dark:bg-blue-900"
                                  }`}
                                >
                                  <AlertTriangle
                                    className={`h-4 w-4 ${
                                      incident.severity === "HIGH"
                                        ? "text-red-600 dark:text-red-400"
                                        : incident.severity === "MEDIUM"
                                          ? "text-yellow-600 dark:text-yellow-400"
                                          : "text-blue-600 dark:text-blue-400"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">{incident.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{incident.description}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{incident.location}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  incident.status === "RESOLVED"
                                    ? "secondary"
                                    : incident.status === "INVESTIGATING"
                                      ? "outline"
                                      : "destructive"
                                }
                              >
                                {incident.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {incident.date_created
                                    ? new Date(incident.date_created).toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/incidents/${incident.id}`}>
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Incident
                                </DropdownMenuItem>
                                {incident.status !== "resolved" && (
                                  <DropdownMenuItem onClick={() => handleResolveIncident(incident.id)}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Mark as Resolved
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteIncident(incident.id)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete Incident
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}

                      {filteredIncidents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center">
                              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">No incidents found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Settings</CardTitle>
                    <CardDescription>Configure general platform settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Campus Information</h3>
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 items-center gap-4">
                            <label htmlFor="campus-name" className="text-sm font-medium">
                              Campus Name
                            </label>
                            <Input id="campus-name" defaultValue="University Campus" className="col-span-2 h-8" />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <label htmlFor="emergency-number" className="text-sm font-medium">
                              Emergency Number
                            </label>
                            <Input id="emergency-number" defaultValue="(555) 123-4567" className="col-span-2 h-8" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Map Settings</h3>
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 items-center gap-4">
                            <label htmlFor="default-zoom" className="text-sm font-medium">
                              Default Zoom
                            </label>
                            <Input id="default-zoom" type="number" defaultValue="15" className="col-span-2 h-8" />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <label htmlFor="center-lat" className="text-sm font-medium">
                              Center Latitude
                            </label>
                            <Input id="center-lat" defaultValue="34.0522" className="col-span-2 h-8" />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <label htmlFor="center-lng" className="text-sm font-medium">
                              Center Longitude
                            </label>
                            <Input id="center-lng" defaultValue="-118.2437" className="col-span-2 h-8" />
                          </div>
                        </div>
                      </div>

                      <Button className="w-full">Save Settings</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure email and push notification settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Email Notifications</h3>
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="email-new-incident" className="text-sm">
                              New Incident Reports
                            </label>
                            <div className="flex items-center">
                              <input type="checkbox" id="email-new-incident" defaultChecked className="mr-2" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <label htmlFor="email-high-severity" className="text-sm">
                              High Severity Incidents Only
                            </label>
                            <div className="flex items-center">
                              <input type="checkbox" id="email-high-severity" defaultChecked className="mr-2" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <label htmlFor="email-digest" className="text-sm">
                              Daily Digest
                            </label>
                            <div className="flex items-center">
                              <input type="checkbox" id="email-digest" className="mr-2" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">System Notifications</h3>
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="system-user-signup" className="text-sm">
                              New User Signups
                            </label>
                            <div className="flex items-center">
                              <input type="checkbox" id="system-user-signup" defaultChecked className="mr-2" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <label htmlFor="system-comments" className="text-sm">
                              New Comments
                            </label>
                            <div className="flex items-center">
                              <input type="checkbox" id="system-comments" defaultChecked className="mr-2" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <label htmlFor="system-resolved" className="text-sm">
                              Resolved Incidents
                            </label>
                            <div className="flex items-center">
                              <input type="checkbox" id="system-resolved" className="mr-2" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full">Save Notification Settings</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Incident Categories</CardTitle>
                    <CardDescription>Manage incident categories and tags</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge className="px-3 py-1">
                          property damage
                          <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 -mr-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </Badge>
                        <Badge className="px-3 py-1">
                          safety hazard
                          <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 -mr-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </Badge>
                        <Badge className="px-3 py-1">
                          security concern
                          <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 -mr-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </Badge>
                        <Badge className="px-3 py-1">
                          theft
                          <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 -mr-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </Badge>
                        <Badge className="px-3 py-1">
                          vandalism
                          <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 -mr-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </Badge>
                        <Badge className="px-3 py-1">
                          suspicious activity
                          <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 -mr-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </Badge>
                        <Badge className="px-3 py-1">
                          facility issue
                          <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 -mr-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </Badge>
                        <Badge className="px-3 py-1">
                          accessibility
                          <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 -mr-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Input placeholder="Add new category..." className="max-w-xs" />
                        <Button>Add Category</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>Update the user's role below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRole} className="space-y-4">
            <div>
              <Label htmlFor="user_id">User ID</Label>
              <Input id="user_id" value={editUser?.id || ""} readOnly className="bg-muted" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="w-full border rounded px-3 py-2"
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
              >
                <option value="Student">Student</option>
                <option value="Admin">Admin</option>
                <option value="SECURITY_PERSONNEL">Security</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit">Update</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Incident
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this incident?
              <br />
              <span className="block mt-2 text-lg font-bold text-destructive underline underline-offset-4">{incidentToDelete?.title}</span>
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={confirmDeleteIncident}>Delete</Button>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
