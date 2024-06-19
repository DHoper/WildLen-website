<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const navigateHome = () => {
    router.push({name: "Articles"});
};
</script>


<template>
  <div class="flex-1 relative">
    <img
      src="https://plus.unsplash.com/premium_photo-1663954865317-3e2c288cf5be?auto=format&fit=crop&q=80&w=1770&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      alt=""
      class="absolute inset-0 -z-10 h-full w-full object-cover object-top"
    >
    <div
      class="w-full text-center flex flex-col items-center justify-center gap-12 h-full bg-stone-800 bg-opacity-30"
    >
      <p class="text-8xl 2xl:text-9xl font-semibold leading-8 text-white">
        404
      </p>
      <h1 class="mt-4 text-3xl 2xl:text-4xl font-bold tracking-tight text-white sm:text-5xl">
        找不到此頁面
      </h1>
      <div
        class="mt-10 flex justify-center gap-2 text-2xl 2xl:text-3xl 2xl:gap-8 font-semibold leading-7 p-2 text-white cursor-pointer border-2 border-transparent hover:border-stone-100 transition-all duration-300"
        @click="navigateHome"
      >
        <span aria-hidden="true">&larr;</span>返回
      </div>
    </div>
  </div>
</template>