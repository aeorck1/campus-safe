import { Suspense } from "react"
import { IncidentDetails } from "@/components/incidents/incident-details"
import { IncidentDetailsSkeleton } from "@/components/skeletons/incident-details-skeleton"

export default async function IncidentPage({ params }: { params: { id: string } }) {
   const {id}= await params
  return (
    <div className="space-y-6 border-b pb-6 m-auto max-w-full md:w-[90%] w-[95%] my-[20px]">
      <Suspense fallback={<IncidentDetailsSkeleton />}>
        <IncidentDetails id={id} />
      </Suspense>
    </div>
  )
}
