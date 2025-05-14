"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { MapPin, AlertTriangle, Info, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { CampusMap } from "@/components/map/campus-map"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  location: z.string().min(3, {
    message: "Location is required.",
  }),
  severity: z.enum(["low", "medium", "high"], {
    required_error: "Please select a severity level.",
  }),
  tags: z.array(z.string()).min(1, {
    message: "Please select at least one tag.",
  }),
  anonymous: z.boolean().default(false),
  contactInfo: z.string().email().optional(),
})

export function ReportIncidentForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [coordinates, setCoordinates] = useState<[number, number]>([34.0522, -118.2437])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      severity: "medium",
      tags: [],
      anonymous: false,
      contactInfo: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log({ ...values, coordinates })

    toast({
      title: "Incident reported successfully",
      description: "Your report has been submitted and will be reviewed shortly.",
    })

    setIsSubmitting(false)
    router.push("/")
  }

  const tags = [
    { id: "property-damage", label: "Property Damage" },
    { id: "safety-hazard", label: "Safety Hazard" },
    { id: "security-concern", label: "Security Concern" },
    { id: "theft", label: "Theft" },
    { id: "vandalism", label: "Vandalism" },
    { id: "suspicious-activity", label: "Suspicious Activity" },
    { id: "facility-issue", label: "Facility Issue" },
    { id: "accessibility", label: "Accessibility Issue" },
    { id: "other", label: "Other" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                1
              </div>
              <h2 className="text-xl font-semibold">Incident Details</h2>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title describing the incident" {...field} />
                  </FormControl>
                  <FormDescription>Provide a clear, concise title for the incident</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what happened in detail" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormDescription>
                    Include relevant details such as time, people involved, and any other important information
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Severity Level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="low" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center">
                          <Info className="mr-2 h-4 w-4 text-blue-500" />
                          Low - Minor issue, no immediate danger
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="medium" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center">
                          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                          Medium - Concerning issue that needs attention
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="high" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center">
                          <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                          High - Urgent situation requiring immediate response
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end">
              <Button type="button" onClick={() => setStep(2)}>
                Next Step
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                2
              </div>
              <h2 className="text-xl font-semibold">Location & Categories</h2>
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      <Input placeholder="Building name, room number, or area" {...field} />
                      <Button type="button" variant="outline" size="icon" className="shrink-0">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>Specify where the incident occurred</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-2">Pin Location on Map</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Click on the map to mark the exact location of the incident
                </p>
                <div className="h-[300px] rounded-md border">
                  <CampusMap incidents={[]} center={coordinates} zoom={16} />
                </div>
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Categories</FormLabel>
                    <FormDescription>Select all categories that apply to this incident</FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {tags.map((tag) => (
                      <FormField
                        key={tag.id}
                        control={form.control}
                        name="tags"
                        render={({ field }) => {
                          return (
                            <FormItem key={tag.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(tag.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, tag.id])
                                      : field.onChange(field.value?.filter((value) => value !== tag.id))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{tag.label}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Previous Step
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Next Step
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                3
              </div>
              <h2 className="text-xl font-semibold">Contact Information</h2>
            </div>

            <FormField
              control={form.control}
              name="anonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Submit this report anonymously</FormLabel>
                    <FormDescription>
                      Your identity will not be associated with this report. Note that this may limit our ability to
                      follow up for additional information.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {!form.watch("anonymous") && (
              <FormField
                control={form.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@university.edu" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide your email if you'd like to receive updates about this report
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="rounded-lg border bg-card p-6 mt-6">
              <h3 className="font-medium flex items-center mb-4">
                <Check className="mr-2 h-5 w-5 text-green-500" />
                Review Your Report
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Title</h4>
                  <p className="text-sm text-muted-foreground">{form.watch("title") || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">{form.watch("description") || "Not provided"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Location</h4>
                    <p className="text-sm text-muted-foreground">{form.watch("location") || "Not provided"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Severity</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {form.watch("severity") || "Not selected"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Categories</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {form.watch("tags").length > 0 ? (
                      form.watch("tags").map((tag) => (
                        <div key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                          {tags.find((t) => t.id === tag)?.label || tag}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No categories selected</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Reporting</h4>
                  <p className="text-sm text-muted-foreground">
                    {form.watch("anonymous") ? "Anonymous report" : "Non-anonymous report"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Previous Step
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  )
}
