"use client"

import { useState, useEffect } from "react"
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
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

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
  const [downvoted, setDownvoted] = useState (false)

// Find the incident by ID
// Find the incident by ID
const incidents = useAuthStore((state) => state.incidents);
const upvote = useAuthStore((state) => state.voteIncident)

const postComment = useAuthStore((state) => state.postComment)
const [incident, setIncident] = useState<any>(null);
const loggedIn= useAuthStore((state) => state.user) !== null;

useEffect(() => {
  const fetchIncident = async () => {
    if (typeof incidents === "function") {
      const result = await incidents();
      console.log("Incidents fetched:", result)
      if (result && result.success && Array.isArray(result.data)) {
        const found = result.data.find((inc: any) => inc.id === id);
      
        setIncident(found);
        console.log("Foind ths",found)
      }
    }
  };
  fetchIncident();
}, [incidents, id]);

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

  const handleUpvote = async () => {
    const user = useAuthStore.getState().user
    if (!user) {
      toast({
        title: "You are not a logged in User",
        description: "Please log in to upvote incidents.",
        variant: "destructive",
      })
      return
    }
    try {
      setUpvoted(!upvoted)
      await upvote({ incident_id: incident.id, up_voted: !upvoted })
      toast({
        title: upvoted ? "Upvote removed" : "Incident upvoted",
        description: upvoted
          ? "You have removed your upvote from this incident"
          : "Thank you for confirming this incident",
        variant: upvoted ? "destructive" : "success",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update upvote. Please try again.",
        variant: "destructive",
      })
    }
  }

    const handleDownvote = async () => {
    const user = useAuthStore.getState().user
    if (!user) {
      toast({
        title: "You are not a logged in User",
        description: "Please log in to downvote incidents.",
        variant: "destructive",
      })
      return
    }
    try {
      setDownvoted(!downvoted)
      await upvote({ incident_id: incident.id, up_voted: downvoted })
      toast({
        title: downvoted ? "Downvote removed" : "Incident downvoted",
        description: downvoted
          ? "You have removed your downvote from this incident"
          : "Thank you for confirming this incident",
        variant: downvoted ? "destructive" : "success",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update downvote. Please try again.",
        variant: "destructive",
      })
    }
  }

const commentSchema = z.object({
  comment: z.string().min(1, "Comment cannot be empty").max(500, "Comment cannot exceed 500 characters"),

})

