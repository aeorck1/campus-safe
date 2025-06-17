"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

// Component to set the map view - dynamically imported
const SetMapView = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap } = mod
      return function SetMapViewComponent({ center, zoom }: { center: [number, number]; zoom: number }) {
        const map = useMap()
        useEffect(() => {
          map.setView(center, zoom)
        }, [center, zoom, map])
        return null
      }
    }),
  { ssr: false },
)

interface Incident {
  id: string
  title: string
  description: string
  location: string
  // coordinates: [number, number]
  latitude: number
  longitude: number
  status: string
  severity: string
  reportedAt: string
  tags: string[]
  upvotes: number
}

interface CampusMapProps {
  incidents: Incident[]
  center?: [number, number]
  zoom?: number
}

export function CampusMap({
  incidents,
  center = [7.4429, 3.8967], // Default to University of Ibadan coordinates
  zoom = 16,
}: CampusMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null)

  // Load Leaflet dynamically on client-side only
  useEffect(() => {
    setIsMounted(true)
    import("leaflet").then((L) => {
      setLeaflet(L)
      // Import Leaflet CSS
      import("leaflet/dist/leaflet.css")
    })
  }, [])

  // If not mounted or Leaflet not loaded yet, show loading state
  if (!isMounted || !leaflet) {
    return (
      <div className="h-full w-full bg-muted flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  // Create marker icons once Leaflet is loaded
  const markerIcon = (severity: string) => {
    // Different colors for different severity levels
    const iconUrl =
      severity === "high"
        ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
        : severity === "medium"
          ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png"
          : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png"

    return new leaflet.Icon({
      iconUrl,
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        scrollWheelZoom={false} // Disable scroll wheel zoom to prevent page scrolling issues
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetMapView center={center} zoom={zoom} />

        {incidents.map((incident) => (
          <Marker key={incident.id} position={[incident.latitude, incident.longitude]} icon={markerIcon(incident.severity)}>
            <Popup className="leaflet-popup">
              <div className="p-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{incident.title.substring(0, 5)}...</h3>
                  <Badge
                    variant={
                      incident.status === "resolved"
                        ? "outline"
                        : incident.status === "investigating"
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {incident.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{incident.description.substring(0, 100)}...</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {incident.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">{incident.reportedAt}</span>
                 {incident.id!=="new"? <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                    <Link href={`/incidents/${incident.id}`}>Details</Link>
                  </Button> : null}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
