import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function IncidentsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <Skeleton className="h-10 flex-1" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-[130px]" />
          <Skeleton className="h-10 w-[130px]" />
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <Skeleton className="h-5 w-[150px]" />
        </div>
        <Separator />

        <div className="divide-y">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="flex items-start p-4">
                <Skeleton className="h-9 w-9 rounded-full mr-4" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-[200px]" />
                    <Skeleton className="h-5 w-[80px] ml-2" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[80%]" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-[120px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-[60px]" />
                    <Skeleton className="h-5 w-[80px]" />
                    <Skeleton className="h-5 w-[70px]" />
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-3 w-4 mt-1" />
                  <Skeleton className="h-8 w-16 mt-2" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
