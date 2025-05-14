import { Suspense } from "react"
import { IncidentDashboard } from "@/components/dashboard/incident-dashboard"
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"

export default function DashboardPage() {
  return (
    <main className="flex-1">
      <Suspense fallback={<DashboardSkeleton />}>
        <IncidentDashboard />
      </Suspense>
    </main>
  )
}
