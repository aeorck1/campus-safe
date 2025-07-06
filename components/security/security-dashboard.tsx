"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { AlertTriangle, ArrowUpDown, Check, Clock, MoreHorizontal, Search, Shield, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockIncidents } from "@/lib/mock-data"
// Update the import path if use-toast is actually in a subfolder like 'ui'
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth"

// Dynamically import the CampusMap component with no SSR
const CampusMap = dynamic(() => import("@/components/map/campus-map").then((mod) => mod.CampusMap), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] rounded-md border bg-muted flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading map...</div>
    </div>
  ),
})

export function SecurityDashboard() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [incidentList, setIncidentLists]= useState([])
  const updateIncident = useAuthStore((state) => state.updateIncident)
  const assignIncident = useAuthStore ((state)=> state.assignInvestigatingTeam)
  const getSecurityStats = useAuthStore((state)=> state.securityGetStats)
  const getTeams = useAuthStore((state)=> state.getInvestigatingTeam)
  const [securityStats, setSecurityStats] = useState([])
  // const [incidentsList, setIncidents]= use


  const incidents = useAuthStore((state) => state.incidents)

useEffect(() => {
  const fetchStats = async () =>{
    try{
      const response = await getSecurityStats()
      if(response && response.success ===true){
        setSecurityStats(response.data) 
        console.log("Security stats fetched successfully:", response.data)
      }
    }
    catch(err){

    }
  }
  fetchStats()
}, [getSecurityStats])

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await incidents()
        if (response && response.success === true) {
          // Assuming the response data is an array of incidents
          setIncidentLists(response.data)
          console.log("Incidents fetched successfully:", response.data)
         
        }

      } catch (error) {
      
      }
    }
    fetchIncidents()
  }, [incidents])

  // Filter and sort incidents
  const filteredIncidents = incidentList
    .filter((incident) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || incident.status === statusFilter

      // Severity filter
      const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter

      return matchesSearch && matchesStatus && matchesSeverity
    })
    .sort((a, b) => {
      // Sort by date, upvotes, or severity
      if (sortBy === "newest") {
        return new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      } else if (sortBy === "oldest") {
        return new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
      } else if (sortBy === "severity") {
        const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
        return (
          severityOrder[b.severity as keyof typeof severityOrder] -
          severityOrder[a.severity as keyof typeof severityOrder]
        )
      }
      return 0
    })

  const handleResolveIncident = async (incidentId: string) => {
    const result = await updateIncident(incidentId, { status: "RESOLVED" })
    if (result && result.success) {
      const resolvedIncident = incidentList.find((incident) => incident.id === incidentId)
      toast({
        title: "Incident resolved",
        description: `Incident "${resolvedIncident?.title || incidentId}" has been resolved.`,
        variant: "success",
      })
    }
    // Refresh incidents after resolving
    const response = await incidents()
    if (response && response.success && Array.isArray(response.data)) {
      setIncidentLists(response.data)

    }
  }



  const handleAssignIncident = async (incidentId: string) => {
    const result = await assignIncident(incidentId)
    if (result && result.success) {
      toast({
        title: "Incident assigned",
        description: "The incident has been assigned to the security team.",
        variant: "success",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <TabsList>
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-campus-primary data-[state=active]:text-white"
            >
              Active Incidents
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-campus-primary data-[state=active]:text-white">
              All Incidents
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-campus-primary data-[state=active]:text-white">
              Map View
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search incidents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={sortBy === "newest"} onCheckedChange={() => setSortBy("newest")}>
                  Newest First
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={sortBy === "oldest"} onCheckedChange={() => setSortBy("oldest")}>
                  Oldest First
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={sortBy === "severity"} onCheckedChange={() => setSortBy("severity")}>
                  Highest Severity
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-campus-primary/30 bg-campus-primary/10 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-blue-900">Total Incidents</CardTitle>
                <CardDescription className="text-blue-800">Total number of incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-blue-900 drop-shadow">{securityStats.total_incidents}</div>
              </CardContent>
            </Card>

            <Card className="border-campus-warning/30 bg-campus-warning/10 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-yellow-900">Under Investigation</CardTitle>
                 <ShieldAlert className="h-4 w-4 text-campus-warning" />
                <CardDescription className="text-yellow-800">Currently being addressed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-yellow-900 drop-shadow">{securityStats.investigating_incidents}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-tr from-green-300 via-green-100 to-white border-green-400/70 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-green-900">Recently Resolved</CardTitle>
                <CardDescription className="text-green-800">Incidents Resolved Today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-green-900 drop-shadow">{securityStats.total_resolved_today}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-tr from-purple-300 via-purple-100 to-white border-purple-400/70 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-purple-900">Security Personnel</CardTitle>
                <CardDescription className="text-purple-800">Currently on duty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-purple-900 drop-shadow">{securityStats.total_security_personnel}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-tr from-red-300 via-red-100 to-white border-red-400/70 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-red-900">Active Incidents</CardTitle>
                <CardDescription className="text-red-800">Currently being addressed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-red-900 drop-shadow">{securityStats.active_incidents}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-tr from-emerald-300 via-emerald-100 to-white border-emerald-400/70 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-emerald-900">Total Resolved Incidents</CardTitle>
                <CardDescription className="text-emerald-800">Total Incidents Resolved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-emerald-900 drop-shadow">{securityStats.resolved_incidents}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Incidents</CardTitle>
              <CardDescription>Incidents requiring security team attention</CardDescription>
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
                  {filteredIncidents
                    .filter((incident) => incident.status !== "RESOLVED")
                    .map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-1.5 rounded-full ${incident.severity === "HIGH"
                                  ? "bg-red-100 dark:bg-red-900 pulse-animation"
                                  : incident.severity === "MEDIUM"
                                    ? "bg-yellow-100 dark:bg-yellow-900"
                                    : "bg-blue-100 dark:bg-blue-900"
                                }`}
                            >
                              <AlertTriangle
                                className={`h-4 w-4 ${incident.severity === "HIGH"
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
                            <span className="text-sm">{incident.date_created?
                          new Date(incident.date_created).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }) : "N/A" 
                          }</span>
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
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/incidents/${incident.id}`}>
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAssignIncident(incident.id)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Assign to Team
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResolveIncident(incident.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Mark as Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}

                  {filteredIncidents.filter((incident) => incident.status !== "RESOLVED").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center">
                          <Check className="h-8 w-8 text-campus-secondary mb-2" />
                          <p className="text-muted-foreground">No active incidents found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Incidents</CardTitle>
              <CardDescription>Complete list of campus incidents</CardDescription>
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
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-full ${incident.severity === "high"
                                ? "bg-red-100 dark:bg-red-900"
                                : incident.severity === "medium"
                                  ? "bg-yellow-100 dark:bg-yellow-900"
                                  : "bg-blue-100 dark:bg-blue-900"
                              }`}
                          >
                            <AlertTriangle
                              className={`h-4 w-4 ${incident.severity === "high"
                                  ? "text-red-600 dark:text-red-400"
                                  : incident.severity === "medium"
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
                          <span className="text-sm">{incident.date_created? new Date(incident.date_created).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }) : " "}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/incidents/${incident.id}`}>View Details</Link>
                        </Button>
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

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Map</CardTitle>
              <CardDescription>Geographic view of all campus incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] rounded-md border">
                <CampusMap incidents={filteredIncidents} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
