import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[350px] mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[150px]" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-10 w-[300px]" />

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-[120px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-7 w-[50px]" />
                    <Skeleton className="h-3 w-[100px] mt-2" />
                  </CardContent>
                </Card>
              ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <Skeleton className="h-5 w-[150px]" />
                <Skeleton className="h-4 w-[250px]" />
              </CardHeader>
              <CardContent className="p-0">
                <Skeleton className="h-[400px] rounded-md" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full mt-4" />
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-[150px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array(5)
                    .fill(null)
                    .map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
