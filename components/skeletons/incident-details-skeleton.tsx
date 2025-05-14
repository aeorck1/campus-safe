import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function IncidentDetailsSkeleton() {
  return (
    <div>
      <div className="flex items-center mb-6">
        <Skeleton className="h-9 w-[80px] mr-4" />
        <Skeleton className="h-8 w-[300px]" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-6 w-[250px]" />
                  </div>
                  <div className="flex items-center mt-2">
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <Skeleton className="h-6 w-[80px]" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[80%] mb-4" />
              <div className="flex flex-wrap gap-2 mb-6">
                <Skeleton className="h-6 w-[80px]" />
                <Skeleton className="h-6 w-[100px]" />
                <Skeleton className="h-6 w-[90px]" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-[100px]" />
                <Skeleton className="h-9 w-[100px]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {Array(3)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-[100px]" />
                          <Skeleton className="h-3 w-[80px]" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[90%]" />
                      </div>
                    </div>
                  ))}
              </div>

              <div className="space-y-4">
                <Skeleton className="h-[100px] w-full" />
                <Skeleton className="h-9 w-[120px]" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full mb-4" />
              <Skeleton className="h-4 w-[200px]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(3)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-12 w-px" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px] mt-1" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(3)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-[180px]" />
                        <Skeleton className="h-3 w-[120px] mt-1" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
