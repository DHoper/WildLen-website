<script setup lang="ts">
import { type PropType, onMounted, ref, watch } from 'vue'
import { EyeIcon, ChatBubbleBottomCenterIcon } from '@heroicons/vue/24/outline'
import { HeartIcon } from '@heroicons/vue/24/solid'
import { getConvertedHtml } from '@/utils/convertor'
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
  console.log(props.data)

  formData.value.createdAt = new Date()
})
</script>

<template>
  <div
    v-if="formData && user && user.profile"
    class="fixed top-0 z-50 flex h-full w-screen flex-col items-center gap-10 overflow-auto border-4 bg-white px-4 py-12 2xl:gap-16"
  >
    <div class="mx-auto mt-12 w-[62rem] max-w-full border-2 border-stone-800 px-24 py-16">
      <div class="flex items-center gap-4">
        <div
          class="flex size-14 items-center justify-center overflow-hidden rounded-full border border-stone-800 bg-white p-1 2xl:size-16"
        >
          <img :src="`/assets/img/avatar (${user.profile.selectedAvatarIndex}).png`" alt="avatar" />
        </div>
        <div class="flex flex-1 items-baseline justify-start gap-2">
          <span class="text-lg font-bold text-stone-700 2xl:text-xl">{{ user.username }}</span>
          <span class="text-sm font-bold text-stone-500 2xl:text-base"
            >{{ formatDateTime(formData.createdAt) }}
            <span class="text-base italic">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
            {{ getTimeDifference(formData.createdAt) }} 以前
          </span>
        </div>
      </div>
      <h1 class="my-4 text-2xl font-bold text-stone-900 2xl:text-3xl">
        {{ formData.title }}
      </h1>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(tag, index) in formData.topicTags"
          :key="index"
          class="rounded-sm px-2 py-1 text-stone-100"
          :style="`background-color:${setTagColor(tag)}`"
        >
          {{ tag }}
        </span>
      </div>

      <div
        class="quill-content mt-10 overflow-auto whitespace-pre-wrap text-stone-700 2xl:text-lg"
        v-html="typeof(formData.content) === 'string' ? formData.content : getConvertedHtml(formData.content)"
      ></div>
      <!-- <div v-else-if="formData.content === String" v-html="formData.content"></div> -->
      <div class="my-10 mt-5 w-full border-b-2 border-stone-600"></div>
      <div class="my-4 mt-16 border-b-2 border-gray-300"></div>
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
          <HeartIcon class="w-4 transition-all duration-300 2xl:w-6" />0
        </span>
      </div>
    </div>
    <div class="flex gap-16 text-xl">
      <button
        @click="handleSubmit"
        :disabled="isSubmitting"
        class="border-2 border-transparent px-6 py-2 text-white"
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
        class="border-2 border-transparent bg-stone-600 px-6 py-2 text-white transition-all duration-300 hover:border-stone-700 hover:bg-white hover:text-stone-700"
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
