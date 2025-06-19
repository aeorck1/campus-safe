import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/auth"
import { useEffect, useState } from "react"

export function IncidentStats() {

  const [incidentStats, setIncidentsStats]=useState([])

  const fetchStats = useAuthStore((state) => state.getMyReportedIncidents)
  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchStats()
        setIncidentsStats(data.data)
        console.log("Here is the incident stats", data.data)
      } catch (error) {
        console.error(error)
      }
    }
    getStats()
  }, [])
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reported Incidents</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{incidentStats.length}</div>
          {/* <p className="text-xs text-muted-foreground">+5 from last week</p> */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">
            {incidentStats.filter((incident: any) => incident.status === "ACTIVE").length}
            </div>
          {/* <p className="text-xs text-muted-foreground">-2 from yesterday</p> */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
              {incidentStats.filter((incident: any) => incident.status === "RESOLVED").length}
          </div>
          {/* <p className="text-xs text-muted-foreground">+7 this week</p> */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investigation</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
              {incidentStats.filter((incident: any) => incident.status === "INVESTIGATING").length}
          </div>
          {/* <p className="text-xs text-muted-foreground">-8m from average</p> */}
        </CardContent>
      </Card>
    </>
  )
}
