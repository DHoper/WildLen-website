<script setup lang="ts">
import { computed } from 'vue'
import type { Vote } from '@/types/Vote'
import { defineProps } from 'vue'

const props = defineProps({
  vote: {
    type: Object as () => Vote,
    required: true
  }
})

const maxVotes = computed(() => {
  return Math.max(
    ...props.vote.options.map((option) => {
      return props.vote.userVotes!.filter((vote) => vote.voteOptionId === option.id).length
    })
  )
})

const getOptionClass = (optionId: number) => {
  return props.vote.options.some(
    (option) =>
      option.id === optionId &&
      props.vote.userVotes!.filter((vote) => vote.voteOptionId === option.id).length ===
        maxVotes.value
  )
    ? 'bg-emerald-500'
    : 'bg-stone-400'
}
</script>

<template>
  <div v-if="props.vote" class="w-full bg-stone-100 p-6 pb-10 shadow-md">
    <h1 class="my-4 border-b-2 border-stone-300 pb-2 text-xl font-bold text-stone-900 2xl:text-2xl">
      投票結果
    </h1>

    <div class="mt-6 flex flex-col gap-4">
      <div v-for="option in props.vote.options" :key="option.id" class="flex items-center">
        <div class="relative w-full border-2 border-black text-sm">
          <div
            :class="['p-4 py-5 font-semibold text-white', getOptionClass(option.id!)]"
            :style="{
              width:
                (props.vote.userVotes!.filter((vote) => vote.voteOptionId === option.id).length /
                  maxVotes) *
                  100 +
                '%'
            }"
          />
          <span class="absolute left-2 top-1/2 z-10 -translate-y-1/2 font-semibold text-stone-800">
            {{ option.text }}
          </span>
        </div>

        <div class="ml-4 font-bold text-stone-900">
          {{ props.vote.userVotes!.filter((vote) => vote.voteOptionId === option.id).length }}
        </div>
      </div>
    </div>
  </div>
</template>
