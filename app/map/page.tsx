import dynamic from "next/dynamic"

// Dynamically import the CampusMapView component with no SSR
const CampusMapView = dynamic(() => import("@/components/map/campus-map-view").then((mod) => mod.CampusMapView), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-250px)] min-h-[500px] bg-muted flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading map view...</div>
    </div>
  ),
})

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campus Map</h1>
        <p className="text-muted-foreground">View all incidents on an interactive map</p>
      </div>

      <CampusMapView />
    </div>
  )
}
