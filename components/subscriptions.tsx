"use client"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function SubscriptionsList() {
  const getAdminSubscription = useAuthStore((state) => state.adminGetSubscription)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true)
      try {
        const res = await getAdminSubscription()
        if (res && res.success && Array.isArray(res.data)) {
          setSubscriptions(res.data)
          console.log(res.data)
        } else {
          setSubscriptions([])
        }
      } catch {
        setSubscriptions([])
      } finally {
        setLoading(false)
      }
    }
    fetchSubscriptions()
  }, [getAdminSubscription])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Subscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : subscriptions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No subscriptions found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date Subscribed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub: any) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.email || <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell>{sub.phone_number || <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell>
                    {sub.date_created
                      ? new Date(sub.date_created).toLocaleString()
                      : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sub.active ? "success" : "secondary"}>
                      {sub.subscribed ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
