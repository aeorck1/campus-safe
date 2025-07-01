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
import {User} from "@/lib/auth"
import InvestigatingTeamTabContent from "@/components/investigating-team"


export function AdminDashboard() {
  // State for user details modal
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [userDetailsLoading, setUserDetailsLoading] = useState(false)
  const getUserDetails = useAuthStore((state) => state.getUserDetails)
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
  const [roles, setRoles] = useState<any[]>([])
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
  const adminResetPassword = useAuthStore((state) => state.adminResetPassword);
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await getUsers()
        console.log("Fetched Users", response.data)
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
        if (response && response.success && Array.isArray(response.data)) {
          setRoles(response.data)
        } else {
          setRoles([])
          toast({
            title: "Error",
            description: response?.message || "Failed to fetch roles. Please try again later.",
            variant: "destructive",
          })
        }
      } catch (error) {
        setRoles([])
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

  const handleDeleteUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      const userName = user
        ? `${user.first_name} ${user.last_name || ""}`.trim()
        : `User ID: ${userId}`
      const result = await deleteUser(userId)
      if (result && result.success) {
        toast({
          title: "User deleted",
          description: `${userName} has been deleted.`,
          variant: "destructive"
        })
        // Refresh users after successful deletion
        const response = await getUsers()
        if (response && response.success && Array.isArray(response.data)) {
          setUsers(response.data)
        }
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to delete user.",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete user.",
        variant: "destructive"
      })
    }
  }

  const handleResetPassword = async (userId: string) => {
  // Show the "Sending Mail..." toast and keep its id
  const toastObj = toast({
    title: "Sending Mail...",
    description: "Sending password reset link",
    variant: "default",
    className: "bg-orange-100 border-orange-300 text-orange-800",
    style: { borderColor: "#ea580c", color: "#b45309" },
    // No duration: stays until dismissed
  });

  try {
    const res = await adminResetPassword({ user_id: userId });
    // Dismiss the "Sending Mail..." toast
    toastObj.dismiss();
    if (res && res.success) {
      toast({
        title: "Password reset email sent",
        description: `A password reset email has been sent to the user.`,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: res?.message || "Failed to send password reset email.",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toastObj.dismiss();
    toast({
      title: "Error",
      description: error?.message || "Failed to send password reset email.",
      variant: "destructive",
    });
  }
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
    // Accept both label and value for role
    const roleMap: Record<string, string> = {
      Student: "STUDENT",
      Admin: "ADMIN",
      Security: "SECURITY_PERSONNEL",
      SECURITY_PERSONNEL: "SECURITY_PERSONNEL",
      ADMIN: "ADMIN",
      STUDENT: "STUDENT"
    }
    // Try to resolve role_id from editRole, fallback to editRole itself
    const role_id = roleMap[editRole] || editRole;
    const payload = {
      user_id: editUser.id,
      role_id: role_id
    }
    try {
      const response = await updateRole(payload)
      if (response && response.success) {
        toast({ title: "Role updated!", description: `User role updated to ${editRole}`,
          variant: "success"
        })
        // Refresh users after successful role update
        const usersResponse = await getUsers()
        if (usersResponse && usersResponse.success && Array.isArray(usersResponse.data)) {
          setUsers(usersResponse.data)
        }
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
  // Fetch user details when modal opens and selectedUserId changes
  useEffect(() => {
    if (isUserDetailsOpen && selectedUserId) {
      setUserDetailsLoading(true);
      getUserDetails(selectedUserId, {})
        .then((res: any) => {
          if (res && res.success && res.data) {
            setUserDetails(res.data);
          } else {
            setUserDetails(null);
          }
        })
        .catch(() => setUserDetails(null))
        .finally(() => setUserDetailsLoading(false));
    } else {
      setUserDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserDetailsOpen, selectedUserId, getUserDetails]);


  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Tabs defaultValue="users" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 gap-0 rounded-lg overflow-hidden border bg-muted">
              <TabsTrigger value="users" className="w-full flex justify-center items-center py-2 rounded-none border-0">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="incidents" className="w-full flex justify-center items-center py-2 rounded-none border-0">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Incidents
              </TabsTrigger>
              <TabsTrigger value="roles" className="w-full flex justify-center items-center py-2 rounded-none border-0">
                <Shield className="mr-2 h-4 w-4" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="investigating-team" className="w-full flex justify-center items-center py-2 rounded-none border-0">
                <Shield className="mr-2 h-4 w-4" />
                Investigating Team
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
                        <TableRow key={user.id} className="cursor-pointer hover:bg-orange-50" onClick={() => { setSelectedUserId(user.id); setIsUserDetailsOpen(true); }}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.first_name} />
                                <AvatarFallback>{user.first_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.first_name}</p>
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
                                <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}>
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={e => { e.stopPropagation(); handleEditUser(user); }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User Role
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={e => { e.stopPropagation(); handleResetPassword(user.id); }}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {(user.role === "ADMIN" || user.role==="SYSTEM_ADMIN")? (
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
                                        onSelect={e => { e.preventDefault(); e.stopPropagation(); }}
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
      {/* User Details Modal */}
      <Dialog open={isUserDetailsOpen} onOpenChange={(open) => {
        setIsUserDetailsOpen(open);
        if (!open) {
          setUserDetails(null);
          setSelectedUserId(null);
        }
      }}>
        <DialogContent className="max-w-2xl p-0">
          {userDetailsLoading ? (
            <div className="text-center py-16">Loading...</div>
          ) : userDetails ? (
            <div className="flex flex-col md:flex-row gap-6 p-10">
              <div className="flex flex-col items-center md:items-start md:w-1/3 border-r border-gray-200 pr-6">
                <Avatar className="w-28 h-28 mb-3 shadow-md">
                  <AvatarImage src={userDetails.profile_picture || "/placeholder.svg"} alt={userDetails.first_name} />
                  <AvatarFallback>{userDetails.first_name?.substring(0, 2)?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-xl font-bold text-gray-900 text-center md:text-left">{userDetails.first_name} {userDetails.last_name}</div>
                <div className="text-sm text-muted-foreground text-center md:text-left">{userDetails.email}</div>
                <Badge className="mt-2 text-xs px-3 py-1">{userDetails.role}</Badge>
                <div className="mt-2 text-xs text-gray-500">Joined: {userDetails.date_joined ? new Date(userDetails.date_joined).toLocaleDateString("en-GB") : ''}</div>
                <div className="text-xs text-gray-500">Last login: {userDetails.last_login ? new Date(userDetails.last_login).toLocaleString("en-GB") : ''}</div>
                <div className="mt-4 w-full">
                  <span className="font-semibold text-gray-700">Bio:</span>
                  <span className="text-gray-900 block mt-1">{userDetails.bio || '-'}</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 gap-y-2 gap-x-6 md:grid-cols-2">
                <div><span className="font-semibold text-gray-700">Username:</span> <span className="text-gray-900">{userDetails.username}</span></div>
                <hr className="my-1 col-span-2 border-gray-200" />
                <div><span className="font-semibold text-gray-700">Department:</span> <span className="text-gray-900">{userDetails.department || '-'}</span></div>
                <hr className="my-1 col-span-2 border-gray-200" />
                <div><span className="font-semibold text-gray-700">Number of Reports:</span> <span className="text-gray-900">{userDetails.number_of_reported_incidents ?? 0}</span></div>
                <hr className="my-1 col-span-2 border-gray-200" />
                <div><span className="font-semibold text-gray-700">Active:</span> <span className="text-gray-900">{userDetails.is_active ? 'Yes' : 'No'}</span></div>
                <hr className="my-1 col-span-2 border-gray-200" />
                <div><span className="font-semibold text-gray-700">Verified:</span> <span className="text-gray-900">{userDetails.is_verified ? 'Yes' : 'No'}</span></div>
                <hr className="my-1 col-span-2 border-gray-200" />
                <div><span className="font-semibold text-gray-700">Superuser:</span> <span className="text-gray-900">{userDetails.is_superuser ? 'Yes' : 'No'}</span></div>
                <hr className="my-1 col-span-2 border-gray-200" />
                <div><span className="font-semibold text-gray-700">Staff:</span> <span className="text-gray-900">{userDetails.is_staff ? 'Yes' : 'No'}</span></div>
                <hr className="my-1 col-span-2 border-gray-200" />
                <div><span className="font-semibold text-gray-700">Middle Name:</span> <span className="text-gray-900">{userDetails.middle_name || '-'}</span></div>
                <hr className="my-1 col-span-2 border-gray-200" />
                <div><span className="font-semibold text-gray-700">Groups:</span> <span className="text-gray-900">{Array.isArray(userDetails.groups) ? userDetails.groups.join(', ') : '-'}</span></div>
                <hr className="my-1 col-span-2 border-gray-200" />
                <div><span className="font-semibold text-gray-700">Permissions:</span> <span className="text-gray-900">{Array.isArray(userDetails.user_permissions) ? userDetails.user_permissions.join(', ') : '-'}</span></div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">No user details found.</div>
          )}
          <DialogFooter className="px-6 pb-4 pt-2">
            <DialogClose asChild>
              <Button variant="outline" className="w-full md:w-auto bg-blue-400 text-white">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>



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

            <RolesTabContent />
            <TabsContent value="investigating-team" className="mt-6">
              <Card>
                <CardHeader className="pb-2 w-full">
                  <CardTitle>Investigating Team</CardTitle>
                  <CardDescription>List, add, and remove investigating team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <InvestigatingTeamTabContent />
                </CardContent>
              </Card>
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
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
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

// --- RolesTabContent TabContent ---
function RolesTabContent() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newRoleId, setNewRoleId] = useState("")
  const [newRoleName, setNewRoleName] = useState("")
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const getRoles = useAuthStore((state) => state.getRoles)
  const createRole = useAuthStore((state) => state.createRoles)
  const deleteRole = useAuthStore((state) => state.deleteRole)
  const { toast } = useToast()

  // Fetch roles
  useEffect(() => {
    setLoading(true)
    getRoles('', {})
      .then((res: any) => {
        if (res && res.success && Array.isArray(res.data)) {
          setRoles(res.data)
        } else {
          setRoles([])
          setError(res?.message || "Failed to fetch roles.")
        }
      })
      .catch(() => setError("Failed to fetch roles."))
      .finally(() => setLoading(false))
  }, [getRoles])

  // Create new role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleId.trim() || !newRoleName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const payload = { id: newRoleId, name: newRoleName };
      const res = await createRole('', payload);
      if (res && res.success) {
        toast({ title: "Role created", description: `Role '${newRoleName}' created.`, variant: "success" });
        setNewRoleId("");
        setNewRoleName("");
        // Refresh roles
        const rolesRes = await getRoles('', {});
        if (rolesRes && rolesRes.success && Array.isArray(rolesRes.data)) setRoles(rolesRes.data);
      } else {
        setError(res?.message || "Failed to create role.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create role.");
    } finally {
      setCreating(false);
    }
  }

  // Delete role
  const handleDeleteRole = async (roleId: string) => {
    setDeletingId(roleId)
    setError(null)
    try {
      const res = await deleteRole(roleId, {})
      if (res && res.success) {
        toast({ title: "Role deleted", description: `Role deleted.`, variant: "destructive" })
        // Refresh roles
        const rolesRes = await getRoles('', {})
        if (rolesRes && rolesRes.success && Array.isArray(rolesRes.data)) setRoles(rolesRes.data)
      } else {
        setError(res?.message || "Failed to delete role.")
      }
    } catch (err: any) {
      setError(err?.message || "Failed to delete role.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <TabsContent value="roles" className="mt-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Role Management</CardTitle>
          <CardDescription>List, create, and delete user roles</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRole} className="flex flex-col md:flex-row gap-2 mb-6">
            <input
              type="text"
              className="border rounded px-3 py-2 w-full md:w-40"
              placeholder="Role ID (e.g. ADMIN)"
              value={newRoleId}
              onChange={e => setNewRoleId(e.target.value)}
              disabled={creating}
              required
            />
            <input
              type="text"
              className="border rounded px-3 py-2 w-full md:flex-1"
              placeholder="Role name (e.g. Admin)"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              disabled={creating}
              required
            />
            <Button type="submit" disabled={creating || !newRoleId.trim() || !newRoleName.trim()}>Create</Button>
          </form>
          {error && <div className="text-destructive mb-2">{error}</div>}
          {loading ? (
            <div>Loading roles...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">No roles found.</TableCell>
                  </TableRow>
                ) : (
                  roles.map((role: any) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={deletingId === role.id}
                        >
                          {deletingId === role.id ? "Deleting..." : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  )
}

