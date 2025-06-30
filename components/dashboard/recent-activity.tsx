import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { RecentActivity } from "@/lib/auth"
import { useAuthStore } from "@/lib/auth"
import { useEffect, useState } from "react"


export function RecentActivity() {


  const [activities, setActivities] = useState<RecentActivity[]>([]) 

    const getRecentActivity = useAuthStore ((state) => state.getRecentActivity)
    useEffect(() => {
      const fetchActivities = async () => {
        try {
          const data = await getRecentActivity()
          setActivities(data.data)
          console.log("Activities Data:🚀🚀", data.data)
        } catch (error) {
          console.error("Error fetching activities:", error)
        }
      }
      fetchActivities()
    }, [])



  return (
    <div className="space-y-4">
      {activities.slice(0, 7).map((activity) => (
        <div key={activity.id} className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            {/* <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user} /> */}
            <AvatarFallback>{activity.initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm">
              {/* <span className="font-medium">{activity.user.name}</span>{" "} */}
              <span className="text-muted-foreground">{activity.description}</span>{" "}
              {/* <span className="font-medium">{activity.incident}</span> */}
            </p>
            <p className="text-xs text-muted-foreground">{activity.time_ago}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
