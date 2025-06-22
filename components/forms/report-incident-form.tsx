"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { boolean, z } from "zod"
import { MapPin, AlertTriangle, Info, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { CampusMap } from "@/components/map/campus-map"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert } from "@/components/ui/alert"






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
  longitude: z.number().default(7.4443),
  latitude: z.number().default(3.9003),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"], {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return { message: "Please select a severity level." }
      }
      return { message: "Invalid severity level." }
    },
  }),
  tags: z.array(z.string()).default([]),
  anonymous: z.boolean().default(false),
  contactInfo: z.string().email("Please enter a valid email address.").optional().or(z.literal("")),
  images: z
    .array(
      z.object({
        name: z.string(),
        type: z.string().optional(),
      })
    )
    .optional()
    .default([]),
})

const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    const data = await response.json();
    return data.display_name || "Unknown location";
  } catch (error) {
    // Show toast if available in this scope
    if (typeof window !== "undefined") {
      // Dynamically import useToast to avoid hook usage outside component
  
    }
    return "Unknown location";
  }
};



export function ReportIncidentForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [coordinates, setCoordinates] = useState<[number, number]>([7.4443, 3.9003])
  const [isLocating, setIsLocating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags,setTagsData] = useState<{ id: string; label: string, name: string }[]>([])
  const [incidentTitles, setIncidentTitles] = useState<string[]>([])
  const report = useAuthStore((state)=> state.reportIncident)
  const anonymousReport = useAuthStore((state)=> state.reportIncidentAnonymous)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const incidents = useAuthStore((state)=> state.incidents)



const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    title: "",
    description: "",
    location: "",
    longitude: 7.4443,
    latitude: 3.9003,
    severity: "MEDIUM", // Updated to match schema
    tags: [],
    anonymous: !isAuthenticated, // Default to true if not authenticated
    contactInfo: "",
  },
})

 const watchedTitle = form.watch("title");
