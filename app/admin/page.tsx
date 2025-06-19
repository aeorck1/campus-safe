import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  return (
    <div className="space-y-6 w-[90%] m-auto mt-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight ">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, incidents, and platform settings</p>
      </div>

      <AdminDashboard />
    </div>
  )
}
