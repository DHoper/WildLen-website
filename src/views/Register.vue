<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ExclamationCircleIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router'
import { useLoadingStore } from '../stores/loading'
import { useUserStore } from '../stores/user'
import { registerUser } from '@/api/auth/auth'
import { type FieldName, inputValidator } from '../utils/validator'
import { topicTags } from '../fakeData/topicTags.js'

const loadingStore = useLoadingStore()
const router = useRouter()

//表單註冊
const formInput = ref({
  email: '',
  username: '',
  password: '',
  passwordConfirm: '',
  selectedAvatarIndex: Math.floor(Math.random() * 12) + 1
})

////表單註冊-頭像
const showAvatarSelector = ref<boolean>(false)

////表單註冊-主題
const selectedTags = ref<string[]>([])

////表單註冊-驗證
const validator = inputValidator()
const validateInput = (fieldName: FieldName) => {
  //重新包裝validator
  validator.validate(fieldName, formInput.value)
}
////表單註冊-提交
const handleRegisterSuccess = (email: string, password: string) => {
  const userStore = useUserStore()
  userStore.login(email, password)
  router.push({ name: 'Articles' })
}

const finished = computed(() => {
  return (
    formInput.value.email &&
    formInput.value.username &&
    formInput.value.password &&
    formInput.value.passwordConfirm &&
    formInput.value.selectedAvatarIndex &&
    selectedTags.value.length > 0
  )
})

async function handleSubmit() {
  if (finished.value) {
    loadingStore.setLoadingStatus(true)
    loadingStore.setInRequest(true)
    loadingStore.setIsCountingSeconds(true)
    loadingStore.setIsCountingSeconds(false)
    const submitFormData = {
      email: formInput.value.email,
      username: formInput.value.username,
      password: formInput.value.password,
      selectedAvatarIndex: formInput.value.selectedAvatarIndex,
      selectedTags: selectedTags.value
    }

    await registerUser(submitFormData).catch((err) => {
      console.error(`registerUser 失敗: ${err}`)
    })
    loadingStore.setInRequest(false)
    loadingStore.setLoadingStatus(false)

    handleRegisterSuccess(submitFormData.email, submitFormData.password)
  } else {
    alert('請輸入正確註冊資料')
  }
}

////表單註冊-交互流程
const formStep = ref<number>(0)
const formInputInvalid = validator.formInputInvalid
const nextStep = () => {
  if (formStep.value === 0) {
    if (!formInput.value.email || !formInput.value.username) {
      formInputInvalid.value.email = {
        ...formInputInvalid.value.email,
        valid: !!formInput.value.email
      }
      formInputInvalid.value.username = !!formInput.value.username
    }
    validateInput('email')
    validateInput('username')

    if (
      !formInputInvalid.value.email.valid ||
      formInputInvalid.value.email.registered ||
      !formInputInvalid.value.username
    ) {
      return
    }
  } else if (formStep.value === 1) {
    if (!formInput.value.password || !formInput.value.passwordConfirm) {
      formInputInvalid.value.password = !!formInput.value.password
      formInputInvalid.value.passwordConfirm = !!formInput.value.passwordConfirm
    }
    validateInput('password')
    validateInput('passwordConfirm')
    if (
      !formInputInvalid.value.password ||
      !formInputInvalid.value.passwordConfirm ||
      !formInput.value.password ||
      !formInput.value.passwordConfirm
    ) {
      return
    }
  }
  if (formStep.value !== 1) showAvatarSelector.value = false
  formStep.value++
}
const previousStep = () => {
  if (formStep.value !== 1) showAvatarSelector.value = false
  formStep.value--
}

//右側tab互動效果
const nav = ref<HTMLButtonElement | null>()
enum Tab {
  Tab1 = 0,
  Tab2 = 1,
  Tab3 = 2
}

const activeTab = ref<Tab>(Tab.Tab1)
const addTabClass = (index: number) => {
  activeTab.value = index
}

watch(activeTab, () => {
  Array.from(nav.value?.children || []).forEach((item, index) => {
    if (index === activeTab.value) {
      item.classList.add('text-white', 'border-white', 'border-b-2', 'scale-110')
    } else {
      item.classList.remove('text-white', 'border-white', 'border-b-2', 'scale-110')
    }
  })
})
</script>

