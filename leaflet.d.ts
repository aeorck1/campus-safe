declare module "leaflet" {
  export type LatLngTuple = [number, number];
  export class Map {
    constructor(id: string, options?: MapOptions);
    setView(center: LatLngTuple, zoom: number): this;
  }
  export interface MapOptions {
    center?: LatLngTuple;
    zoom?: number;
  }
}