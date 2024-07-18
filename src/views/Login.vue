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
  <div class="bg-login bg-cover bg-no-repeat bg-center w-screen h-screen">
    <div class="min-w-fit flex justify-between items-center w-screen h-full">
      <div class="basis-3/5 flex flex-col items-center">
        <div class="flex items-center border-4 border-white text-[#b4b2b265] p-4 w-fit">
          <img src="/assets/img/deerIcon.png" alt="deerIcon" class="w-16 2xl:w-24" />
        </div>
        <span class="text-white text-[#8d8c8ca0] text-3xl font-bold">WILDLENS</span>
      </div>
      <div
        class="relative h-full basis-2/5 bg-stone-800 bg-opacity-40 flex flex-col justify-center items-center"
      >
        <router-link :to="{ name: 'Help' }">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="absolute top-6 right-6 w-10 h-10 text-white 2xl:w-12 2xl:h-12"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </router-link>
        <div class="text-white flex flex-col justify-center items-center gap-6">
          <div
            class="border mb-3 text-center flex flex-col w-full bg-[#d1d1d1] px-2 py-1 text-stone-800"
            :class="
              loginIsFailed === LoginStatus.EmailError ? 'border-red-500' : 'border-transparent'
            "
          >
            <div class="border-b-2 border-stone-300 flex items-center gap-2 w-full py-1 2xl:px-2">
              <label class="text-stone-700 opacity-80 2xl:text-lg" for="username">信箱:</label>
              <input
                id="username"
                v-model="email"
                class="focus:ring-0 focus:outline-none bg-transparent max-w-52 text-sm 2xl:text-base"
                type="text"
                name="username"
                required
                autocomplete="autocomplete_off"
              />
            </div>
          </div>
          <div
            class="border mb-3 text-center flex flex-col w-full bg-[#d1d1d1] px-2 py-1 text-stone-800"
            :class="
              loginIsFailed === LoginStatus.PasswordError ? 'border-red-500' : 'border-transparent'
            "
          >
            <div class="border-b-2 border-stone-300 flex gap-2 py-1 2xl:px-2">
              <label class="text-stone-700 opacity-80 2xl:text-lg" for="password">密碼:</label>
              <input
                id="password"
                v-model="password"
                class="focus:ring-0 focus:outline-none bg-transparent max-w-52 text-sm 2xl:text-base"
                type="password"
                name="password"
                required
                autocomplete="autocomplete_off"
              />
            </div>
          </div>
          <button
            type="button"
            class="w-full bg-stone-600 border-2 border-stone-100 text-white px-4 py-2 hover:bg-stone-100 hover:text-stone-800 focus:outline-none tracking-widest transition-all duration-500 2xl:text-lg"
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
          <div class="text-sm 2xl:text-base underline">
            <router-link :to="{ name: 'Register' }"> 還未註冊? </router-link>
          </div>
        </div>
        <div class="absolute bottom-10 flex justify-end w-full gap-4 pr-4">
          <router-link :to="{ name: 'Articles' }">
            <button
              class="border-2 border-transparent text-white py-2 px-4 hover:bg-stone-100 hover:text-stone-600 hover:border-stone-100 tracking-widest transition-all duration-500 2xl:text-lg 2xl:px-6"
            >
              返回主頁
            </button>
          </router-link>
          <router-link :to="{ name: 'Help' }">
            <button
              class="border-2 border-stone-100 text-stone-100 py-2 px-4 hover:bg-stone-100 hover:text-stone-600 tracking-widest transition-all duration-500 2xl:text-lg 2xl:px-6"
            >
              關於我們
            </button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
