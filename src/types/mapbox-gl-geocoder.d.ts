declare module '@mapbox/mapbox-gl-geocoder' {
  import { Map, MapboxOptions } from 'mapbox-gl'

  interface MapBoxGeoCoderOptions {
    accessToken: string
    mapboxgl: typeof Map
    marker?: boolean | object
    bbox?: [number, number, number, number]
    proximity?: { longitude: number; latitude: number }
    countries?: string
    types?: string
    minLength?: number
    limit?: number
    language?: string
    placeholder?: string
    zoom?: number
    flyTo?: boolean | object
    render?: (feature: any) => string
    getItemValue?: (feature: any) => string
    localGeocoder?: (query: string) => any[]
    filter?: (feature: any) => boolean
    origin?: string
  }

  class MapBoxGeoCoder {
    constructor(options: MapBoxGeoCoderOptions)
    addTo(map: Map): this
    onAdd(map: Map): HTMLElement
    onRemove(): void
    getProximity(): { longitude: number; latitude: number }
    setProximity(proximity: { longitude: number; latitude: number }): void
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
    on(type: string, fn: (event: any) => void): this
    off(type: string, fn: (event: any) => void): this
  }

  export default MapBoxGeoCoder
}
