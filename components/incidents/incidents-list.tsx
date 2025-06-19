"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowUpDown, Clock, Filter, MapPin, Search, ThumbsUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/auth"

export function IncidentsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) 

  const fetchIncidents = useAuthStore((state) => state.incidents)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    const fetchData = async () => {
      try {
        const res: any = await fetchIncidents()
        if (mounted) {
          if (res.success) {
            setIncidents(res.data)
            console.log(res.data)
          } else {
            setError(res.message || "Failed to fetch incidents")
          }
        }
      } catch (err) {
        if (mounted) setError("Failed to fetch incidents")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      mounted = false
    }
  }, [fetchIncidents])

// Get all unique tags from incidents
const tagMap = new Map<string, { id: string; name: string }>();
incidents.forEach((incident) => {
  (incident.tags || []).forEach((tag: { id: string; name: string }) => {
    if (!tagMap.has(tag.id)) {
      tagMap.set(tag.id, tag);
    }
  });
});
const allTags = Array.from(tagMap.values());

  // Filter and sort incidents
  const filteredIncidents = incidents
    .filter((incident) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        incident.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location?.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || incident.status === statusFilter

      // Severity filter
      const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter

      // Tags filter
      const matchesTags =
        selectedTags.length === 0 ||
        (Array.isArray(incident.tags) && incident.tags.some((tag: { id: string }) => selectedTags.includes(tag.id)))
      return matchesSearch && matchesStatus && matchesSeverity && matchesTags
    })
    .sort((a, b) => {
      // Sort by date, upvotes, or severity
      if (sortBy === "newest") {
        return new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      } else if (sortBy === "oldest") {
        return new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
      } else if (sortBy === "upvotes") {
        return (b.upvotes || 0) - (a.upvotes || 0)
      } else if (sortBy === "severity") {
        const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
        return (
          severityOrder[b.severity as keyof typeof severityOrder] -
          severityOrder[a.severity as keyof typeof severityOrder]
        )
      }
      return 0
    })

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="p-8 text-center">Loading incidents...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search incidents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    Tags
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {allTags.map((tag: { id: string; name: string }) => (
                    <DropdownMenuCheckboxItem
                      key={tag.id}
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTags([...selectedTags, tag.id])
                        } else {
                          setSelectedTags(selectedTags.filter((t) => t !== tag.id))
                        }
                      }}
                    >
                      {tag.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

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
                  <DropdownMenuCheckboxItem checked={sortBy === "upvotes"} onCheckedChange={() => setSortBy("upvotes")}>
                    Most Upvotes
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={sortBy === "severity"} onCheckedChange={() => setSortBy("severity")}>
                    Highest Severity
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              <div className="text-sm text-muted-foreground">
                {filteredIncidents.length} {filteredIncidents.length === 1 ? "incident" : "incidents"} found
              </div>
            </div>
            <Separator />

            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No incidents found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-start p-4">
                    <div
                      className={`p-2 rounded-full mr-4 ${
                        incident.severity === "high"
                          ? "bg-red-100 dark:bg-red-900"
                          : incident.severity === "medium"
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
                        {incident.date_created
                          ? new Date(incident.date_created).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : ""}
                      </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                        {Array.isArray(incident.tags) &&
                          incident.tags.map((tag: { id: string; name: string }) => (
                          <Badge key={tag.id} variant="outline" className="text-xs text-orange-600 bg-orange-100">
                            {tag.name}
                          </Badge>
                          ))}
                        </div>
                    </div>
                    <div className="ml-4 flex flex-col items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="text-xs">{incident.up_votes}</span>
                      <Button variant="outline" size="sm" asChild className="mt-2">
                        <Link href={`/incidents/${incident.id}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
