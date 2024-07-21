<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ExclamationCircleIcon, TrashIcon } from '@heroicons/vue/24/solid'
import CreatePostPreview from './CreatePostPreview.vue'
import { updatePost, getPost } from '@/api/community/community.js'
import { CommunityPostType, PhotoPostImageType } from '../../types/index.js'
import { useLoadingStore } from '../../stores/loading.js'
import { FieldName, inputValidator } from '../../utils/validator.js'
import { topicTags } from '../../fakeData/topicTags.js'
import { deleteImages, postImages } from '@/api/image/image'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})
const router = useRouter()
const loadingStore = useLoadingStore()

const formData = ref<CommunityPostType>()
const postExistingImages = ref<PhotoPostImageType[]>([])
const fetchPostData = async () => {
  const responseData = await getPost(props.id)
  if (responseData.value) {
    formData.value = responseData.value
    if (formData.value.images) {
      for (const image of formData.value.images) {
        postExistingImages.value.push(image)
      }
      oldImages.value = formData.value.images
    }
  }
}

const handleSelectDeleteImage = (index: number) => {
  oldImages.value.splice(index, 1)
}

const isMaxSelected = computed(() => {
  //限制tag最多選五
  if (!formData.value) return
  return formData.value.topicTags.length >= 5
})
const inPreview = ref<boolean>(false)

//驗證器
const validator = inputValidator()
const formInputInvalid = validator.formInputInvalid
const validateInput = (fieldName: FieldName | 'UserData') => {
  //重新包裝validator
  if (!formData.value) return
  validator.validate(fieldName, formData.value)
}

//預覽驗證
const previewAble = computed(() => {
  if (!formData.value) return
  return (
    formData.value.topicTags.length > 0 &&
    formInputInvalid.value.title &&
    formInputInvalid.value.content &&
    formData.value.title &&
    formData.value.content
  )
})
const handelPreview = () => {
  if (!formData.value) return
  formData.value.images = previewImages.value
  if (previewAble.value) {
    inPreview.value = true
  }
}

//圖片處裡
const imgInput = ref<HTMLInputElement>()
const oldImages = ref<PhotoPostImageType[]>([])
const inputImages = ref<PhotoPostImageType[]>([])
const previewImages = computed(() => {
  return oldImages.value.concat(inputImages.value)
})

const setFileUrl = () => {
  inputImages.value = []
  if (imgInput.value && imgInput.value.files) {
    const selectedFiles = Array.from(imgInput.value.files)
    const urls = selectedFiles.map((file) => URL.createObjectURL(file))
    for (const url of urls) {
      inputImages.value.push({ url, filename: 'previewFile' })
    }
  }
}

let updatePostImages: PhotoPostImageType[] = [] //儲存最終提交之圖片url
const uploadImages = async () => {
  if (!formData.value) return
  const inputElement = imgInput.value

  if (inputElement && previewImages.value) {
    const files = inputElement.files as FileList

    updatePostImages = await postImages(files, 'Community')

    for (const image of formData.value.images) {
      if (postExistingImages.value.includes(image)) {
        updatePostImages.unshift(image)
      }
    }
  }
}

const setDeleteImagesPublicIds = () => {
  if (!formData.value) return

  const publicIds: string[] = []
  console.log(postExistingImages.value)

  for (const image of postExistingImages.value) {
    if (!formData.value.images.includes(image)) {
      publicIds.push(image.filename)
    }
  }

  console.log(publicIds, 77)

  return publicIds
}

const handelSubmit = async () => {
  if (!formData.value) return

  loadingStore.setLoadingStatus(true)
  loadingStore.setInRequest(true)
  loadingStore.setIsCountingSeconds(true)
  loadingStore.setIsCountingSeconds(false)

  const publicIds = setDeleteImagesPublicIds()
  if (publicIds && publicIds.length > 0) {
    await deleteImages(publicIds)
  }
  await uploadImages()

  formData.value.images = updatePostImages

  await updatePost(props.id, formData.value)
  loadingStore.setInRequest(false)
  loadingStore.setLoadingStatus(false)
  router.push({ name: 'Community' })
}

onMounted(async () => {
  await fetchPostData()
})
</script>

