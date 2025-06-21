"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth"

const formSchema = z.object({
  // email: z.string().email({
  //   message: "Please enter a valid email address.",
  // }),
  username: z.string(),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // Use the login method from the zustand store
  const login = useAuthStore((state) => state.loginWithApi)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setIsLoading(true)

  try {
    const result = await login({ username: values.username, password: values.password })
console.log("Login result:", result)
    if (result.success) {
      toast({
        title: "Login successful",
        description: `Welcome back to Crowd Source, ${result.message.first_name} 😁`,
        variant: "success",
      })
      const searchParams = new URLSearchParams(window.location.search)
      const redirectTo = searchParams.get("redirect") || "/dashboard"
      router.push(redirectTo)
    } else {
      toast({
        title: "Login failed",
        description: result.message,
        variant: "destructive",
      })
      console.error("Login failed:", result.message)
    }
  } catch (error) {
    toast({
      title: "Unexpected error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    })
    console.error("Unexpected error:", error)
  } finally {
    setIsLoading(false)
  }
}

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard") // or your desired page
    }
  }, [isAuthenticated, router])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Shield className="h-12 w-12 text-campus-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          tabIndex={-1}
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in.." : "Login"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Link href="/reset-password" className="text-campus-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-campus-primary hover:underline">
              Sign up
            </Link>
          </div>
          <div className="text-center text-sm mt-2">
            <Link href="/" className="text-campus-primary hover:underline">
              Back to home
            </Link>
            </div>
        </CardFooter>
      </Card>

     
    </div>
  )
}
