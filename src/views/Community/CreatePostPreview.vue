<script setup lang="ts">
import { type PropType, onMounted, ref, watch } from 'vue'
import { EyeIcon, ChatBubbleBottomCenterIcon } from '@heroicons/vue/24/outline'

import { HeartIcon } from '@heroicons/vue/24/solid'
import { getTimeDifference, formatDateTime } from '../../utils/formator'
import { setTagColor } from '../../fakeData/topicTags.js'
import type { CommunityPost } from '@/types/Post'
import { useUserStore } from '@/stores/user'
import type { Dialog } from '@/types/Common'

const props = defineProps({
  data: Object as PropType<CommunityPost>
})
const emit = defineEmits(['close', 'submit'])

const userStore = useUserStore()
const user = userStore.user

const formData = ref()

const showDialog = ref(false)
const dialogData = ref<Dialog>({
  title: '是否確認提交',
  content: '按下確認後即建立貼文',
  cancelButton: true
})

////彈窗框邏輯
const userChoice = ref<boolean>()

const handleDialog = async () => {
  showDialog.value = true
  const dialogPromise = new Promise((resolve) => {
    watch(userChoice, () => {
      showDialog.value = false
      resolve(userChoice.value)
    })
  })
  return dialogPromise
}

const isSubmitting = ref<boolean>(false)
async function handleSubmit() {
  const choice = await handleDialog()

  if (choice) {
    isSubmitting.value = true
    emit('submit')
  }

  userChoice.value = undefined
}

onMounted(async () => {
  formData.value = props.data
  formData.value.createdAt = new Date()
})
</script>

<template>
  <div
    v-if="formData && user && user.profile"
    class="fixed top-0 w-screen h-full overflow-auto border-4 py-12 px-4 z-50 bg-white flex flex-col items-center gap-10 2xl:gap-16"
  >
    <div class="mt-12 mx-auto border-2 border-stone-800 w-[62rem] max-w-full px-24 py-16">
      <div class="flex items-center gap-4">
        <div
          class="border border-stone-800 rounded-full bg-white w-14 h-14 2xl:w-16 2xl:h-16 p-1 flex items-center justify-center overflow-hidden"
        >
          <img :src="`/assets/img/avatar (${user.profile.selectedAvatarIndex}).png`" alt="avatar" />
        </div>
        <div class="flex gap-2 items-baseline justify-start flex-1">
          <span class="text-lg 2xl:text-xl text-stone-700 font-bold">{{ user.username }}</span>
          <span class="font-bold text-sm 2xl:text-base text-stone-500"
            >{{ formatDateTime(formData.createdAt) }}
            <span class="text-md italic">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
            {{ getTimeDifference(formData.createdAt) }} 以前
          </span>
        </div>
      </div>
      <h1 class="my-4 text-2xl 2xl:text-3xl text-stone-900 font-bold">
        {{ formData.title }}
      </h1>
      <div class="flex gap-2 flex-wrap">
        <span
          v-for="(tag, index) in formData.topicTags"
          :key="index"
          class="px-2 py-1 text-stone-100 rounded-sm"
          :style="`background-color:${setTagColor(tag)}`"
        >
          {{ tag }}
        </span>
      </div>
      <!-- <div
        v-if="formData.images && formData.images.length > 0"
        class="mt-20 border-2 border-stone-700"
      >
        <img :src="formData.images[0].url" class="object-cover w-full h-full" />
      </div> -->
      <!-- 問題--部分轉譯字元文本會超出寬度 -->
      <div
        class="quill-content mt-10 text-stone-700 2xl:text-lg whitespace-pre-wrap overflow-auto"
        v-html="formData.content"
      ></div>
      <div class="border-b-2 border-stone-600 w-full my-10 mt-5"></div>
      <!-- <div v-if="formData.images && formData.images.length > 0" class="mt-4 flex flex-col gap-4">
        <div v-for="(image, index) in formData.images" :key="index">
          <div v-if="index != 0" class="border-2 border-stone-700">
            <img :key="index" :src="image.url" class="object-cover w-full h-full" />
          </div>
        </div>
      </div> -->
      <div class="border-b-2 border-gray-300 my-4 mt-16"></div>
      <div class="flex justify-between">
        <div class="flex gap-8">
          <span class="flex items-center gap-1 2xl:text-xl">
            <EyeIcon class="w-4 2xl:w-6" />0
          </span>
          <span class="flex items-center gap-1 2xl:text-xl">
            <ChatBubbleBottomCenterIcon class="w-4 2xl:w-6" />0
          </span>
        </div>
        <span class="group flex items-center gap-1 2xl:text-xl">
          <HeartIcon class="w-4 2xl:w-6 transition-all duration-300" />0
        </span>
      </div>
    </div>
    <div class="flex gap-16 text-xl">
      <button
        @click="handleSubmit"
        :disabled="isSubmitting"
        class="text-white px-6 py-2 border-2 border-transparent"
        :class="
          isSubmitting
            ? 'bg-stone-400'
            : 'bg-green-600 hover:border-green-600 hover:bg-white hover:text-green-600 transition-all duration-300'
        "
      >
        發佈
      </button>
      <button
        @click="emit('close')"
        class="text-white bg-stone-600 px-6 py-2 border-2 border-transparent hover:border-stone-700 hover:bg-white hover:text-stone-700 transition-all duration-300"
      >
        返回
      </button>
    </div>
    <Dialog
      v-if="showDialog"
      :dialogData="dialogData"
      @closePopup="(choice: boolean) => (userChoice = choice)"
    />
  </div>
</template>
