<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useErrorStore } from "../../stores/error.ts";

const errorData = ref();
const router = useRouter();
const navigateHome = () => {
  router.push({ name: "Articles" });
};
onMounted(() => {
  const errorStore = useErrorStore();
  errorData.value = errorStore.data;
});
</script>


<template>
  <div v-if="errorData" class="flex-1 relative">
    <img
      src="https://plus.unsplash.com/premium_photo-1663954865317-3e2c288cf5be?auto=format&fit=crop&q=80&w=1770&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      alt="" class="absolute inset-0 -z-10 h-full w-full object-cover object-top">
    <div class="w-full text-center flex flex-col items-center justify-center gap-12 h-full bg-black bg-opacity-20">
      <h1 class="text-5xl 2xl:text-6xl font-semibold text-white">
        Oops! 有事情不對勁!
      </h1>
      <p class="my-6 text-white text-xl  2xl:text-2xl">
        {{ errorData.name }}: {{ errorData.message }}
      </p>
      <div
        class="mt-10 flex justify-center gap-2 text-2xl 2xl:text-3xl 2xl:gap-8 font-semibold leading-7 p-2 text-white cursor-pointer border-2 border-transparent hover:border-white transition-all duration-300"
        @click="navigateHome">
        <span aria-hidden="true">&larr;</span>返回
      </div>
    </div>
  </div>
</template>
