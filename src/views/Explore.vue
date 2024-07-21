<script setup lang="ts">
import Popup from './Explore/Popup.vue'
import Post from './Gallery/Post.vue'
import { ref, onMounted, h, render } from 'vue'
import mapboxgl from 'mapbox-gl'
// @ts-ignore
import MapBoxGeoCoder, { Result } from '@mapbox/mapbox-gl-geocoder'
import MapBoxLanguage from '@mapbox/mapbox-gl-language'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/lib/mapbox-gl-geocoder.css'
import { useLoadingStore } from '../stores/loading'
import type { GeoJsonProperties } from 'geojson'
import { getAllPosts } from '@/api/photoPost/photoPost'
import type { PhotoPost } from '@/types/Post'

const mapContainer = ref<HTMLElement | null>(null)
let currentPopup: mapboxgl.Popup | null = null

const photoPostShow = ref(false)
const photoPostID = ref<number | null>(null)

function openPhoto(id: number) {
  photoPostID.value = id
  photoPostShow.value = true
}
function closePhoto() {
  photoPostShow.value = false
  photoPostID.value = null
}

onMounted(async () => {
  const loadingStore = useLoadingStore() //設置loading動畫頁
  loadingStore.setLoadingStatus(true)
  loadingStore.setInRequest(true)

  const response = await getAllPosts() //取得照片牆貼文資料
  const animalsDataset = response.value!
  console.log(animalsDataset)

  const geoJSONFeatures = animalsDataset.map((animalsData: PhotoPost) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: animalsData.geometry.coordinates
    },
    properties: {
      _id: animalsData.id,
      title: animalsData.title,
      location: animalsData.location,
      url: animalsData.images![0].url
    }
  }))

  mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_TOKEN

  //----定義地圖實例
  const map = new mapboxgl.Map({
    container: mapContainer.value!,
    style: 'mapbox://styles/mapbox/light-v10',
    center: [120.93874358912397, 23.92239934359359],
    zoom: 2
  })

  const language = new MapBoxLanguage({ defaultLanguage: 'zh-Hant' })
  map.addControl(language)

  function setPopup(coordinates: mapboxgl.LngLatLike, properties: GeoJsonProperties) {
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML('<div id="map-popup-content"></div>')
      .addTo(map)

    const popupComp = h(Popup, {
      properties: properties as any,
      onOpenPhoto: (id: number) => openPhoto(id)
    })

    render(popupComp, document.getElementById('map-popup-content')!)
  }

  const searchData = {
    features: geoJSONFeatures as unknown as Result[],
    type: 'FeatureCollection'
  }

  //定義地圖搜索函數
  function forwardGeocoder(query: string) {
    const matchingFeatures: Result[] = []
    for (const feature of searchData.features) {
      if (feature.properties!.title.toLowerCase().includes(query.toLowerCase())) {
        feature['place_name'] = feature.properties!.title
        feature['center'] = feature.geometry.coordinates
        feature['place_type'] = ['animal']
        matchingFeatures.push(feature)
      }
    }
    return matchingFeatures
  }

  //定義地圖地理編碼實例
  const geocoder = new MapBoxGeoCoder({
    accessToken: mapboxgl.accessToken,
    localGeocoder: forwardGeocoder,
    localGeocoderOnly: true,
    marker: false,
    language: 'zh-Hant',
    minLength: 1,
    zoom: 14,
    placeholder: '動物名稱',
    mapboxgl: mapboxgl
  })

  //將地圖設為2d平面
  map.dragRotate.disable()
  map.touchZoomRotate.disableRotation()

  map.on('load', () => {
    map.addSource('geoData', {
      // 掛載 geoData 數據，並設置集群
      type: 'geojson',
      data: { features: geoJSONFeatures } as any,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    })

    map.addLayer({
      //添加集群圈
      id: 'clusters',
      type: 'circle',
      source: 'geoData',
      filter: ['has', 'point_count'],
      paint: {
        //樣式及判定標準設置
        'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#3aba55', 20, '#f28cb1'],
        'circle-radius': ['step', ['get', 'point_count'], 10, 10, 20, 20, 30]
      }
    })

    map.addLayer({
      //添加符號(數字)
      id: 'cluster-count',
      type: 'symbol',
      source: 'geoData',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    })

    map.addLayer({
      //添加個體定位點
      id: 'unclustered-point',
      type: 'circle',
      source: 'geoData',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#51bbd6',
        'circle-radius': 5,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    })

    //集群點擊聚焦事件
    map.on('click', 'clusters', (e: { point: any }) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      })

      const clusterId = features[0].properties!.cluster_id
      ;(map.getSource('geoData') as any).getClusterExpansionZoom(
        clusterId,
        (err: Error | null, zoom: number) => {
          if (err) return

          map.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          })
        }
      )
    })

    //集群點擊彈窗事件
    // @ts-ignore
    map.on('click', 'unclustered-point', (e: { features: any }) => {
      const geometry = e.features![0].geometry
      if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
        // 这是一个点类型的地理要素
        const coordinates = geometry.coordinates
        setPopup(coordinates as mapboxgl.LngLatLike, e.features![0].properties)
      } else {
        // 处理其他地理要素类型或错误情况
      }
    })

    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = ''
    })

    //掛載地理編碼器
    map.addControl(geocoder)
    interface LocationData {
      result: any
      center: [number, number]
      geometry: {
        type: string
        coordinates: [number, number]
      }
      place_name: string
      place_type: string[]
      properties: {
        _id: string
        title: string
        location: string
        url: string
      }
      type: string
    }
    geocoder.on('result', (e: LocationData) => {
      if (currentPopup) {
        // @ts-ignore
        currentPopup.remove()
      }
      setPopup(e.result.center, e.result.properties)
    })
  })
  loadingStore.setInRequest(false)
  loadingStore.setLoadingStatus(false)
})
</script>

<template>
  <div class="flex h-screen flex-col">
    <div class="relative grow bg-stone-600 p-1 pt-0">
      <div ref="mapContainer" class="size-full rounded-sm"></div>
      <Post v-if="photoPostShow" :id="photoPostID!" @close="closePhoto" />
    </div>
  </div>
</template>

<style>
.mapboxgl-popup-anchor-top .mapboxgl-popup-tip,
.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip,
.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip {
  border-bottom-color: #57534e;
}

.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip,
.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip,
.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip {
  border-top-color: #57534e;
}

.mapboxgl-popup-anchor-left .mapboxgl-popup-tip {
  border-right-color: #57534e;
}

.mapboxgl-popup-anchor-right .mapboxgl-popup-tip {
  border-left-color: #57534e;
}

.mapboxgl-popup-content {
  border: none !important;
  box-shadow: none !important;
  background-color: transparent !important;
}

.mapboxgl-popup-close-button {
  display: none;
}
</style>
