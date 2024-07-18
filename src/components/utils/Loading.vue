<script setup lang="ts">
import { computed } from 'vue'
import { useLoadingStore } from '../../stores/loading'

const isLoading = computed(() => useLoadingStore().getLoadingStatus())
</script>

<template>
  <div
    v-if="isLoading"
    class="fixed top-0 left-0 z-50 w-screen h-screen flex flex-col gap-8 2xl:gap-16 items-center justify-center bg-stone-600 bg-opacity-100"
  >
    <div class="relative p-4 flex">
      <div
        class="absolute top-0 left-0 w-full h-full border-[.375rem] border-white text-[#b4b2b265] animate-loading"
      />
      <img src="/assets/img/deerIcon.png" alt="deerIcon" class="w-16 2xl:w-24" />
    </div>
    <div class="flex items-center justify-between gap-8">
      <div class="w-3 h-3 2xl:w-6 2xl:h-6">
        <div class="w-2 h-2 2xl:w-4 2xl:h-4 bg-white opacity-0 rounded-full animate-bounce1" />
      </div>
      <div class="w-3 h-3 2xl:w-6 2xl:h-6">
        <div class="w-2 h-2 2xl:w-4 2xl:h-4 bg-white opacity-0 rounded-full animate-bounce2" />
      </div>
      <div class="w-3 h-3 2xl:w-6 2xl:h-6">
        <div class="w-2 h-2 2xl:w-4 2xl:h-4 bg-white opacity-0 rounded-full animate-bounce3" />
      </div>
      <div class="w-3 h-3 2xl:w-6 2xl:h-6">
        <div class="w-2 h-2 2xl:w-4 2xl:h-4 bg-white opacity-0 rounded-full animate-bounce4" />
      </div>
    </div>
  </div>
</template>
