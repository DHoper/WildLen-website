<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ExclamationCircleIcon } from '@heroicons/vue/24/solid'
import CreatePostPreview from './CreatePostPreview.vue'
import { updatePost, getPost } from '@/api/community/community.js'
import { useLoadingStore } from '../../stores/loading.js'
import { type FieldName, inputValidator } from '../../utils/validator.js'
import { topicTags } from '../../fakeData/topicTags.js'
import { postImages } from '@/api/image/image'
import type { CommunityPost } from '@/types/Post'
import type { Image } from '@/types/Common'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const id = computed(() => Number(props.id))
const router = useRouter()
const loadingStore = useLoadingStore()

const formData = ref<CommunityPost>({
  title: '',
  content: '',
  topicTags: [],
  authorId: 0,
  imageIds: [],
  views: 0,
  likes: 0,
  isEdit: true
})
const submitData = ref<CommunityPost>()
const inPreview = ref<boolean>(false)
const editorRef = ref<Quill | null>(null) // 定義 editorRef
let quillInstance: Quill | null = null

// 驗證器
const validator = inputValidator()
const formInputInvalid = validator.formInputInvalid
const validateInput = (fieldName: FieldName | 'UserData') => {
  if (!formData.value) return
  validator.validate(fieldName, formData.value)
}

// 預覽驗證
const previewAble = computed(() => {
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
  if (previewAble.value) {
    inPreview.value = true
  }
}

// 限制tag最多選五
const isMaxSelected = computed(() => {
  return formData.value.topicTags.length >= 5
})

// 初始化 Quill Editor
onMounted(async () => {
  await fetchPostData()

  if (!quillInstance) {
    quillInstance = new Quill('#editor', {
      theme: 'snow',
      placeholder: '請輸入內容...',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          ['link', 'image'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean']
        ]
      }
    })

    quillInstance.setContents(formData.value.content)

    editorRef.value = quillInstance

    const toolbar = document.querySelector('.ql-toolbar') as HTMLElement | null
    if (toolbar) {
      toolbar.style.border = '2px solid black'
      toolbar.style.marginTop = '16px'
    }

    quillInstance.on('text-change', () => {
      formData.value.content = quillInstance?.root.innerHTML || ''
    })
  }
})

onUnmounted(() => {
  if (quillInstance) {
    quillInstance.off('text-change')
    quillInstance = null
  }
})

const fetchPostData = async () => {
  const responseData = await getPost(id.value)

  if (responseData.value) {
    formData.value = {
      ...responseData.value,
      imageIds: responseData.value.images ? responseData.value.images.map((image) => image.id!) : []
    }
    oldImages.value = responseData.value.images || []

    if (quillInstance) {
      quillInstance.root.innerHTML = responseData.value.content
    }
  }
}

const oldImages = ref<Image[]>([])

const handelSubmit = async () => {
  if (!formData.value) return

  loadingStore.setLoadingStatus(true)
  loadingStore.setInRequest(true)
  loadingStore.setIsCountingSeconds(true)
  loadingStore.setIsCountingSeconds(false)

  const delta = quillInstance?.getContents()

  if (formData.value.title && formData.value.topicTags.length > 0 && delta) {
    try {
      let newImageIds: number[] = []
      const deltaOps = delta.ops

      for (const op of deltaOps) {
        if (op.insert && typeof op.insert === 'object' && op.insert.image) {
          const imageBase64 = op.insert.image as string
          const imageFile = dataURLtoFile(imageBase64)
          if (!imageFile) continue
          const uploadResponse = await postImages([imageFile], 'community')
          op.insert = {
            image: uploadResponse[0].url
          }
          newImageIds.push(uploadResponse[0].id)
        }
      }

      const { title, topicTags, authorId } = formData.value
      submitData.value = {
        title,
        content: delta,
        topicTags,
        authorId,
        imageIds: formData.value.imageIds
          ? formData.value.imageIds.concat(newImageIds)
          : newImageIds
      }

      await updatePost(id.value, submitData.value)
      router.push({ name: 'Community' })
      loadingStore.setInRequest(false)
      loadingStore.setLoadingStatus(false)
    } catch (error) {
      console.error('Error creating/updating post:', error)
      loadingStore.setInRequest(false)
      loadingStore.setLoadingStatus(false)
    }
  }
}

function dataURLtoFile(base64: string): File | null {
  const arr = base64.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  if (!mimeMatch) {
    return null
  }
  const mime = mimeMatch[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  const file = new File([u8arr], 'image.png', { type: mime })
  return file
}
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
          <h1 class="my-8 text-4xl text-stone-600">編輯貼文</h1>
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
            <div>
              <label class="text-sm font-bold text-stone-600 2xl:text-lg">貼文主題(最多五項)</label>
              <div class="mt-4 max-h-48 overflow-auto border-2 border-stone-700 p-2">
                <div
                  class="flex flex-wrap items-center justify-center gap-2"
                  v-for="topic in topicTags"
                  :key="topic.color"
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
              <div id="editor" class="w-full border-2 border-t-0 border-stone-800 text-base"></div>
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
              <button
                @click="handelSubmit"
                type="button"
                class="border-2 border-transparent bg-blue-900 px-8 py-2 text-white transition-all duration-300 hover:border-blue-900 hover:bg-white hover:text-blue-900"
              >
                提交
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <transition
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
    </transition>
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
