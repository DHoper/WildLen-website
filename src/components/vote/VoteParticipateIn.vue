<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { participateInVote } from '@/api/community/vote'
import type { UserVote, Vote } from '@/types/Vote'
import { useLoadingStore } from '@/stores/loading'

const props = defineProps({
  vote: {
    type: Object as () => Vote,
    required: true
  },
  isUserVoted: Boolean || null,
  existingUserVote: Object as () => UserVote | null
})

const userStore = useUserStore()
const selectedOptionId = ref<number | null>(null)

const handleVote = async () => {
  const loadingStore = useLoadingStore() //設置loading動畫頁
  loadingStore.setLoadingStatus(true)
  loadingStore.setInRequest(true)

  if (selectedOptionId.value !== null) {
    try {
      await participateInVote(props.vote.id!, userStore.user!.id, selectedOptionId.value)

      location.reload()
    } catch (error) {
      console.error('Error submitting vote:', error)
    }
  }
}

const selectOption = (optionId: number) => {
  if (props.isUserVoted) return
  selectedOptionId.value = optionId
}

const userHasVoted = computed(() => {
  return props.isUserVoted
})

const getOptionClass = (optionId: number) => {
  if (selectedOptionId.value === optionId) {
    return 'bg-stone-500 text-white'
  } else if (props.existingUserVote && props.existingUserVote.voteOptionId === optionId) {
    return 'bg-stone-500 text-white'
  } else {
    return 'border border-stone-500 bg-white'
  }
}

</script>

<template>
  <div v-if="props.vote" class="w-full">
    <div class="mt-4 flex flex-col gap-4">
      <div
        v-for="option in props.vote.options"
        :key="option.id"
        @click="selectOption(option.id!)"
        class="cursor-pointer"
      >
        <div
          class="border-2 border-stone-500 p-4 py-3 font-semibold"
          :class="['w-full shrink-0 truncate', getOptionClass(option.id!)]"
          @click="selectOption(option.id!)"
        >
          {{ option.text }}
        </div>
      </div>
    </div>
    <button
      v-if="!userHasVoted"
      @click="handleVote"
      class="ml-auto mt-16 block bg-blue-900 p-2 px-8 text-white transition-all hover:bg-blue-700"
    >
      投票
    </button>
  </div>
</template>