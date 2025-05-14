"use client";

import dynamic from "next/dynamic";

const CampusMapView = dynamic(
  () => import("@/components/map/campus-map-view").then((mod) => mod.CampusMapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-250px)] min-h-[500px] bg-muted flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading map view...</div>
      </div>
    ),
  }
);

export default function MapClientWrapper() {
  return <CampusMapView />;
}
