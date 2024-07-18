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
  <div class="flex-1 w-full bg-fixed">
    <div class="bg-stone-100 w-full py-8 px-4">
      <div class="mx-auto flex flex-col items-center gap-20 bg-stone-100 w-[62rem] pt-20 px-5">
        <button
          @click="router.back()"
          class="self-start text-sm 2xl:text-xl font-bold text-stone-800"
        >
          上一頁
        </button>
        <div class="mx-auto border-2 border-stone-800 w-full px-24 py-16 bg-white">
          <h1 class="text-2xl 2xl:text-4xl font-bold text-stone-900 mb-8">發起投票</h1>
          <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
            <div>
              <label for="title" class="block text-stone-700 font-bold mb-2">標題</label>
              <input
                id="title"
                v-model="voteTitle"
                type="text"
                class="border-2 border-stone-700 w-full px-4 py-2"
                required
              />
            </div>
            <div>
              <label for="description" class="block text-stone-700 font-bold mb-2">描述</label>
              <textarea
                id="description"
                v-model="voteDescription"
                class="border-2 border-stone-700 w-full px-4 py-2 resize-none"
                rows="5"
                required
              ></textarea>
            </div>
            <div>
              <label class="block text-stone-700 font-bold mb-2">選項</label>
              <div class="w-full flex flex-wrap gap-y-1.5 border mb-2">
                <div
                  v-for="(option, index) in voteOptions"
                  :key="index"
                  class="relative basis-1/2 flex-1 flex items-center flex-wrap border"
                >
                  <input
                    v-model="voteOptions[index].text"
                    type="text"
                    class="border-2 border-stone-700 w-full px-4 py-2 pr-8 truncate"
                    required
                  />
                  <button
                    @click="removeOption(index)"
                    type="button"
                    class="absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center text-red-500"
                    v-if="voteOptions.length > 2"
                  >
                    <TrashIcon class="h-6 w-6 transition-all hover:text-red-600" />
                  </button>
                </div>
              </div>

              <button
                @click="addOption"
                type="button"
                class="p-2 bg-emerald-600 hover:bg-emerald-500 transition-all text-white w-full"
              >
                <PlusIcon class="mx-auto w-5 h-5" />
              </button>
            </div>
            <div>
              <label for="endDate" class="block text-stone-700 font-bold mb-2">截止日期</label>
              <input
                id="endDate"
                v-model="endDate"
                type="date"
                class="border-2 border-stone-700 w-full px-4 py-2"
                required
              />
            </div>
            <div v-if="errorMessage" class="mb-4 text-red-600">
              {{ errorMessage }}
            </div>
            <button
              type="submit"
              class="mt-12 px-4 py-2 bg-sky-600 hover:bg-sky-500 transition-all text-white font-bold w-full"
            >
              創建投票
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
