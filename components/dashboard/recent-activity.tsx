import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      user: {
        name: "John Doe",
        avatar: "/avatars/01.png",
        initials: "JD",
      },
      action: "reported",
      incident: "Broken window in Science Building",
      time: "10 minutes ago",
    },
    {
      id: 2,
      user: {
        name: "Security Team",
        avatar: "/avatars/02.png",
        initials: "ST",
      },
      action: "updated",
      incident: "Suspicious activity near dorms",
      time: "25 minutes ago",
    },
    {
      id: 3,
      user: {
        name: "Admin",
        avatar: "/avatars/03.png",
        initials: "AD",
      },
      action: "resolved",
      incident: "Power outage in Library",
      time: "1 hour ago",
    },
    {
      id: 4,
      user: {
        name: "Jane Smith",
        avatar: "/avatars/04.png",
        initials: "JS",
      },
      action: "commented on",
      incident: "Parking violation",
      time: "2 hours ago",
    },
    {
      id: 5,
      user: {
        name: "Mike Johnson",
        avatar: "/avatars/05.png",
        initials: "MJ",
      },
      action: "upvoted",
      incident: "Broken light in parking lot",
      time: "3 hours ago",
    },
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              <span className="text-muted-foreground">{activity.action}</span>{" "}
              <span className="font-medium">{activity.incident}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
