<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapBoxGeoCoder from '@mapbox/mapbox-gl-geocoder'
import MapBoxLanguage from '@mapbox/mapbox-gl-language'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/lib/mapbox-gl-geocoder.css'
import {  XCircleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import { useUserStore } from '../../stores/user'
import { useLoadingStore } from '../../stores/loading'
import { createPost } from '@/api/photoPost/photoPost'
import router from '../../router'
import { postImages } from '@/api/image/image'
import type { PhotoPost } from '@/types/Post'
import type { User } from '@/types/User'
import type { Image } from '@/types/Common'

//----cloudinary&圖片預覽----
const previewImg = ref<number>(0) //紀錄所選預覽大圖

const imgInput = ref<HTMLInputElement>()

const previewUrls = ref<string[]>([])
const showPreview = ref<boolean>(false)

const previewImages = () => {
  previewImg.value = 0
  if (imgInput.value) {
    const inputElement = imgInput.value
    if (inputElement.files) {
      const selectedFiles = Array.from(inputElement.files)
      const urls = selectedFiles.map((file) => URL.createObjectURL(file))
      previewUrls.value = urls
    }
  }
}

let createPostImages: Image[] = [] //儲存最終提交之圖片資料
const uploadImages = async () => {
  const inputElement = imgInput.value

  if (inputElement) {
    const files = inputElement.files as unknown as File[]

    createPostImages = await postImages(files, 'photoPost')
  }
}

//----mapbox地圖----
mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_TOKEN

const mapContainer = ref<HTMLElement | null>(null)

//----表單----

const newPost = ref({
  title: '',
  location: '',
  coordinates: [],
  description: ''
})

//表單提交驗證失敗彈窗
const showDialog = ref(false)
const dialogData = ref({
  title: '',
  content: '',
  warringStyle: false
})

////表單驗證
type FieldName = 'title' | 'description'
const postInputInvalid = ref({
  title: true,
  description: true
})

function countCharacters(text: string) {
  let totalWeight = 0
  for (const char of text) {
    if (/[\u4e00-\u9fa5\u3100-\u312F]/.test(char)) {
      totalWeight += 2
    } else if (/^[A-Za-z0-9]+$/.test(char)) {
      totalWeight += 1
    } else if (/[「」{}.,;:!?-、...。，；：！？_、，"'：]/.test(char)) {
      totalWeight += 1
    }
  }
  return totalWeight
}

async function validateInput(fieldName: FieldName) {
  let isValid = true
  let value = newPost.value[fieldName]

  value = value.replace(/\s/g, '')
  let totalCharacters = countCharacters(value)
  switch (fieldName) {
    case 'title':
      isValid = totalCharacters >= 4 && totalCharacters <= 30
      break
    case 'description':
      isValid = totalCharacters >= 10 && totalCharacters <= 200
      break
    default:
      break
  }
  postInputInvalid.value[fieldName] = isValid
}

////表單提交
const submitNewPost = async () => {
  const loadingStore = useLoadingStore()
  loadingStore.setLoadingStatus(true) //loading動畫設置
  loadingStore.setInRequest(true)
  loadingStore.setIsCountingSeconds(true)
  loadingStore.setIsCountingSeconds(false)

  const userStore = useUserStore()

  if (!userStore.isLogin || !userStore.getData()) {
    router.push({ name: 'Login' })
    return
  }

  const user: User = userStore.getData()!
  await uploadImages()
  const imageIds: number[] = createPostImages.map((image) => image.id!)

  const submitForm: PhotoPost = {
    authorId: user.id,
    title: newPost.value.title,
    location: newPost.value.location,
    geometry: {
      type: 'point',
      coordinates: newPost.value.coordinates
    },
    description: newPost.value.description,
    imageIds,
    views: 0,
    likes: 0,
    isEdit: false,
    id: 0,
    comments: [],
    author: user,
    createdAt: ''
  }

  await createPost(submitForm).catch((err) => console.error('建立時貼文出錯:', err))
  dialogData.value.title = '貼文建立成功'
  dialogData.value.content = '將跳轉回照片牆'
  dialogData.value.warringStyle = false
  showDialog.value = true
  loadingStore.setInRequest(false)
  loadingStore.setLoadingStatus(false)

  await new Promise((resolve) => {
    watch(showDialog, (newValue) => {
      if (!newValue) {
        resolve(true)
      }
    })
  })
  router.push({ name: 'Gallery' })
}

const handleSubmit = async () => {
  //驗證失敗
  if (!imgInput.value) {
    return
  }
  const verification =
    postInputInvalid.value.title &&
    postInputInvalid.value.description &&
    imgInput.value.files?.length &&
    newPost.value.location
  if (!verification) {
    dialogData.value.title = '貼文建立失敗'
    dialogData.value.warringStyle = true
    if (!newPost.value.location) {
      dialogData.value.content = '請選擇照片拍攝之地點'
    } else if (!postInputInvalid.value.title) {
      dialogData.value.content = '請填入正確格式之標題'
    } else if (!postInputInvalid.value.description) {
      dialogData.value.content = '請填入正確格式之敘述'
    } else if (!imgInput.value.files?.length) {
      dialogData.value.content = '請選擇欲上傳之圖片'
    }
    showDialog.value = true
    return
  }

  //驗證成功
  await submitNewPost()
}

onMounted(async () => {
  const map = new mapboxgl.Map({
    container: mapContainer.value!,
    style: 'mapbox://styles/mapbox/light-v10',
    center: [120.93874358912397, 23.92239934359359],
    zoom: 3,
    interactive: false
  })

  const language = new MapBoxLanguage({ defaultLanguage: 'zh-Hant' })
  map.addControl(language)

  const geoCoder = new MapBoxGeoCoder({
    accessToken: mapboxgl.accessToken,
    language: 'zh-TW',
    marker: true,
    types: 'country, region',
    mapboxgl: mapboxgl
  })

  map.addControl(geoCoder)

  geoCoder.on('result', (event: mapboxgl.EventData) => {
    newPost.value.location = event.result.place_name
    newPost.value.coordinates = event.result.center
  })
})
</script>

<template>
  <div class="flex-1 bg-stone-100">
    <div
      class="mx-auto my-12 flex w-[90%] flex-col gap-4 overflow-auto border-4 border-stone-500 bg-stone-100 sm:w-4/5 xl:w-1/2"
    >
      <div class="mb-8 flex w-full flex-col">
        <h3 class="w-full bg-stone-500 p-1 text-center text-lg font-bold text-white">
          創建新照片
        </h3>
        <!-- <div class="border-t-2 my-4 mt-10 border-stone-500 w-full"></div> -->
      </div>
      <form
        method="POST"
        autocomplete="off"
        @submit.prevent="handleSubmit"
        class="flex w-full flex-1 flex-col gap-10"
      >
        <div class="flex flex-col items-center gap-8 px-0 sm:px-10">
          <div class="flex w-full flex-col items-center gap-12 px-8  text-stone-500">
            <div class="relative flex w-full flex-col gap-2">
              <label for="title" class="text-lg font-bold">標題</label>
              <input
                v-model="newPost.title"
                @blur="validateInput('title')"
                type="text"
                id="title"
                class="w-full border-2 p-2 text-stone-500 focus:border-stone-500 focus:outline-none"
                :class="postInputInvalid.title ? 'border-stone-500' : 'border-red-500'"
                placeholder="2~15字"
                required
              />
              <div
                v-if="!postInputInvalid.title"
                class="absolute -bottom-6 left-0 flex w-full items-center gap-1 text-sm text-red-500"
              >
                <ExclamationCircleIcon class="w-4" />
                <p>請輸入2 ~ 15字之標題</p>
              </div>
            </div>
            <div class="relative flex w-full flex-col gap-2">
              <label for="description" class="block text-lg font-bold"
                >簡短描述</label
              >
              <textarea
                v-model="newPost.description"
                @blur="validateInput('description')"
                id="description"
                rows="4"
                maxlength="100"
                class="w-full resize-none border-2 p-2 text-stone-500 focus:border-stone-500 focus:outline-none"
                :class="postInputInvalid.description ? 'border-stone-500' : 'border-red-500'"
                placeholder="5~100字(中英 2:1)"
                required
              ></textarea>
              <div
                v-if="!postInputInvalid.description"
                class="absolute -bottom-6 left-0 flex w-full items-center gap-1 text-sm text-red-500"
              >
                <ExclamationCircleIcon class="w-4" />
                <p>請輸入5 ~ 100字之內容</p>
              </div>
            </div>
          </div>
          <div class="w-full px-8">
            <div class="flex flex-col items-center border-2 border-stone-500">
              <input
                v-model="newPost.location"
                type="text"
                id="location"
                placeholder="請選擇照片拍攝地點"
                class="pointer-events-none w-full border-b-2 border-dashed border-stone-500 bg-white p-2 text-center font-semibold tracking-wide text-stone-800"
                required
                readonly
              />
              <div ref="mapContainer" class="h-80 w-full 2xl:h-96"></div>
            </div>
          </div>
          <div class="mb-4 flex w-full flex-col items-center gap-4 overflow-auto px-8">
            <div
              class="mt-4 flex w-full flex-col items-center gap-2 text-sm leading-6 text-gray-600"
            >
              <label for="imgUpload" class="relative w-full cursor-pointer bg-stone-100">
                <div
                  v-if="previewUrls.length > 0"
                  class="relative aspect-[4/3] w-full cursor-pointer rounded-sm border-4 border-stone-500 bg-stone-100"
                >
                  <img
                    :src="previewUrls[previewImg]"
                    alt=""
                    class="aspect-[4/3] w-full object-cover"
                  />
                  <!-- <EyeIcon
                  class="absolute top-2 right-2 w-8 z-10 text-stone-100 hover:scale-110"
                  @click="showPreview = true"
                /> -->
                  <Transition
                    name="previewImg"
                    enter-active-class="transition ease-out duration-200"
                    enter-from-class="opacity-0"
                    enter-to-class="opacity-100"
                    leave-active-class="transition ease-in duration-300"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <div
                      v-if="showPreview"
                      class="absolute left-1/2 top-1/2 z-10 aspect-[4/3] w-full -translate-x-1/2 -translate-y-1/2 rounded-sm border-4 border-stone-500 2xl:w-[800px]"
                    >
                      <img
                        :src="previewUrls[previewImg]"
                        alt="Preview"
                        class="size-full rounded-sm object-cover"
                      />
                      <XCircleIcon
                        class="absolute right-1 top-1 w-8 text-stone-100 hover:scale-105"
                        @click="showPreview = false"
                      />
                    </div>
                  </Transition>
                </div>
                <div
                  v-else
                  class="flex aspect-[4/3] w-full items-center justify-center rounded-sm border-4 border-dashed border-stone-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-16 text-stone-300"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <span
                  type="button"
                  class="mt-4 block w-full bg-stone-500 p-2 text-center text-lg font-bold text-stone-100 transition-all duration-300 hover:bg-stone-500"
                  >選擇圖片</span
                >
                <input
                  ref="imgInput"
                  id="imgUpload"
                  name="imgUpload"
                  type="file"
                  class="sr-only"
                  @change="previewImages"
                  multiple
                  required
                />
              </label>
            </div>
            <div class="flex w-full gap-3 overflow-auto py-1">
              <div v-if="previewUrls.length > 0" class="flex w-full justify-between gap-3">
                <div
                  v-for="(url, index) in previewUrls"
                  :key="index"
                  class="aspect-[4/3] min-w-[70%] flex-1 rounded-sm border-4 sm:min-w-[calc(50%-.75rem)] lg:min-w-[calc(25%-.75rem)]"
                  :class="previewImg === index ? 'border-lime-500' : 'border-stone-500 '"
                >
                  <img
                    :src="url"
                    :key="index"
                    @click="previewImg = index"
                    class="size-full cursor-pointer object-cover"
                  />
                </div>
                <div class="flex min-w-[calc(25%-.75rem)] flex-1 gap-3">
                  <div
                    class="flex aspect-[4/3] w-full items-center justify-center rounded-sm border-4 border-dashed border-stone-500 text-stone-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-10 text-stone-300"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div v-else class="flex w-full justify-between gap-3">
                <div
                  v-for="index in 4"
                  :key="index"
                  class="flex aspect-[4/3] min-w-[calc(25%-.75rem)] flex-1 items-center justify-center rounded-sm border-4 border-dashed border-stone-500 text-stone-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-10"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          type="submit"
          class="w-full basis-1 bg-stone-500 px-4 py-2 text-lg font-bold text-stone-100 transition-all duration-300 hover:text-white"
        >
          發佈
        </button>
      </form>
    </div>
  </div>
  <Transition
    enter-active-class="transition ease-in duration-150 delay-0"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-150 delay-0"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-1"
  >
    <Dialog v-if="showDialog" :dialogData="dialogData" @closePopup="showDialog = false" />
  </Transition>
</template>

<style scoped>
.imgBlock ::-webkit-scrollbar {
  width: 6px;
}

.imgBlock ::-webkit-scrollbar-track {
  background-color: white;
}

.imgBlock ::-webkit-scrollbar-thumb {
  background-color: gray;
}
</style>