<template>
  <div class="relative flex h-screen w-screen overflow-hidden">
    <div
      class="flex w-full min-w-fit flex-col items-center justify-start gap-0 bg-stone-700 opacity-95 sm:w-3/5 sm:justify-center sm:gap-10 md:w-96 2xl:w-1/3 2xl:gap-0"
    >
      <div class="mt-24 sm:mt-8">
        <div class="mx-auto flex w-fit flex-1 items-center border-4 border-white p-4">
          <img src="/assets/img/deerIcon.png" alt="deerIcon" class="w-16 2xl:w-20" />
        </div>
        <span class="text-3xl font-bold text-white 2xl:text-4xl">WILDLEN</span>
      </div>
      <form
        method="POST"
        autocomplete="off"
        @submit.prevent="handleSubmit"
        class="flex w-96 flex-1 flex-col items-center justify-center gap-6 text-white sm:w-80 sm:flex-none sm:justify-start 2xl:mt-32 2xl:w-96 2xl:gap-12"
      >
        <div class="w-full">
          <div v-if="formStep === 0" class="flex flex-col gap-6">
            <div
              class="relative mb-3 flex flex-col border-2 bg-[#61606058] px-2 pb-0 pt-1 text-center"
              :class="
                !formInputInvalid.email.valid || formInputInvalid.email.registered
                  ? 'border-red-500 pb-1'
                  : 'border-transparent'
              "
            >
              <div
                class="flex w-full items-baseline gap-2 border-stone-300 py-1 2xl:p-2"
                :class="
                  !formInputInvalid.email.valid || formInputInvalid.email.registered
                    ? 'border-none'
                    : 'border-b-2'
                "
              >
                <label class="text-gray-200 opacity-80 2xl:text-lg" for="email"
                  >信&emsp;&emsp;箱 :</label
                >
                <input
                  v-model="formInput.email"
                  @blur="validateInput('email')"
                  class="flex-1 border-0 bg-transparent text-sm text-white focus:outline-none focus:ring-0 2xl:text-base"
                  type="text"
                  placeholder="請輸入有效信箱"
                  name="email"
                  id="email"
                  required
                  autocomplete="autocomplete_off"
                />
              </div>
              <div
                v-if="!formInputInvalid.email.valid"
                class="absolute -top-6 left-0 flex w-full items-center justify-center gap-1 text-sm text-red-500 2xl:text-base"
              >
                <ExclamationCircleIcon class="w-4" />
                <p>請輸入有效信箱</p>
              </div>
              <div
                v-else-if="formInputInvalid.email.registered"
                class="absolute -top-6 left-0 flex w-full items-center justify-center gap-1 text-sm text-red-500 2xl:text-base"
              >
                <ExclamationCircleIcon class="w-4" />
                <p>此信箱已被註冊</p>
              </div>
            </div>
            <div
              class="relative mb-3 flex flex-col border-2 bg-[#61606058] px-2 pb-0 pt-1 text-center"
              :class="formInputInvalid.username ? 'border-transparent' : 'border-red-500 pb-1'"
            >
              <div
                class="flex w-full items-baseline gap-2 border-b-2 border-stone-300 py-1 2xl:p-2"
                :class="formInputInvalid.username ? '' : 'border-none'"
              >
                <label class="text-gray-200 opacity-80 2xl:text-lg" for="username"
                  >用戶暱稱 :</label
                >
                <input
                  v-model="formInput.username"
                  @blur="validateInput('username')"
                  class="flex-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 2xl:text-base"
                  type="text"
                  placeholder="2~7字"
                  name="username"
                  id="username"
                  required
                  autocomplete="autocomplete_off"
                />
              </div>
              <div
                v-if="!formInputInvalid.username"
                class="absolute -top-6 left-0 flex w-full items-center justify-center gap-1 text-sm text-red-500 2xl:text-base"
              >
                <ExclamationCircleIcon class="w-4" />
                <p>請輸入2~7字有效暱稱</p>
              </div>
            </div>
          </div>
          <div v-if="formStep === 1" class="flex flex-col gap-6">
            <div
              class="relative mb-3 flex flex-col border-2 bg-[#61606058] px-2 pb-0 pt-1 text-center"
              :class="formInputInvalid.password ? 'border-transparent' : 'border-red-500 pb-1'"
            >
              <div
                class="flex w-full items-baseline gap-2 border-b-2 border-stone-300 py-1 2xl:p-2"
                :class="formInputInvalid.password ? '' : 'border-none'"
              >
                <label class="text-gray-200 opacity-80 2xl:text-lg" for="password"
                  >密&emsp;&emsp;碼 :</label
                >
                <input
                  v-model="formInput.password"
                  @blur="validateInput('password')"
                  placeholder="6 ~ 15字"
                  class="flex-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 2xl:text-base"
                  type="password"
                  name="password"
                  id="password"
                  required
                  autocomplete="new-password"
                />
              </div>
              <div
                v-if="!formInputInvalid.password"
                class="absolute -top-6 left-0 flex w-full items-center justify-center gap-1 text-sm text-red-500 2xl:text-base"
              >
                <ExclamationCircleIcon class="w-4" />
                <p>請輸入六個字以上的有效密碼</p>
              </div>
            </div>
            <div
              class="relative mb-3 flex flex-col border-2 bg-[#61606058] px-2 pb-0 pt-1 text-center"
              :class="
                formInputInvalid.passwordConfirm ? 'border-transparent' : 'border-red-500 pb-1'
              "
            >
              <div
                class="flex w-full items-baseline gap-2 border-b-2 border-stone-300 py-1 2xl:p-2"
                :class="formInputInvalid.passwordConfirm ? '' : 'border-none'"
              >
                <label class="text-gray-200 opacity-80 2xl:text-lg" for="passwordConfirm"
                  >密碼確認 :</label
                >
                <input
                  v-model="formInput.passwordConfirm"
                  @blur="validateInput('passwordConfirm')"
                  placeholder="6 ~ 15字"
                  class="flex-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 2xl:text-base"
                  type="password"
                  name="passwordConfirm"
                  id="passwordConfirm"
                  required
                  autocomplete="new-password"
                />
              </div>
              <div
                v-if="!formInputInvalid.passwordConfirm"
                class="absolute -top-6 left-0 flex w-full items-center justify-center gap-1 text-sm text-red-500 2xl:text-base"
              >
                <ExclamationCircleIcon class="w-4" />
                <p>請輸入與上方相同之密碼</p>
              </div>
            </div>
          </div>
          <div v-if="formStep === 2" class="-mt-4 mb-8 flex flex-col items-center gap-4 2xl:-mt-0">
            <div
              class="w-32 overflow-hidden border-2 border-dashed border-stone-700 bg-stone-100 2xl:w-40"
            >
              <img
                class="p-3"
                :src="`/assets/img/avatar (${formInput.selectedAvatarIndex}).png`"
                alt=""
              />
            </div>
            <button
              @click="showAvatarSelector = true"
              type="button"
              class="w-32 bg-stone-600 px-4 py-2 tracking-widest text-white transition-all duration-500 hover:bg-stone-500 focus:outline-none 2xl:w-40 2xl:text-lg"
            >
              選擇頭像
            </button>
          </div>
          <div v-if="formStep === 3" class="-mt-4 mb-2 flex w-full flex-col">
            <p
              class="w-full border border-b-0 border-stone-500 bg-stone-500 px-4 py-2 text-center text-stone-100 2xl:py-3 2xl:text-lg"
            >
              挑選一些感興趣的主題
            </p>
            <div
              class="flex h-64 w-full flex-wrap items-center justify-center overflow-auto border border-t-0 border-stone-500 bg-stone-600 p-2 sm:h-40"
            >
              <div
                class="flex flex-wrap items-center justify-center"
                v-for="(topic, index) in topicTags"
                :key="index"
              >
                <label
                  v-for="(tag, index) in topic.tags"
                  :key="index"
                  class="m-1 border bg-stone-600 p-1 2xl:p-2"
                  :style="
                    selectedTags.includes(tag) ? `background-color:${topic.color} !important` : ''
                  "
                >
                  <input type="checkbox" v-model="selectedTags" :value="tag" class="hidden" />
                  <span class="cursor-pointer">{{ tag }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="flex w-full gap-4">
          <button
            @click.prevent="previousStep()"
            v-if="formStep !== 0"
            type="button"
            class="flex-1 border-2 border-stone-100 bg-stone-600 px-4 py-2 tracking-widest text-white transition-all duration-500 hover:bg-stone-100 hover:text-stone-800 focus:outline-none"
          >
            上一步
          </button>
          <button
            v-if="formStep !== 3"
            @click.prevent="nextStep"
            type="button"
            class="flex-1 border-2 border-stone-100 bg-stone-600 px-4 py-2 tracking-widest text-white transition-all duration-500 hover:bg-stone-100 hover:text-stone-800 focus:outline-none 2xl:text-lg"
          >
            下一步
          </button>
          <button
            v-else
            :disabled="!finished"
            type="submit"
            class="flex-1 border-2 px-4 py-2 tracking-widest transition-all duration-500 focus:outline-none 2xl:text-lg"
            :class="
              finished
                ? 'bg-stone-600 border-stone-100 text-white  hover:bg-stone-100 hover:text-stone-800'
                : 'border-stone-500 text-stone-500'
            "
          >
            註冊
          </button>
        </div>
        <!-- <button
          v-if="formStep !== 2"
          type="button"
          class="w-full bg-[#FF5722] text-white border-2 border-[#FF5722] px-4 py-2 opacity-90 hover:bg-[#FF5722] hover:opacity-100 transition-all duration-500 2xl:text-lg"
        >
          使用Google帳號註冊
        </button> -->
        <router-link :to="{ name: 'Login' }">
          <div class="text-sm underline 2xl:text-lg">已有帳號?</div>
        </router-link>
      </form>
    </div>
    <div
      class="flex h-screen grow flex-col items-center justify-start gap-10 bg-white bg-register bg-cover bg-center bg-no-repeat font-Raleway text-stone-100 shadow-inner sm:relative 2xl:justify-center"
    >
      <div class="hidden w-full flex-col items-center gap-10 px-4 py-16 md:flex">
        <div
          ref="nav"
          class="flex w-full items-center justify-center gap-16 text-2xl text-[#ffffff9e]"
        >
          <button
            @mouseover="addTabClass(0)"
            class="scale-110 border-b-2 border-white transition duration-500 2xl:text-4xl"
          >
            探索
          </button>
          <button @mouseover="addTabClass(1)" class="transition duration-500 2xl:text-4xl">
            紀錄
          </button>
          <button @mouseover="addTabClass(2)" class="transition duration-500 2xl:text-4xl">
            分享
          </button>
        </div>
        <div class="relative mt-20 flex h-52 w-full flex-col items-center">
          <transition>
            <div v-if="activeTab == 0" class="absolute top-0 flex w-full flex-col items-center">
              <h2 class="mb-4 font-Cormorant text-8xl tracking-tighter 2xl:text-9xl">
                探索&nbsp;&nbsp;視界.
              </h2>
              <p class="text-center text-lg tracking-wide 2xl:mt-10 2xl:text-xl">
                這個廣大壯闊的世界，還有多少你未曾發現的事物?
              </p>
              <p class="text-center text-lg tracking-wide 2xl:mt-2 2xl:text-xl">
                以全新的視野，重新走進這個世界，發掘那些你從前不曾留意過的美麗
              </p>
            </div>
          </transition>
          <transition>
            <div v-if="activeTab == 1" class="absolute top-0 flex flex-col items-center">
              <h2 class="mb-4 font-Cormorant text-8xl tracking-tighter 2xl:text-9xl">
                紀錄&nbsp;&nbsp;冒險.
              </h2>
              <p class="text-lg tracking-wide 2xl:mt-10 2xl:text-xl">
                無論大或小，每一段記憶都值得被好好珍藏
              </p>
              <p class="text-lg tracking-wide 2xl:mt-2 2xl:text-xl">
                從這裡開始，和我們一起，紀錄下那些獨一無二的獨特時光
              </p>
            </div>
          </transition>
          <transition>
            <div v-if="activeTab == 2" class="absolute top-0 flex flex-col items-center">
              <h2 class="mb-4 font-Cormorant text-8xl tracking-tighter 2xl:text-9xl">
                分享&nbsp;&nbsp;體驗.
              </h2>
              <p class="text-center text-lg tracking-wide 2xl:mt-10 2xl:text-xl">
                將你的感動化成照片和文字，與世界各地的人們交流
              </p>
              <p class="text-center text-lg tracking-wide 2xl:mt-2 2xl:text-xl">
                分享的力量是無限的，將你的所見傳遞給出去，彼此的距離因此變得不再遙遠
              </p>
            </div>
          </transition>
        </div>
        <div class="absolute bottom-10 flex w-full justify-end gap-4 pr-4 2xl:pr-10">
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
      <Transition
        name="avatarSelector"
        enter-active-class="animate-slideInRight"
        leave-active-class="animate-slideInRightBack"
      >
        <div
          v-if="showAvatarSelector"
          class="absolute left-0 top-0 flex size-full items-center justify-center bg-stone-700/60"
        >
          <div
            class="z-10 flex size-full flex-col items-center justify-around gap-4 overflow-auto bg-white px-16 pb-10 pt-4 2xl:pt-12"
          >
            <p
              class="block text-2xl font-bold tracking-widest text-stone-700 sm:text-xl 2xl:text-3xl"
            >
              選擇頭像
            </p>
            <div
              class="grid h-96 w-full grid-cols-3 gap-4 overflow-auto p-4 sm:w-auto sm:grid-cols-2 md:h-auto md:grid-cols-6"
            >
              <div v-for="index in 12" :key="index">
                <label class="cursor-pointer">
                  <input
                    class="hidden"
                    type="radio"
                    :value="index"
                    name="avatar"
                    v-model="formInput.selectedAvatarIndex"
                  />
                  <div
                    class="group border-2 border-dashed border-stone-600 p-1 transition-all duration-300 focus-within:border-solid hover:scale-105 hover:border-solid"
                  >
                    <img
                      class="w-full transition-all duration-300 focus:scale-110 sm:w-16 md:w-20 lg:w-32"
                      :src="`/assets/img/avatar (${index}).png`"
                      alt=""
                      tabindex="0"
                    />
                  </div>
                </label>
              </div>
            </div>
            <button
              @click="showAvatarSelector = false"
              class="w-full bg-stone-600 px-4 py-3 font-bold tracking-widest text-white transition-all duration-500 hover:bg-stone-700 focus:outline-none 2xl:p-4 2xl:text-xl"
            >
              關閉
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