const handleCommentSubmit = async () => {
  if (isSubmitting || !incident || !comment.trim()) return;

  setIsSubmitting(true);

  try {
    const result = await postComment({
      object_id: incident.id,
      comment: comment.trim(),
      object_type: "INCIDENT",
    });

    if (result && result.success) {
      toast({
        title: "Comment added",
        description: "Your comment has been added to this incident",
        variant: "success",
      });
      setComment("");

      // Refetch incident
      const fetchedIncidents = await incidents();
      if (fetchedIncidents?.success) {
        const updatedIncident = fetchedIncidents.data.find((inc: any) => inc.id === id);
        setIncident(updatedIncident);
      }

    } else {
      toast({
        title: "Error adding comment",
        description: result?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error posting comment:", error);
    toast({
      title: "Unexpected error",
      description: "Something went wrong while posting your comment. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};


  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied",
      description: "Incident link copied to clipboard",
    })
  }

  return (
    <div>
      <div className="flex items-center mb-6 md:w-[100%] m-auto w-[95%]">
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
                    <CardTitle>{incident.title}</CardTitle>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {incident.location || "Unknown Location"}
                    <Separator orientation="vertical" className="mx-2 h-3" />
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {/* {incident.reportedAt} */}
                    {incident.date_created
                      ? new Date(incident.date_created).toLocaleDateString("en-GB")
                      : ""}
                    {/* {incident.reportedBy !== "anonymous" && (
                     */}
                     {incident.created_by_user !== "anonymous" && (
                        <>
                        <Separator orientation="vertical" className="mx-2 h-3" />
                        <User className="h-3.5 w-3.5 mr-1 font-[800] text-3xl" />
                        <span className="font-semibold text-secondary">
                          {incident.reported_by?.first_name
                          ? `${incident.reported_by.first_name} ${incident.reported_by.last_name}`
                          : incident.reported_by?.username || "Anonymous"}
                        </span>
                        </>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    incident.status === "RESOLVED"
                      ? "secondary"
                      : incident.status === "INVESTIGATING"
                        ? "outline"
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

              {/* Incident Images Section */}
              {incident.images && incident.images.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Images</h4>
                  <div className="flex gap-2 flex-wrap">
                    {incident.images.map((image: any, id: number) => (
                      <a
                        key={id}
                        href={typeof image === 'string' ? image : image.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-28 h-28 border rounded overflow-hidden hover:shadow-lg"
                      >
                        <img
                          src={typeof image === 'string' ? image : image.image}
                          alt={`Incident image ${id + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-6">
                {Array.isArray(incident.tags) &&
                  incident.tags.map((tag: { id: string; name: string }) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant={upvoted ? "default" : "outline"}
                  size="sm"
                  onClick={handleUpvote}
                  className="hover:opacity-80"
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Upvote {upvoted ? incident.up_votes + 1 : incident.up_votes}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={
                  handleDownvote}
                  className="hover:opacity-80"
                >
                  <ThumbsUp className="mr-2 h-4 w-4 rotate-180" />
                  Downvote {downvoted ? incident.down_votes + 1 : incident.down_votes}
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
                  incident.comments.map((comment:any) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>{comment.comment_by.first_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{comment.comment_by.first_name}</p>
                          <span className="text-xs text-muted-foreground">{comment.date_created
                            ? `${new Date(comment.date_created).toLocaleDateString("en-GB")} at ${new Date(comment.date_created).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                            : ""}</span>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
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
                maxLength={500}
                disabled={!loggedIn}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {comment.length}/500 characters
                </span>
                <Button 
                  onClick={handleCommentSubmit} 
                  disabled={!comment.trim() || isSubmitting || !useAuthStore.getState().user}
                >
                  {isSubmitting ? "Submitting..." : "Submit Comment"}
                </Button>
              </div>
              {!useAuthStore.getState().user && (
                <p className="text-xs text-muted-foreground mt-2">
                  Please <Link href="/login" className="underline text-primary">sign in</Link> to add a comment.
                </p>
              )}
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
                <CampusMap incidents={[incident]} center={[incident.latitude, incident.longitude]} zoom={17} />
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
                    <p className="text-xs text-muted-foreground">{incident.date_created
                            ? `${new Date(incident.date_created).toLocaleDateString("en-GB")} at ${new Date(incident.date_created).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                            : ""}</p>
                  </div>
                </div>

                {incident.comments &&
                  incident.comments.map((comment:any, index:any) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {index < incident.comments.length - 1 && <div className="h-full w-px bg-border" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Update from {comment.comment_by.first_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {comment.date_created
                            ? `${new Date(comment.date_created).toLocaleDateString("en-GB")} at ${new Date(comment.date_created).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}

                {incident.status && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          incident.status === "RESOLVED"
                            ? "bg-green-500"
                            : incident.status === "INVESTIGATING"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {incident.status.charAt(0) + incident.status.slice(1).toLowerCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {incident.date_last_modified
                          ? `${new Date(incident.date_last_modified).toLocaleDateString("en-GB")} at ${new Date(incident.date_last_modified).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                          : ""}
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
                {Array.isArray(incidents) &&
                  incidents
                    .filter(
                      (inc: any) =>
                        inc.id !== incident.id &&
                        Array.isArray(inc.tags) &&
                        Array.isArray(incident.tags) &&
                        (inc.tags.some((tag: string) => incident.tags.includes(tag)) ||
                          inc.location === incident.location)
                    )
                    .slice(0, 3)
                    .map((inc: any) => (
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

                {Array.isArray(incidents) &&
                  incidents.filter(
                    (inc: any) =>
                      inc.id !== incident.id &&
                      Array.isArray(inc.tags) &&
                      Array.isArray(incident.tags) &&
                      (inc.tags.some((tag: string) => incident.tags.includes(tag)) ||
                        inc.location === incident.location)
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground">No similar incidents found</p>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
