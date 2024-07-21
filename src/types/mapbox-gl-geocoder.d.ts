declare module '@mapbox/mapbox-gl-geocoder' {
  import { Map } from 'mapbox-gl'

  interface MapBoxGeoCoderOptions {
    accessToken: string
    mapboxgl: typeof Map
    [key: string]: any
  }

  class MapBoxGeoCoder {
    constructor(options: MapBoxGeoCoderOptions)
    addTo(map: Map): this
    onAdd(map: Map): HTMLElement
    onRemove(): void
    setProximity(proximity: { longitude: number; latitude: number }): void
    getProximity(): { longitude: number; latitude: number }
    setRenderFunction(renderFunction: (feature: any) => string): void
    setFlyTo(flyTo: boolean | object): void
    setPlaceholder(placeholder: string): void
    setBbox(bbox: [number, number, number, number]): void
    setCountries(countries: string): void
    setTypes(types: string): void
    setMinLength(length: number): void
    setLimit(limit: number): void
    setFilter(filter: (feature: any) => boolean): void
    setOrigin(origin: string): void
  }

  export default MapBoxGeoCoder
}
