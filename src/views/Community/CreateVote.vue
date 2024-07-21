<script setup lang="ts">
import { createVote } from '@/api/community/vote'
import type { Vote, VoteOption } from '@/types/Vote'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { TrashIcon } from '@heroicons/vue/24/solid'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useUserStore } from '@/stores/user'
import { useLoadingStore } from '@/stores/loading'

const router = useRouter()
const userStore = useUserStore()

const voteTitle = ref('')
const voteDescription = ref('')
const voteOptions = ref<VoteOption[]>([{ text: '' }, { text: '' }]) // 初始至少有兩個選項
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref('')
const errorMessage = ref('')

const addOption = () => {
  if (voteOptions.value.length < 5) {
    // 最多添加五個選項
    voteOptions.value.push({ text: '' })
  }
}

const removeOption = (index: number) => {
  if (voteOptions.value.length > 2) {
    // 至少保留兩個選項
    voteOptions.value.splice(index, 1)
  }
}

const handleSubmit = async () => {
  const loadingStore = useLoadingStore() // 設置 loading 動畫頁
  loadingStore.setLoadingStatus(true)
  loadingStore.setInRequest(true)

  try {
    // 檢查選項數量是否至少為兩個
    if (voteOptions.value.length < 2) {
      errorMessage.value = '至少需要兩個選項才能發布投票。'
      return
    }

    const voteData: Vote = {
      authorId: userStore.getId()!,
      title: voteTitle.value,
      description: voteDescription.value,
      options: voteOptions.value,
      startDate: new Date(startDate.value),
      endDate: new Date(endDate.value)
    }
    await createVote(voteData)
    router.push('/community')
  } catch (error) {
    errorMessage.value = '創建投票時發生錯誤，請重試。'
  }
  window.scrollTo(0, 0)
  loadingStore.setInRequest(false)
  loadingStore.setLoadingStatus(false)
}
</script>

<template>
  <div class="w-full flex-1 bg-fixed">
    <div class="w-full bg-stone-100 px-4 py-8">
      <div class="mx-auto flex max-w-7xl flex-col items-center gap-8 bg-stone-100 px-5 pt-20 lg:gap-20 lg:px-8 lg:pt-24">
        <button
          @click="router.back()"
          class="self-start text-sm font-bold text-stone-800 2xl:text-xl"
        >
          上一頁
        </button>
        <div class="mx-auto w-full border-2 border-stone-800 bg-white px-6 py-8 sm:px-12 sm:py-10 lg:px-24 lg:py-16">
          <h1 class="mb-8 text-2xl font-bold text-stone-900 2xl:text-4xl">發起投票</h1>
          <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
            <div>
              <label for="title" class="mb-2 block font-bold text-stone-700">標題</label>
              <input
                id="title"
                v-model="voteTitle"
                type="text"
                class="w-full border-2 border-stone-700 px-4 py-2"
                required
              />
            </div>
            <div>
              <label for="description" class="mb-2 block font-bold text-stone-700">描述</label>
              <textarea
                id="description"
                v-model="voteDescription"
                class="w-full resize-none border-2 border-stone-700 px-4 py-2"
                rows="5"
                required
              ></textarea>
            </div>
            <div>
              <label class="mb-2 block font-bold text-stone-700">選項</label>
              <div class="mb-2 flex w-full flex-wrap gap-y-1.5 border">
                <div
                  v-for="(option, index) in voteOptions"
                  :key="index"
                  class="relative flex flex-1 basis-full sm:basis-1/2 flex-wrap items-center border"
                >
                  <input
                    v-model="voteOptions[index].text"
                    type="text"
                    class="w-full truncate border-2 border-stone-700 px-4 py-2 pr-8"
                    required
                  />
                  <button
                    @click="removeOption(index)"
                    type="button"
                    class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center text-red-500"
                    v-if="voteOptions.length > 2"
                  >
                    <TrashIcon class="size-6 transition-all hover:text-red-600" />
                  </button>
                </div>
              </div>
              <button
                @click="addOption"
                type="button"
                class="w-full bg-emerald-600 p-2 text-white transition-all hover:bg-emerald-500"
              >
                <PlusIcon class="mx-auto size-5" />
              </button>
            </div>
            <div>
              <label for="endDate" class="mb-2 block font-bold text-stone-700">截止日期</label>
              <input
                id="endDate"
                v-model="endDate"
                type="date"
                class="w-full border-2 border-stone-700 px-4 py-2"
                required
              />
            </div>
            <div v-if="errorMessage" class="mb-4 text-red-600">
              {{ errorMessage }}
            </div>
            <button
              type="submit"
              class="mt-12 w-full bg-sky-600 px-4 py-2 font-bold text-white transition-all hover:bg-sky-500"
            >
              創建投票
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
