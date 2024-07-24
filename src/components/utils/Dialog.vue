<script setup lang="ts">
import type { Dialog } from '@/types/Common'
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  dialogData: {
    type: Object as () => Dialog,
    required: true
  }
})

const emit = defineEmits(['closePopup'])

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = 'auto'
})
</script>

<template>
  <div
    class="fixed left-0 top-0 z-50 flex h-full w-screen items-center justify-center bg-stone-700/80"
  >
    <div class="-mt-20 w-80 p-1 2xl:w-96">
      <div
        class="flex flex-col items-center justify-around gap-6 py-10 text-white 2xl:py-16"
        :class="props.dialogData.warringStyle ? 'bg-red-500/90' : 'bg-stone-600'"
      >
        <h3 class="text-2xl tracking-widest">{{ props.dialogData.title }}</h3>
        <p>{{ props.dialogData.content }}</p>
        <div class="flex w-full gap-4 px-8">
          <button
            @click="emit('closePopup', true)"
            class="flex-1 border-2 border-white p-2 text-lg transition-all duration-300 hover:bg-white"
            :class="
              props.dialogData.warringStyle
                ? 'bg-red-500/90 hover:text-red-500/75'
                : 'hover:text-stone-600'
            "
          >
            確認
          </button>
          <button
            v-if="props.dialogData.cancelButton"
            @click="emit('closePopup', false)"
            class="flex-1 border-2 border-white bg-white p-2 text-lg text-stone-600 transition-all duration-300 hover:bg-white"
            :class="props.dialogData.warringStyle ? 'hover:text-red-500/75' : 'hover:font-bold'"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
