"use client"

import { useEffect, useState } from "react"
import { Filter, Layers } from "lucide-react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockIncidents } from "@/lib/mock-data"
import { AuthState, useAuthStore } from "@/lib/auth"

// Dynamically import the CampusMap component with no SSR
const CampusMap = dynamic(() => import("@/components/map/campus-map").then((mod) => mod.CampusMap), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-250px)] min-h-[500px] bg-muted flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading map...</div>
    </div>
  ),
})

export function CampusMapView() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [mapLayer, setMapLayer] = useState("default")
  const [fetchedIncident, setIncidents] = useState<AuthState[]>([])

  const incidents = useAuthStore((state)=>state.incidents)

useEffect(() => {
    // Fetch incidents from the server or API if needed
    const fetchIncidents = async () => {
      try {
        const data = await incidents()
        console.log("Here are the incident data",data.data)
        setIncidents(data.data)
      }
      catch(error){
        console.log("Error fetching incidents:", error)
      }
    }
    fetchIncidents()
  }, [])


  // Filter incidents
  const filteredIncidents = fetchedIncident.filter((incident) => {
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter
    const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter
    return matchesStatus && matchesSeverity
  })

  return (
    <div className="space-y-4 flex-1 m-auto max-w-full md:w-[90%] w-[95%] my-[20px]">
      <div className="flex flex-wrap gap-2">
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

        <Select value={mapLayer} onValueChange={setMapLayer}>
          <SelectTrigger className="w-[130px]">
            <Layers className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Map Layer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="satellite">Satellite</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="h-[calc(100vh-250px)] min-h-[500px]">
            <CampusMap incidents={filteredIncidents} />
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">Showing {filteredIncidents.length} incidents on the map</div>
    </div>
  )
}