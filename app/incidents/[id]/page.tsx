import { Suspense } from "react"
import { IncidentDetails } from "@/components/incidents/incident-details"
import { IncidentDetailsSkeleton } from "@/components/skeletons/incident-details-skeleton"

export default function IncidentPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 border-b pb-6">
      <Suspense fallback={<IncidentDetailsSkeleton />}>
        <IncidentDetails id={params.id} />
      </Suspense>
    </div>
  )
}
