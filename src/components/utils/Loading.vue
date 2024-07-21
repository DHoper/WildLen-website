<script setup lang="ts">
import { computed } from 'vue'
import { useLoadingStore } from '../../stores/loading'

const isLoading = computed(() => useLoadingStore().getLoadingStatus())
</script>

<template>
  <div
    v-if="isLoading"
    class="fixed left-0 top-0 z-50 flex h-screen w-screen flex-col items-center justify-center gap-8 bg-stone-600 bg-opacity-100 2xl:gap-16"
  >
    <div class="relative flex p-4">
      <div
        class="absolute left-0 top-0 size-full animate-loading border-[.375rem] border-white text-[#b4b2b265]"
      />
      <img src="/assets/img/deerIcon.png" alt="deerIcon" class="w-16 2xl:w-24" />
    </div>
    <div class="flex items-center justify-between gap-8">
      <div class="size-3 2xl:size-6">
        <div class="size-2 animate-bounce1 rounded-full bg-white opacity-0 2xl:size-4" />
      </div>
      <div class="size-3 2xl:size-6">
        <div class="size-2 animate-bounce2 rounded-full bg-white opacity-0 2xl:size-4" />
      </div>
      <div class="size-3 2xl:size-6">
        <div class="size-2 animate-bounce3 rounded-full bg-white opacity-0 2xl:size-4" />
      </div>
      <div class="size-3 2xl:size-6">
        <div class="size-2 animate-bounce4 rounded-full bg-white opacity-0 2xl:size-4" />
      </div>
    </div>
  </div>
</template>
