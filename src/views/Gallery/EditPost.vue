<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import router from '../../router'
import mapboxgl from 'mapbox-gl'
import MapBoxGeoCoder from '@mapbox/mapbox-gl-geocoder'
import MapBoxLanguage from '@mapbox/mapbox-gl-language'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/lib/mapbox-gl-geocoder.css'
import { EyeIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import { TrashIcon } from '@heroicons/vue/24/solid'
import type { PhotoPostType, PhotoPostImageType, DialogType } from '@/types'
import { useUserStore } from '../../stores/user'
import { useLoadingStore } from '../../stores/loading'
import { updatePost, getPost } from '@/api/photoPost/photoPost'
import { deleteImages, postImages } from '@/api/image/image'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const postData = ref<PhotoPostType>()
const fetchPostData = async () => {
  const responseData = await getPost(props.id)
  if (responseData.value) {
    postData.value = responseData.value

    if (postData.value) {
      for (const image of postData.value.images) {
        oldUrls.value.push(image.url)
      }
    }
  }
}

//----cloudinary&圖片預覽----
const previewImgIndex = ref<number>(0) //紀錄所選預覽大圖

const imgInput = ref<HTMLInputElement>()
const inputUrls = ref<string[]>([])
const oldUrls = ref<string[]>([])
const previewUrls = computed(() => {
  return oldUrls.value.concat(inputUrls.value)
})

const showPreview = ref<boolean>(false)

const previewImages = () => {
  previewImgIndex.value = 0
  inputUrls.value = []
  if (imgInput.value) {
    const inputElement = imgInput.value
    if (inputElement.files) {
      const selectedFiles = Array.from(inputElement.files)
      const urls = selectedFiles.map((file) => URL.createObjectURL(file))
      for (const url of urls) {
        inputUrls.value.push(url)
      }
    }
  }
}

const handleSelectDeleteImage = () => {
  oldUrls.value.splice(previewImgIndex.value, 1)
  previewImgIndex.value = 0
}

let updatePostImages: PhotoPostImageType[] = [] //儲存最終提交之圖片url
const uploadImages = async () => {
  const inputElement = imgInput.value

  if (inputElement && postData.value) {
    const files = inputElement.files as FileList

    updatePostImages = await postImages(files, 'Animal-World')

    for (const image of postData.value.images) {
      if (previewUrls.value.includes(image.url)) {
        updatePostImages.unshift(image)
      }
    }
  }
}

const setDeleteImagesPublicIds = () => {
  if (!postData.value) return
  const publicIds: string[] = []
  for (const image of postData.value.images) {
    if (!oldUrls.value.includes(image.url)) publicIds.push(image.filename)
  }
  return publicIds
}

//----mapbox地圖----
mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_TOKEN

const mapContainer = ref<HTMLElement | null>(null)

//----表單----

//表單提交驗證失敗彈窗
const showDialog = ref(false)
const dialogData = ref<DialogType>({
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
    } else if (/[\「」{}.,;:!?-、...。，；：！？_、，"'：]/.test(char)) {
      totalWeight += 1
    } else {
      totalWeight += 10000
    }
  }
  return totalWeight
}

async function validateInput(fieldName: FieldName) {
  if (postData.value) {
    let isValid = true
    let value = postData.value[fieldName]

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
}

////表單提交
const submitEditedPost = async () => {
  if (!postData.value) return
  const loadingStore = useLoadingStore() //loading動畫設置
  loadingStore.setLoadingStatus(true)
  loadingStore.setInRequest(true)
  loadingStore.setIsCountingSeconds(true)
  loadingStore.setIsCountingSeconds(false)

  const userStore = useUserStore()
  if (!userStore.isLogin || !userStore.getData()) {
    router.push({ name: 'Login' })
    return
  }

  const publicIds = setDeleteImagesPublicIds()
  if (publicIds && publicIds.length > 0) {
    await deleteImages(publicIds)
  }

  await uploadImages()
  const submitForm: PhotoPostType = {
    authorId: postData.value.authorId,
    title: postData.value.title,
    location: postData.value.location,
    geometry: {
      type: 'point',
      coordinates: postData.value.geometry.coordinates
    },
    description: postData.value.description,
    images: updatePostImages,
    views: 0,
    likes: 0,
    commentsId: [],
    isEdit: false
  }

  await updatePost(postData.value._id!, submitForm).catch((err) =>
    console.error('編輯時貼文出錯:', err)
  )
  dialogData.value.title = '貼文編輯成功'
  dialogData.value.content = '您的貼文已更新'
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
  router.push({ name: 'PersonalPosts' })
}

const handleSubmit = async () => {
  if (postData.value) {
    //驗證失敗
    if (!imgInput.value) {
      return
    }
    const verification =
      postInputInvalid.value.title &&
      postInputInvalid.value.description &&
      previewUrls.value.length &&
      postData.value.location
    if (!verification) {
      dialogData.value.title = '貼文編輯失敗'
      dialogData.value.warringStyle = true
      if (!postData.value.location) {
        dialogData.value.content = '請選擇照片拍攝之地點'
      } else if (!postInputInvalid.value.title) {
        dialogData.value.content = '請填入正確格式之標題'
      } else if (!postInputInvalid.value.description) {
        dialogData.value.content = '請填入正確格式之敘述'
      } else if (!previewUrls.value.length) {
        dialogData.value.content = '請至少上傳一張圖片'
      }
      showDialog.value = true
      return
    }

    //驗證成功
    await submitEditedPost()
  }
}

onMounted(async () => {
  await fetchPostData()

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
    if (postData.value) {
      postData.value.location = event.result.place_name
      postData.value.geometry.coordinates = event.result.center
    }
  })
})
</script>

