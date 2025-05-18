"use client"

import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { AlertTriangle, ArrowLeft, Clock, MapPin, MessageSquare, Share2, ThumbsUp, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { mockIncidents } from "@/lib/mock-data"
import { useToast } from "@/components/ui/use-toast"

// Dynamically import the CampusMap component with no SSR
const CampusMap = dynamic(() => import("@/components/map/campus-map").then((mod) => mod.CampusMap), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] rounded-md border bg-muted flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading map...</div>
    </div>
  ),
})

export function IncidentDetails({ id }: { id: string }) {
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [upvoted, setUpvoted] = useState(false)

  // Find the incident by ID
  const incident = mockIncidents.find((inc) => inc.id === id)

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Incident Not Found</h2>
        <p className="text-muted-foreground mb-6">The incident you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/incidents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Incidents
          </Link>
        </Button>
      </div>
    )
  }

  const handleUpvote = () => {
    setUpvoted(!upvoted)
    toast({
      title: upvoted ? "Upvote removed" : "Incident upvoted",
      description: upvoted
        ? "You have removed your upvote from this incident"
        : "Thank you for confirming this incident",
    })
  }

  const handleCommentSubmit = () => {
    if (!comment.trim()) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Comment added",
        description: "Your comment has been added to this incident",
      })
      setComment("")
      setIsSubmitting(false)
    }, 1000)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied",
      description: "Incident link copied to clipboard",
    })
  }

  return (
    <div>
      <div className="flex items-center mb-6 md:w-[90%] m-auto w-[95%]">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href="/incidents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{incident.title}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-full ${
                        incident.severity === "high"
                          ? "bg-red-100 dark:bg-red-900"
                          : incident.severity === "medium"
                            ? "bg-yellow-100 dark:bg-yellow-900"
                            : "bg-blue-100 dark:bg-blue-900"
                      }`}
                    >
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          incident.severity === "high"
                            ? "text-red-600 dark:text-red-400"
                            : incident.severity === "medium"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-blue-600 dark:text-blue-400"
                        }`}
                      />
                    </div>
                    <CardTitle>{incident.title}</CardTitle>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {incident.location}
                    <Separator orientation="vertical" className="mx-2 h-3" />
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {incident.reportedAt}
                    {incident.reportedBy !== "anonymous" && (
                      <>
                        <Separator orientation="vertical" className="mx-2 h-3" />
                        <User className="h-3.5 w-3.5 mr-1" />
                        {incident.reportedBy}
                      </>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    incident.status === "resolved"
                      ? "outline"
                      : incident.status === "investigating"
                        ? "secondary"
                        : "destructive"
                  }
                  className="ml-2"
                >
                  {incident.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line mb-4">{incident.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {incident.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Button variant={upvoted ? "default" : "outline"} size="sm" onClick={handleUpvote} className="hover: opacity-80">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Upvote {upvoted ? incident.upvotes + 1 : incident.upvotes}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Comments and Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {incident.comments && incident.comments.length > 0 ? (
                  incident.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>{comment.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{comment.user}</p>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No comments yet</p>
                )}
              </div>

              <div className="space-y-4">
                <Textarea
                  placeholder="Add a comment or update..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleCommentSubmit} disabled={!comment.trim() || isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Comment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] rounded-md border mb-4">
                <CampusMap incidents={[incident]} center={incident.coordinates} zoom={17} />
              </div>
              <p className="text-sm text-muted-foreground">{incident.location}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="h-full w-px bg-border" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reported</p>
                    <p className="text-xs text-muted-foreground">{incident.reportedAt}</p>
                  </div>
                </div>

                {incident.comments &&
                  incident.comments.map((comment, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {index < incident.comments.length - 1 && <div className="h-full w-px bg-border" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Update from {comment.user}</p>
                        <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                      </div>
                    </div>
                  ))}

                {incident.status === "resolved" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Resolved</p>
                      <p className="text-xs text-muted-foreground">
                        {/* This would be the actual resolution date in a real app */}
                        {incident.comments && incident.comments.length > 0
                          ? incident.comments[incident.comments.length - 1].timestamp
                          : incident.reportedAt}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Similar Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockIncidents
                  .filter(
                    (inc) =>
                      inc.id !== incident.id &&
                      (inc.tags.some((tag) => incident.tags.includes(tag)) || inc.location === incident.location),
                  )
                  .slice(0, 3)
                  .map((inc) => (
                    <div key={inc.id} className="flex items-start gap-3">
                      <div
                        className={`p-1.5 rounded-full ${
                          inc.severity === "high"
                            ? "bg-red-100 dark:bg-red-900"
                            : inc.severity === "medium"
                              ? "bg-yellow-100 dark:bg-yellow-900"
                              : "bg-blue-100 dark:bg-blue-900"
                        }`}
                      >
                        <AlertTriangle
                          className={`h-3.5 w-3.5 ${
                            inc.severity === "high"
                              ? "text-red-600 dark:text-red-400"
                              : inc.severity === "medium"
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-blue-600 dark:text-blue-400"
                          }`}
                        />
                      </div>
                      <div>
                        <Link href={`/incidents/${inc.id}`} className="text-sm font-medium hover:underline">
                          {inc.title}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">{inc.location}</p>
                      </div>
                    </div>
                  ))}

                {mockIncidents.filter(
                  (inc) =>
                    inc.id !== incident.id &&
                    (inc.tags.some((tag) => incident.tags.includes(tag)) || inc.location === incident.location),
                ).length === 0 && <p className="text-sm text-muted-foreground">No similar incidents found</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
