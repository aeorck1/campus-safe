import { Suspense } from "react"
import { IncidentsList } from "@/components/incidents/incidents-list"
import { IncidentsListSkeleton } from "@/components/skeletons/incidents-list-skeleton"

export default function IncidentsPage() {
  return (
    <div className="space-y-6 flex-1  m-auto max-w-full md:w-[90%] w-[95%] my-[20px]">
      <div className="flex-1 space-y-16 justify-center m-auto max-w-full w-full">
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground">Browse and search all reported incidents</p>
      </div>

      <Suspense fallback={<IncidentsListSkeleton />}>
        <IncidentsList />
      </Suspense>
    </div>
  )
}
