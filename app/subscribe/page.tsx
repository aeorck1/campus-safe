"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"

const emailOrPhoneSchema = z.object({
  email: z.string().email().optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Enter a valid 10-digit phone number")
    .optional(),
}).refine(
  (data) => !!data.email || !!data.phone,
  { message: "Please enter either an email or a phone number." }
)

export default function SubscribePage({ onClose }: { onClose?: () => void }) {
  const { toast } = useToast()
  const [form, setForm] = useState({ email: "", phone: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [alreadySubscribed, setAlreadySubscribed] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAlreadySubscribed(false)
    const result = emailOrPhoneSchema.safeParse({
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
    })
    if (!result.success) {
      toast({
        title: "Invalid input",
        description: result.error.errors[0].message,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const key = form.email.trim() || "+234" + form.phone.trim()
    if (localStorage.getItem("campus_subscribed_" + key)) {
      setAlreadySubscribed(true)
      setIsLoading(false)
      return
    }

    setTimeout(() => {
      localStorage.setItem("campus_subscribed_" + key, "1")
      setSubscribed(true)
      setIsLoading(false)
      toast({
        title: "Subscribed!",
        description: "You will now receive notifications for Incidents on Campus from SecureUI.",
        variant: "success",
      })
    }, 1200)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-end justify-end">
      <Card className="w-full max-w-md shadow-lg relative animate-slide-in-up">
        {onClose && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </Button>
        )}
        <CardHeader>
          <CardTitle className="text-2xl text-center">Subscribe to SecureUI</CardTitle>
          <CardDescription className="text-center">
            Get notified about important campus events and safety alerts. Enter your email or phone number below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscribed ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🎉</div>
              <div className="font-semibold text-green-700 mb-2">Subscription successful!</div>
              <div className="text-muted-foreground">You will receive notifications for campus events.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                disabled={isLoading || !!form.phone}
                autoComplete="email"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">+234</span>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={isLoading || !!form.email}
                  className="pl-14"
                  maxLength={10}
                  pattern="\d{10}"
                  autoComplete="tel"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || alreadySubscribed}
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
              {alreadySubscribed && (
                <div className="text-center text-red-600 text-sm mt-2">
                  You have already subscribed with this email or phone number.
                </div>
              )}
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground text-center">
            You can only subscribe once per email or phone number.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}