<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ExclamationCircleIcon } from '@heroicons/vue/24/solid'
import CreatePostPreview from './CreatePostPreview.vue'
import { createPost } from '@/api/community/community'
import { useUserStore } from '../../stores/user.js'
import { useLoadingStore } from '../../stores/loading.js'
import { type FieldName, inputValidator } from '../../utils/validator.js'
import { postImages } from '@/api/image/image'
import { topicTags } from '../../fakeData/topicTags.js'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import type { CommunityPost } from '@/types/Post'
import type { Image } from '@/types/Common'

const router = useRouter()
const userStore = useUserStore()
const loadingStore = useLoadingStore()

const editorRef = ref<Quill | null>(null)
const formData = ref({
  title: '',
  images: [] as Image[],
  content: '',
  views: 0,
  likes: 0,
  authorId: userStore.getId()!,
  topicTags: [] as string[],
  isEdit: false
})
const submitData = ref<CommunityPost>()
const inPreview = ref<boolean>(false)
let quillInstance: Quill | null = null

// 驗證器
const validator = inputValidator()
const formInputInvalid = validator.formInputInvalid
const validateInput = (fieldName: FieldName | 'UserData') => {
  validator.validate(fieldName, formData.value)
}

// 預覽是否可用
const previewAble = computed(
  () =>
    formData.value.topicTags.length > 0 &&
    formInputInvalid.value.title &&
    formInputInvalid.value.content &&
    formData.value.title &&
    formData.value.content
)

//限制tag最多選五
const isMaxSelected = computed(() => {
  return formData.value.topicTags.length >= 5
})

const handelPreview = () => {
  if (previewAble.value) {
    inPreview.value = true
  }
}

function dataURLtoFile(dataUrl: string): File {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  const file = new File([u8arr], 'image.png', { type: mime })
  return file
}

// 提交表單
const handleSubmit = async () => {
  loadingStore.setLoadingStatus(true)
  loadingStore.setInRequest(true)
  loadingStore.setIsCountingSeconds(true)
  loadingStore.setIsCountingSeconds(false)

  const delta = quillInstance?.getContents()

  if (formData.value.title && formData.value.topicTags.length > 0 && delta) {
    try {
      let newImageIds: number[] = []
      const deltaOps = delta.ops

      // 處理Delta格式中的圖片
      for (const op of deltaOps) {
        if (op.insert && typeof op.insert === 'object' && op.insert.image) {
          const imageUrl = op.insert.image as string
          const imageFile = dataURLtoFile(imageUrl)
          const uploadResponse = await postImages([imageFile], 'community')
          op.insert = {
            image: uploadResponse[0].url
          }
          newImageIds.push(uploadResponse[0].id)
        }
      }

      // 更新表單數據
      const { title, topicTags, authorId } = formData.value
      submitData.value = {
        title,
        content: delta,
        topicTags,
        authorId,
        imageIds: newImageIds
      }

      await createPost(submitData.value)
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

// 初始化 Quill Editor
onMounted(() => {
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

// 清理 Quill Editor
onUnmounted(() => {
  if (quillInstance) {
    quillInstance.off('text-change')
    quillInstance = null
  }
})
</script>

<template>
  <div class="relative flex-1">
    <div class="bg-white w-full py-12 px-4">
      <div class="mx-auto flex flex-col bg-white w-[62rem] max-w-full px-5">
        <button
          @click="router.back()"
          class="self-start text-sm 2xl:text-lg font-bold text-stone-800"
        >
          上一頁
        </button>
        <div class="mt-12 border-2 border-stone-800 px-24 py-16">
          <h1 class="my-8 text-4xl text-stone-600">發佈新貼文</h1>
          <form class="mt-4 flex flex-col gap-4 2xl:gap-12">
            <div class="relative">
              <label for="title" class="text-stone-600 font-bold text-sm 2xl:text-lg">標題</label>
              <input
                v-model="formData.title"
                type="text"
                id="title"
                name="title"
                placeholder="3 ~ 40字"
                @blur="validateInput('title')"
                class="mt-2 w-full border-2 py-2 px-3 outline-none"
                :class="formInputInvalid.title ? 'border-stone-800' : 'border-red-700'"
                required
              />
              <div
                v-if="!formInputInvalid.title"
                class="w-full absolute left-0 bottom-0 2xl:-bottom-1 translate-y-full flex items-center gap-1 text-xs 2xl:text-base text-red-500"
              >
                <ExclamationCircleIcon class="w-4 2xl:w-6" />
                <p>請輸入3 ~ 40字有效標題</p>
              </div>
            </div>
            <div>
              <label for="img" class="text-stone-600 font-bold text-sm 2xl:text-lg"
                >貼文主題(最多五項)</label
              >
              <div class="mt-4 border-2 border-stone-700 p-2 overflow-auto max-h-48">
                <div
                  class="flex gap-2 items-center justify-center flex-wrap"
                  v-for="(topic, index) in topicTags"
                  :key="index"
                >
                  <div class="mt-4 flex flex-wrap gap-2 justify-center">
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
              <label for="editor" class="text-stone-600 font-bold text-sm 2xl:text-lg"
                >貼文内容</label
              >
              <div id="editor" class="w-full h-64 border-2 border-stone-800"></div>
              <div
                v-if="!formInputInvalid.content"
                class="w-full absolute left-0 bottom-1 translate-y-full flex items-center gap-1 text-xs 2xl:text-base text-red-500"
              >
                <ExclamationCircleIcon class="w-4 2xl:w-6" />
                <p>請輸入10 ~ 2000字有效內容</p>
              </div>
            </div>
            <div class="mt-8 flex justify-between">
              <button
                @click="handelPreview"
                type="button"
                :disabled="!previewAble"
                class="text-white border-2 border-transparent px-8 py-2 transition-all duration-300"
                :class="
                  previewAble
                    ? 'bg-blue-900 hover:bg-white hover:text-blue-900 hover:border-blue-900'
                    : 'bg-stone-600'
                "
              >
                預覽
              </button>
              <button
                @click="handleSubmit"
                type="button"
                class="text-white border-2 border-transparent px-8 py-2 transition-all duration-300 bg-blue-900 hover:bg-white hover:text-blue-900 hover:border-blue-900"
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
        @submit="handleSubmit"
      />
    </transition>
  </div>
</template>
