"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/auth"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  department: z.string().optional(),
  bio: z.string().max(500).optional(),
})

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()
  const [isMounted, setIsMounted] = useState(false)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      department: user?.department || "",
      bio: "",
    },
  })

  useEffect(() => {
    setIsMounted(true)
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
      setIsLoading(false)
    }, 1000)
  }

  if (!isMounted) {
    return null
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="container py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and profile information</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile information and personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user.avatar || "/avatars/01.png"} alt={user.name} />
                      <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                    <div className="text-center">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.role}</p>
                      <p className="text-xs text-muted-foreground">Joined {user.joinedAt}</p>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="hidden md:block" />
                  <Separator className="md:hidden" />

                  <div className="flex-1">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your.email@ui.edu.ng" {...field} disabled />
                              </FormControl>
                              <FormDescription>Your email address cannot be changed</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <FormControl>
                                <Input placeholder="Computer Science" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <textarea
                                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Tell us a bit about yourself"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Change Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications about campus incidents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-new-incident" className="flex-1">
                        New incidents in your area
                      </Label>
                      <input type="checkbox" id="email-new-incident" defaultChecked className="mr-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-updates" className="flex-1">
                        Updates to incidents you've reported
                      </Label>
                      <input type="checkbox" id="email-updates" defaultChecked className="mr-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-resolved" className="flex-1">
                        Resolved incidents
                      </Label>
                      <input type="checkbox" id="email-resolved" className="mr-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-digest" className="flex-1">
                        Weekly digest of campus incidents
                      </Label>
                      <input type="checkbox" id="email-digest" className="mr-2" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Push Notifications</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-new-incident" className="flex-1">
                        New incidents in your area
                      </Label>
                      <input type="checkbox" id="push-new-incident" defaultChecked className="mr-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-updates" className="flex-1">
                        Updates to incidents you've reported
                      </Label>
                      <input type="checkbox" id="push-updates" defaultChecked className="mr-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-resolved" className="flex-1">
                        Resolved incidents
                      </Label>
                      <input type="checkbox" id="push-resolved" className="mr-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-emergency" className="flex-1">
                        Emergency alerts
                      </Label>
                      <input type="checkbox" id="push-emergency" defaultChecked className="mr-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