<template>
  <div v-if="formData" class="relative flex-1">
    <div class="w-full bg-white px-4 py-12">
      <div class="mx-auto flex w-[62rem] max-w-full flex-col bg-white px-5">
        <button
          @click="router.back()"
          class="self-start text-sm font-bold text-stone-800 2xl:text-lg"
        >
          上一頁
        </button>
        <div class="mt-12 border-2 border-stone-800 px-24 py-16">
          <h1 class="my-8 text-4xl text-stone-600">發佈新貼文</h1>
          <form class="mt-4 flex flex-col gap-4 2xl:gap-12">
            <div class="relative">
              <label for="title" class="text-sm font-bold text-stone-600 2xl:text-lg">標題</label>
              <input
                v-model="formData.title"
                type="text"
                id="title"
                name="title"
                placeholder="5 ~ 40字"
                @blur="validateInput('title')"
                class="mt-2 w-full border-2 px-3 py-2 outline-none"
                :class="formInputInvalid.title ? 'border-stone-800' : 'border-red-700'"
                required
              />
              <div
                v-if="!formInputInvalid.title"
                class="absolute bottom-0 left-0 flex w-full translate-y-full items-center gap-1 text-xs text-red-500 2xl:-bottom-1 2xl:text-base"
              >
                <ExclamationCircleIcon class="w-4 2xl:w-6" />
                <p>請輸入有效標題</p>
              </div>
            </div>
            <div class="imgBlock">
              <label for="img" class="text-sm font-bold text-stone-600 2xl:text-lg"
                >圖片(可選)</label
              >
              <div class="mt-4 flex items-center">
                <label
                  for="imgUpload"
                  class="cursor-pointer border-2 border-stone-500 bg-stone-500 px-4 py-2 text-sm font-bold text-white hover:bg-white hover:text-stone-500 2xl:text-lg"
                >
                  選擇檔案
                </label>
                <input
                  ref="imgInput"
                  id="imgUpload"
                  name="imgUpload"
                  type="file"
                  class="hidden"
                  @change="setFileUrl"
                  multiple
                />
              </div>
              <div class="mt-4 flex gap-4 overflow-auto pb-1">
                <div
                  v-for="(image, index) in previewImages"
                  class="relative h-[105px] w-[140px] shrink-0 border-2 border-stone-600"
                >
                  <img :src="image.url" alt="image.filename" class="size-full object-cover" />
                  <TrashIcon
                    v-if="postExistingImages.includes(image)"
                    @click="handleSelectDeleteImage(index)"
                    class="absolute right-2 top-2 z-10 w-8 cursor-pointer text-red-600 transition-all duration-300 hover:scale-105"
                  />
                </div>
              </div>
            </div>
            <div>
              <label class="text-sm font-bold text-stone-600 2xl:text-lg">貼文主題(最多五項)</label>
              <div class="mt-4 max-h-48 overflow-auto border-2 border-stone-700 p-2">
                <div
                  class="flex flex-wrap items-center justify-center gap-2"
                  v-for="topic in topicTags"
                >
                  <div class="mt-4 flex flex-wrap justify-center gap-2">
                    <label
                      v-for="tag in topic.tags"
                      :key="tag"
                      class="border-2 border-stone-700 px-2 py-1"
                      :style="
                        formData.topicTags.includes(tag)
                          ? `background-color:${topic.color};color:white`
                          : ''
                      "
                    >
                      <input
                        type="checkbox"
                        v-model="formData.topicTags"
                        :value="tag"
                        class="hidden"
                        :disabled="isMaxSelected && !formData.topicTags.includes(tag)"
                      />
                      <span class="cursor-pointer">{{ tag }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="relative">
              <label for="content" class="text-sm font-bold text-stone-600 2xl:text-lg"
                >貼文内容</label
              >
              <textarea
                v-model="formData.content"
                id="content"
                name="content"
                cols="20"
                rows="10"
                placeholder="10 ~ 2000字"
                maxlength="2000"
                @blur="validateInput('content')"
                class="mb-0 mt-2 w-full resize-none border-2 border-stone-800 px-3 py-2 outline-none 2xl:p-6 2xl:text-lg"
                :class="formInputInvalid.content ? 'border-stone-800' : 'border-red-700'"
                required
              />
              <div
                v-if="!formInputInvalid.content"
                class="absolute bottom-1 left-0 flex w-full translate-y-full items-center gap-1 text-xs text-red-500 2xl:text-base"
              >
                <ExclamationCircleIcon class="w-4 2xl:w-6" />
                <p>請輸入有效內容</p>
              </div>
            </div>
            <div class="mt-8 flex justify-between">
              <button
                @click="handelPreview"
                type="button"
                :disabled="!previewAble"
                class="border-2 border-transparent px-8 py-2 text-white transition-all duration-300"
                :class="
                  previewAble
                    ? 'bg-blue-900 hover:bg-white hover:text-blue-900 hover:border-blue-900'
                    : 'bg-stone-600'
                "
              >
                預覽
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <Transition
      name="previewPost"
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-300"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <CreatePostPreview
        v-if="inPreview"
        :data="formData"
        @close="inPreview = false"
        @submit="handelSubmit"
      />
    </Transition>
  </div>
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
