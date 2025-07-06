import { AlertTriangle, CheckCircle2, Clock, Shield, ShieldAlert } from "lucide-react"

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
      <Card className="border-campus-primary/30 bg-campus-primary/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-campus-primary">Reported Incidents</CardTitle>
          <AlertTriangle className="h-4 w-4 text-campus-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-campus-primary">{incidentStats.length}</div>
        </CardContent>
      </Card>
      <Card className="border-campus-warning/30 bg-campus-warning/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-campus-warning">Active Incidents</CardTitle>
          <ShieldAlert className="h-4 w-4 text-campus-warning" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-campus-warning">
            {incidentStats.filter((incident: any) => incident.status === "ACTIVE").length}
            </div>
        </CardContent>
      </Card>
      <Card className="border-campus-secondary/30 bg-campus-secondary/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-campus-secondary">Resolved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-campus-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-campus-secondary">
              {incidentStats.filter((incident: any) => incident.status === "RESOLVED").length}
          </div>
        </CardContent>
      </Card>
      <Card className="border-campus-accent/30 bg-campus-accent/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-campus-accent">Investigation</CardTitle>
          <Clock className="h-4 w-4 text-campus-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-campus-accent">
              {incidentStats.filter((incident: any) => incident.status === "INVESTIGATING").length}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