<template>
  <div v-if="postData" class="flex-1 bg-stone-100">
    <div
      class="mx-auto my-12 flex w-[60rem] flex-col gap-4 overflow-auto border-4 border-stone-700 bg-stone-100"
    >
      <div class="mt-10 flex flex-col items-center px-10">
        <h3 class="text-xl font-bold 2xl:text-3xl">新照片</h3>
        <div class="my-4 mt-10 w-full border-t-2 border-stone-500"></div>
      </div>
      <form
        method="POST"
        autocomplete="off"
        @submit.prevent="handleSubmit"
        class="flex w-full flex-1 flex-col gap-10"
      >
        <div class="flex flex-col items-center gap-8 px-10">
          <div class="contentBlock flex w-full flex-col items-center gap-8 text-stone-700">
            <div class="relative flex w-[400px] flex-col items-center gap-2">
              <label for="title" class="text-lg font-bold 2xl:p-4 2xl:text-xl">標題</label>
              <input
                v-model="postData.title"
                @blur="validateInput('title')"
                type="text"
                id="title"
                class="w-full border-2 p-2 text-stone-700 focus:border-stone-500 focus:outline-none 2xl:px-4 2xl:text-lg"
                :class="postInputInvalid.title ? 'border-stone-600' : 'border-red-500'"
                placeholder="2~15字"
                required
              />
              <div
                v-if="!postInputInvalid.title"
                class="absolute -bottom-6 left-0 flex w-full items-center justify-center gap-1 text-sm text-red-500 2xl:-bottom-7 2xl:text-base"
              >
                <ExclamationCircleIcon class="w-4" />
                <p>請輸入2 ~ 15字之標題</p>
              </div>
            </div>
            <div class="relative flex w-[400px] flex-col items-center gap-2">
              <label for="description" class="block text-lg font-bold 2xl:p-4 2xl:text-xl"
                >簡短描述</label
              >
              <textarea
                v-model="postData.description"
                @blur="validateInput('description')"
                id="description"
                rows="4"
                maxlength="100"
                class="w-full resize-none border-2 p-2 text-stone-700 focus:border-stone-500 focus:outline-none 2xl:p-4 2xl:text-lg"
                :class="postInputInvalid.description ? 'border-stone-600' : 'border-red-500'"
                placeholder="5~100字(中英2:1)"
                required
              ></textarea>
              <div
                v-if="!postInputInvalid.description"
                class="absolute -bottom-6 left-0 flex w-full items-center justify-center gap-1 text-sm text-red-500 2xl:-bottom-7 2xl:text-base"
              >
                <ExclamationCircleIcon class="w-4" />
                <p>請輸入5 ~ 100字之內容</p>
              </div>
            </div>
          </div>
          <div class="imgBlock flex w-full flex-col items-center gap-4">
            <div class="w-full border-t-2 border-stone-500" />
            <div class="mt-4 flex flex-col items-center gap-2 text-sm leading-6 text-gray-600">
              <div
                v-if="previewUrls.length > 0"
                class="relative h-[300px] w-[400px] cursor-pointer rounded-sm border-4 border-stone-500 bg-stone-100"
              >
                <img
                  :src="previewUrls[previewImgIndex]"
                  alt=""
                  class="size-full rounded-sm object-cover"
                />
                <EyeIcon
                  class="absolute right-2 top-2 z-10 w-8 text-stone-100 hover:scale-110"
                  @click="showPreview = true"
                />
                <TrashIcon
                  v-if="postData.images.some((image) => image.url === previewUrls[previewImgIndex])"
                  @click="handleSelectDeleteImage"
                  class="absolute bottom-2 right-2 z-10 w-8 text-red-600 transition-all duration-300 hover:scale-105"
                />
                <Transition
                  name="previewImgIndex"
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-active-class="transition ease-in duration-300"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <div
                    v-if="showPreview"
                    class="absolute left-1/2 top-1/2 z-10 h-[450px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-sm border-4 border-stone-500 2xl:h-[600px] 2xl:w-[800px]"
                  >
                    <img
                      :src="previewUrls[previewImgIndex]"
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
                class="flex h-[300px] w-[400px] items-center justify-center rounded-sm border-4 border-dashed border-stone-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-14 text-stone-300"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
              <label for="imgUpload" class="relative w-full cursor-pointer bg-stone-100">
                <span
                  type="button"
                  class="w-full bg-stone-600 p-2 text-center text-lg font-bold text-stone-100 transition-all duration-300 hover:bg-stone-700 2xl:text-xl"
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
                />
              </label>
            </div>
            <div class="previewRows flex w-full gap-3 overflow-auto p-1">
              <div v-if="previewUrls.length > 0" class="mx-auto flex gap-3">
                <div
                  v-for="(url, index) in previewUrls"
                  class="h-[105px] w-[140px] rounded-sm border-4 bg-stone-500"
                  :class="
                    previewImgIndex === index
                      ? 'border-stone-500 border-solid'
                      : 'border-dashed border-stone-600 '
                  "
                >
                  <img
                    :src="url"
                    :key="index"
                    @click="previewImgIndex = index"
                    class="size-full cursor-pointer rounded-sm object-cover"
                  />
                </div>
                <div class="flex gap-3">
                  <div
                    class="flex h-[105px] w-[140px] items-center justify-center rounded-sm border-4 border-dashed border-stone-600 text-stone-200"
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
              <div v-else class="mx-auto flex gap-3">
                <div
                  v-for=" in 5"
                  class="flex h-[105px] w-[140px] items-center justify-center rounded-sm border-4 border-dashed border-stone-600 text-stone-300"
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
          <div class="mapBlock flex w-full flex-col items-center border-2 border-stone-700">
            <input
              v-model="postData.location"
              type="text"
              id="location"
              placeholder="請選擇照片拍攝地點"
              class="pointer-events-none w-full border-b-2 border-dashed border-stone-600 bg-white p-2 text-center tracking-wide 2xl:text-lg"
              required
              readonly
            />
            <div ref="mapContainer" class="h-80 w-full 2xl:h-96"></div>
          </div>
        </div>
        <button
          type="submit"
          class="w-full basis-1 bg-stone-700 px-4 py-2 text-lg font-bold text-stone-100 transition-all duration-300 hover:text-white 2xl:text-xl"
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
