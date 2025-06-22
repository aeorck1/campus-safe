"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { AlertTriangle, ArrowUpRight, Clock, Filter, MapPin, ThumbsUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { IncidentStats } from "@/components/dashboard/incident-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { mockIncidents } from "@/lib/mock-data"
import { useAuthStore } from "@/lib/auth"


// Dynamically import the CampusMap component with no SSR
const CampusMap = dynamic(() => import("@/components/map/campus-map").then((mod) => mod.CampusMap), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-md border bg-muted flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading map...</div>
    </div>
  ),
})

type Incident = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  severity: string;
  date_created?: string;
  reportedAt?: string;
  tags: any[];
  upvotes?: number;
};

export function IncidentDashboard() {
  const [incidents, setIncidents]= useState<Incident[]>([])
  const fetchIncidents = useAuthStore ((state) => state.incidents)
  useEffect (() => {
    fetchIncidents()
  .then ((data)=> {
    setIncidents(data.data)
    console.log("Incidents Data:🚀🚀", data.data)
  })
  // Add dependency array to useEffect
  .catch ((error) => {
    console.error("Error fetching incidents:", error)
  }
)
  }, [])
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6 md:w-[90%] m-auto my-[20px] w-[95%]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage campus incidents in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button asChild size="sm">
            <Link href="/report">Report Incident</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <IncidentStats />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Incident Map</CardTitle>
                <CardDescription>View incidents reported across campus</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] rounded-md border">
                  {/* <CampusMap incidents={mockIncidents as any} /> */}

                  <CampusMap incidents={incidents as any} />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full mt-4">
                  <Link href="/map">
                    View Full Map
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest incidents and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/incidents">
                    View All Incidents
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Recent Incidents</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {incidents.slice(-3).reverse().map((incident: any) => (
                <Card key={incident.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{incident.title}</CardTitle>
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
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {incident.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{incident.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {Array.isArray(incident.tags) &&
                        incident.tags.map((tag: { id: string; name: string }) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                        {new Date(incident.date_created).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        })}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="sr-only">Upvote</span>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/incidents/${incident.id}`}>Details</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campus Incident Map</CardTitle>
              <CardDescription>Interactive map of all reported incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] rounded-md border">
                <CampusMap incidents={incidents as any} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>A comprehensive list of recently reported incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.map((incident: any) => (
                  <div key={incident.id} className="flex items-start space-x-4 p-4 rounded-lg border">
                    <div
                      className={`p-2 rounded-full ${
                        incident.severity === "HIGH"
                          ? "bg-red-100 dark:bg-red-900"
                          : incident.severity === "MEDIUM"
                            ? "bg-yellow-100 dark:bg-yellow-900"
                            : "bg-blue-100 dark:bg-blue-900"
                      }`}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          incident.severity === "high"
                            ? "text-red-600 dark:text-red-400"
                            : incident.severity === "medium"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-blue-600 dark:text-blue-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{incident.title}</h4>
                        <Badge
                          variant={
                            incident.status === "resolved"
                              ? "outline"
                              : incident.status === "investigating"
                                ? "secondary"
                                : "destructive"
                          }
                          className="ml-2 shrink-0"
                        >
                          {incident.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{incident.description}</p>
                      <div className="mt-2 flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{incident.location}</span>
                        <Separator orientation="vertical" className="mx-2 h-3" />
                        <Clock className="h-3 w-3 mr-1" />
                        {incident.reportedAt}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {incident.tags.map((tag: { id: string; name: string }) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-center">{incident.upvotes}</span>
                      <Button variant="outline" size="sm" asChild className="mt-2">
                        <Link href={`/incidents/${incident.id}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