const watchedDescription = form.watch("description");
const isButtonDisabled = watchedTitle.trim().length < 5 || watchedDescription.trim().length < 10;
const watchedLocation = form.watch('location');
const watchedCoordinates = form.watch(['latitude', 'longitude']);
const watchedCategories = form.watch('tags');
const isStep2Disabled = watchedLocation.trim().length < 10 || watchedCoordinates.some(coord => coord === undefined) || watchedCategories.length === 0;
// Fetch tags from the store when the component mounts

  const fetchTags = useAuthStore((state) => state.getAllIncidentTags)
  useEffect(() => {
    const getTags = async () => {
      try {
        const data = await fetchTags()
        console.log("Tags Data:🚀🚀", data.data)
        setTagsData(data.data)
      } catch (error) {
        console.error("Error fetching tags:", error)
      }
    }
    getTags()
  }, [])

  useEffect(() => {
    const fetchIncidentTitles = async () => {
      if (typeof incidents === "function") {
        const result = await incidents()
        if (result && result.success && Array.isArray(result.data)) {
          const titles = result.data.map((inc: any) => inc.title)
          setIncidentTitles(titles)
          console.log("Incident Titles: ", titles)
        }
      }
    }
    fetchIncidentTitles()
  }, [incidents])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("location", values.location);
      formData.append("longitude", String(coordinates[1]));
      formData.append("latitude", String(coordinates[0]));
      formData.append("severity", values.severity);
      values.tags.forEach((tag) => formData.append("tags[]", tag));
      formData.append("anonymous", String(values.anonymous));
      if (values.contactInfo) formData.append("contactInfo", values.contactInfo);
      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("images", file);
        });
      }
      const result = await report(formData);
      if (result.success) {
        toast({
          title: "Incident reported successfully",
          description: "Your report has been submitted and will be reviewed shortly.",
          variant: "success",
        });
        router.push("/incidents");
      } else {
        toast({
          title: "Error reporting incident",
          description: result.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error submitting report",
        description: "An unexpected error occurred while submitting your report. Please try again later.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const onSubmitAnonymous = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("location", values.location);
      formData.append("longitude", String(coordinates[1]));
      formData.append("latitude", String(coordinates[0]));
      formData.append("severity", values.severity);
      values.tags.forEach((tag) => formData.append("tags[]", tag));
      formData.append("anonymous", String(values.anonymous));
      if (values.contactInfo) formData.append("contactInfo", values.contactInfo);
      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("images", file);
        });
      }
      const result = await anonymousReport(formData);
      if (result.success) {
        toast({
          title: "Incident reported successfully",
          description: "Your report has been submitted and will be reviewed shortly.",
          variant: "success",
        });
        router.push("/incidents");
      } else {
        toast({
          title: "Error reporting incident",
          description: result.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error submitting report",
        description: "An unexpected error occurred while submitting your report. Please try again later.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  // Handler to get user's current location
const handleDetectLocation = () => {
  setIsLocating(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const address = await reverseGeocode(latitude, longitude);

      setCoordinates([latitude, longitude]);
      console.log("Here is the coordinates", coordinates);
      form.setValue("location", address); // Set in the text box
toast({
  title: "Location Detected",
  description: "Your Location has been detected 📌",
  variant: "success"

})
      setIsLocating(false);

    },
    (error) => {
      console.error("Geolocation error:", error);
      toast({
        title: "Location error",
        description: "Unable to detect your location.",
        variant: "destructive",
      });
      setIsLocating(false);
    }
  );
};


  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // Duplicate detection state
const [isDuplicate, setIsDuplicate] = useState(false)

// Watch the title field and check for duplicates
useEffect(() => {
  const currentTitle = form.watch("title").trim().toLowerCase()
  if (currentTitle && incidentTitles.some(t => t.trim().toLowerCase() === currentTitle)) {
    setIsDuplicate(true)
  } else {
    setIsDuplicate(false)
  }
}, [form.watch("title"), incidentTitles])
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => {
        if (values.anonymous) {
          onSubmitAnonymous(values)
        } else {
          onSubmit(values)
        }
      })} className="space-y-8 ">
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
                  {isDuplicate && (
        <Alert variant="destructive" className="mt-2">
          <span className="font-semibold">Duplicate Report:</span> A report with this title already exists. Please check before submitting a new report.
        </Alert>
      )}
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
                          <RadioGroupItem value="LOW" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center">
                          <Info className="mr-2 h-4 w-4 text-blue-500" />
                          Low - Minor issue, no immediate danger
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="MEDIUM" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center">
                          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                          Medium - Concerning issue that needs attention
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="HIGH" />
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
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button
            type="button"
            onClick={() => setStep(2)}
            disabled={isButtonDisabled || isDuplicate}
          >
            Next Step
          </Button>
        </span>
      </TooltipTrigger>
      {isButtonDisabled && (
        <TooltipContent side="top">
          <p>
            Title must be at least 5 characters and description at least 10 characters.
          </p>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
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
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        title="Detect my location"
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Specify where the incident occurred. You can also use the pin icon to detect your current location.
                  </FormDescription>
                  <FormMessage />
                  {coordinates && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span>Latitude: {coordinates[0]}, Longitude: {coordinates[1]}</span>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-2">Pin Location on Map</p>
                <p className="text-xs text-muted-foreground mb-4">
                  {/* Click on the map to mark the exact location of the incident */}
                </p>
                <div className="h-[300px] rounded-md border">
                  <CampusMap 
                  incidents={[{
                    id: "new",
                    title: form.watch("title") || "New Incident",
                    description: form.watch("description") || "",
                    location: form.watch("location") || "",
                    longitude: coordinates[1],
                    latitude: coordinates[0],
                    status: "Reporting",
                    severity: form.watch("severity")?.toLowerCase() || "low",
                    reportedAt: new Date().toLocaleString(), // formatted date and time
                    tags: form.watch("tags") || [],
                    upvotes: 0,
                  }]} 
                  center={coordinates} 
                  zoom={16} 
                  />
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
                    {tags?.map((tag) => (
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
                              <FormLabel className="font-normal">{tag.name}</FormLabel>
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

            {/* Image Upload Section */}
            <div className="space-y-2">
              <FormLabel>Upload Images (optional, max 3)</FormLabel>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  // Combine with already selected files, but max 3
                  let newFiles = [...selectedFiles, ...files];
                  if (newFiles.length > 3) {
                    toast({
                      title: "Too many images",
                      description: "You can only upload up to 3 images.",
                      variant: "destructive"
                    });
                    // Only keep the first 3 files
                    newFiles = newFiles.slice(0, 3);
                  }
                  setSelectedFiles(newFiles);
                  form.setValue(
                    "images",
                    newFiles.map(file => ({
                      name: file.name,
                      type: file.type
                    }))
                  );
                  form.trigger("images");
                  // Reset input value so same file can be selected again if removed
                  e.target.value = "";
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                data-testid="incident-images-input"
                disabled={selectedFiles?.length >= 3}
              />
              <FormDescription>Attach up to 3 images to help describe the incident.</FormDescription>
              <div className="flex gap-2 mt-2 flex-wrap">
                {selectedFiles?.map((file, idx) => (
                  <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="object-cover w-full h-full" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-xs"
                      onClick={() => {
                        const newFiles = selectedFiles.filter((_, i) => i !== idx);
                        setSelectedFiles(newFiles);
                        form.setValue(
                          "images",
                          newFiles.map(f => ({
                            name: f.name,
                            type: f.type
                          }))
                        );
                        form.trigger("images");
                      }}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <FormMessage />
            </div>

             <div className="pt-4 flex justify-between">

              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Previous Step
              </Button>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button
            type="button"
            onClick={() => setStep(3)}
            // disabled={isButtonDisabled}
            disabled={isStep2Disabled}
          >
            Next Step
          </Button>
        </span>
      </TooltipTrigger>
      {isStep2Disabled && (
        <TooltipContent side="top">
          <p>
            Please fill in all required fields before proceeding to the next step.
          </p>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
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
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={!isAuthenticated} />
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
                <div>
                  <h4 className="text-sm font-medium">Images</h4>
                  <div className="flex gap-2 mt-1">
                    {selectedFiles && selectedFiles.length > 0 ? (
                      selectedFiles.map((file, idx) => (
                        <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                          <img src={URL.createObjectURL(file)} alt={file.name} className="object-cover w-full h-full" />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No images uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button type="button" onClick={() => setStep(2)}>
                Previous Step
              </Button>
              <Button type="submit" disabled={isSubmitting || isDuplicate}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  )
}
