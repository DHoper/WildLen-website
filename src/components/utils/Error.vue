<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorStore } from '../../stores/error.ts'

const errorData = ref()
const router = useRouter()
const navigateHome = () => {
  router.push({ name: 'Articles' })
}
onMounted(() => {
  const errorStore = useErrorStore()
  errorData.value = errorStore.data
})
</script>

<template>
  <div v-if="errorData" class="relative flex-1">
    <img
      src="https://plus.unsplash.com/premium_photo-1663954865317-3e2c288cf5be?auto=format&fit=crop&q=80&w=1770&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      alt=""
      class="absolute inset-0 -z-10 size-full object-cover object-top"
    />
    <div
      class="flex size-full flex-col items-center justify-center gap-12 bg-black bg-opacity-20 text-center"
    >
      <h1 class="text-5xl font-semibold text-white 2xl:text-6xl">Oops! 有事情不對勁!</h1>
      <p class="my-6 text-xl text-white 2xl:text-2xl">
        {{ errorData.name }}: {{ errorData.message }}
      </p>
      <div
        class="mt-10 flex cursor-pointer justify-center gap-2 border-2 border-transparent p-2 text-2xl font-semibold leading-7 text-white transition-all duration-300 hover:border-white 2xl:gap-8 2xl:text-3xl"
        @click="navigateHome"
      >
        <span aria-hidden="true">&larr;</span>返回
      </div>
    </div>
  </div>
</template>
