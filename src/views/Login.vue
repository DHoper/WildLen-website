<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, LoginStatus } from '../stores/user'

const userStore = useUserStore()
const router = useRouter()

const email = ref<string | null>(null)
const password = ref<string | null>(null)
const loginIsFailed = computed<LoginStatus | undefined>(() => userStore.loggingStatus)

async function login() {
  if (email.value && password.value) {
    await userStore
      .login(email.value, password.value)
      .catch((err) => console.error('請求登錄失敗:', err))
    if (userStore.isLogin) {
      router.push({ name: 'Articles' })
    } else {
      alert('帳號或密碼錯誤')
    }
  }
}
</script>

<template>
  <div class="h-screen w-screen bg-login bg-cover bg-center bg-no-repeat">
    <div class="flex h-full w-screen min-w-fit flex-col items-center justify-between sm:flex-row">
      <div class="flex w-full basis-2/5  flex-col items-center justify-center sm:w-auto sm:basis-1/2 md:basis-3/5">
        <div class="flex w-fit items-center border-4 border-white p-4 text-[#b4b2b265]">
          <img src="/assets/img/deerIcon.png" alt="deerIcon" class="w-16 2xl:w-24" />
        </div>
        <span class="text-3xl font-bold  text-white">WILDLENS</span>
      </div>
      <div
        class="relative flex size-full basis-3/5 flex-col  items-center justify-center sm:w-auto sm:basis-1/2 sm:bg-stone-800/40 md:basis-2/5 "
      >
        <router-link :to="{ name: 'Help' }">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="absolute right-6 top-6 size-10 text-white 2xl:size-12"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </router-link>
        <div class="flex w-4/5 flex-col items-center justify-center gap-6 text-white sm:w-auto">
          <div
            class="mb-3 flex w-full flex-col border bg-[#d1d1d1] px-2 py-1 text-center text-stone-800"
            :class="
              loginIsFailed === LoginStatus.EmailError ? 'border-red-500' : 'border-transparent'
            "
          >
            <div class="flex w-full items-center gap-2 border-b-2 border-stone-300 py-1 2xl:px-2">
              <label class="text-stone-700 opacity-80 2xl:text-lg" for="username">信箱 :</label>
              <input
                id="username"
                v-model="email"
                class="flex-1 bg-transparent text-lg focus:outline-none focus:ring-0 sm:max-w-52 md:text-sm 2xl:text-base"
                type="text"
                name="username"
                required
                autocomplete="autocomplete_off"
              />
            </div>
          </div>
          <div
            class="mb-3 flex w-full flex-col border bg-[#d1d1d1] px-2 py-1 text-center text-stone-800"
            :class="
              loginIsFailed === LoginStatus.PasswordError ? 'border-red-500' : 'border-transparent'
            "
          >
            <div class="flex gap-2 border-b-2 border-stone-300 py-1 2xl:px-2">
              <label class="text-stone-700 opacity-80 2xl:text-lg" for="password">密碼 :</label>
              <input
                id="password"
                v-model="password"
                class="flex-1 bg-transparent text-lg focus:outline-none focus:ring-0 sm:max-w-52 md:text-sm 2xl:text-base"
                type="password"
                name="password"
                required
                autocomplete="autocomplete_off"
              />
            </div>
          </div>
          <button
            type="button"
            class="w-full border-2 border-stone-100 bg-stone-600 px-4 py-2 tracking-widest text-white transition-all duration-500 hover:bg-stone-100 hover:text-stone-800 focus:outline-none 2xl:text-lg"
            @click="login"
          >
            登入
          </button>
          <!-- <button
            type="button"
            class="w-full bg-[#FF5722] text-white border-2 border-[#FF5722] px-4 py-2 opacity-90 hover:bg-[#FF5722] hover:opacity-100 transition-all duration-500 2xl:text-lg"
          >
            使用Google帳號登錄
          </button> -->
          <div class="text-sm underline 2xl:text-base">
            <router-link :to="{ name: 'Register' }"> 還未註冊? </router-link>
          </div>
        </div>
        <div class="absolute bottom-10 flex w-full justify-end gap-4 pr-4">
          <router-link :to="{ name: 'Articles' }">
            <button
              class="border-2 border-transparent px-4 py-2 tracking-widest text-white transition-all duration-500 hover:border-stone-100 hover:bg-stone-100 hover:text-stone-600 2xl:px-6 2xl:text-lg"
            >
              返回主頁
            </button>
          </router-link>
          <router-link :to="{ name: 'Help' }">
            <button
              class="border-2 border-stone-100 px-4 py-2 tracking-widest text-stone-100 transition-all duration-500 hover:bg-stone-100 hover:text-stone-600 2xl:px-6 2xl:text-lg"
            >
              關於我們
            </button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
