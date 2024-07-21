<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useUserStore } from '../../stores/user'
import { Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/vue'
import {
  UserIcon,
  BookmarkSquareIcon,
  ArrowRightStartOnRectangleIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  BellIcon
} from '@heroicons/vue/24/outline'
import { useRoute } from 'vue-router'
import router from '../../router'

const route = useRoute()

const userStore = useUserStore()
const user = computed(() => userStore.user)
const isLogin = computed<boolean>(() => userStore.isLogin)

const userActions = [
  {
    actionName: '個人資訊',
    icon: UserIcon,
    action: () => router.push({ name: 'PersonalInfo', params: { email: 'self' } })
  },
  {
    actionName: '貼文',
    icon: BookmarkSquareIcon,
    action: () => router.push({ name: 'PersonalPosts' })
  },
  // { actionName: '追蹤', icon: HeartIcon },
  {
    actionName: '幫助',
    icon: QuestionMarkCircleIcon,
    action: () => router.push({ name: 'Help' })
  },
  {
    actionName: '登出',
    action: userStore.logout,
    icon: ArrowRightStartOnRectangleIcon
  }
]

const notifications = [
  { content: '#Molina123 為你的一則貼文點了讚' },
  { content: '#Fain64543 為你的一則貼文點了讚' },
  { content: '#Ol34i2 已經開始追蹤您' },
  { content: '#Albert34442 為你的一則貼文點了讚', href: '#' }
]

//----隱藏效果
const isHidden = ref(false)

let prevScrollY = window.scrollY

const handleScroll = () => {
  const currentScrollY = window.scrollY
  isHidden.value = currentScrollY > prevScrollY
  prevScrollY = currentScrollY
}

const refreshCurrentRoute = (routeName: string) => {
  if (route.name === routeName) {
    router.go(0)
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <nav
    class="sticky top-0 z-40 flex w-full items-center justify-between bg-stone-600 px-6 py-4 font-Cormorant text-white lg:py-2 2xl:py-4"
    id="invisible"
    :class="{ invisible: isHidden, visible: !isHidden }"
  >
    <div class="flex items-center">
      <img src="/assets/img/deerIcon.png" alt="deerIcon" class="mr-0 w-8 2xl:w-12" />
      <a class="ml-2 text-xl font-bold lg:text-2xl 2xl:text-3xl" href="/">WILDLENS</a>
    </div>
    <div class="flex items-center gap-4 transition-all">
      <ul class="hidden gap-0 text-base font-thin sm:flex lg:gap-3 lg:text-lg 2xl:text-xl">
        <li
          class="border-2 border-transparent py-1 font-bold text-white transition-all duration-700 ease-in-out hover:border-white"
        >
          <router-link
            @click="refreshCurrentRoute('Articles')"
            :to="{ name: 'Articles' }"
            class="px-4 tracking-widest"
            >文章</router-link
          >
        </li>
        <li
          class="border-2 border-transparent py-1 font-bold text-white transition-all duration-700 ease-in-out hover:border-white"
        >
          <router-link
            @click="refreshCurrentRoute('Explore')"
            :to="{ name: 'Explore' }"
            class="px-4 tracking-widest"
            >探索</router-link
          >
        </li>
        <li
          class="border-2 border-transparent py-1 font-bold text-white transition-all duration-700 ease-in-out hover:border-white"
        >
          <router-link
            @click="refreshCurrentRoute('Gallery')"
            :to="{ name: 'Gallery' }"
            class="px-4 tracking-widest"
            >照片牆</router-link
          >
        </li>
        <li
          class="border-2 border-transparent py-1 font-bold text-white transition-all duration-700 ease-in-out hover:border-white"
        >
          <router-link
            @click="refreshCurrentRoute('Community')"
            :to="{ name: 'Community' }"
            class="px-4 tracking-widest"
            >社區</router-link
          >
        </li>
      </ul>
      <div
        v-if="isLogin && user && user.profile"
        class="flex items-center gap-2 border-2 border-transparent"
      >
        <PopoverGroup class="flex items-center gap-2">
          <Popover>
            <PopoverButton
              class="flex items-center gap-x-1 text-sm font-semibold leading-6 focus:outline-none"
            >
              <BellIcon class="w-6 text-white 2xl:w-8" />
            </PopoverButton>

            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <PopoverPanel
                class="absolute right-2 top-2/3 z-10 mt-3 flex w-72 flex-col items-center overflow-hidden rounded bg-white shadow-lg ring-1 ring-stone-600 2xl:w-96"
              >
                <div class="w-full">
                  <span
                    class="block w-full rounded rounded-b-none border border-white bg-stone-600 p-3 px-5 text-lg font-bold text-white"
                    >通知</span
                  >
                  <div class="border border-white">
                    <div
                      v-for="(notification, index) in notifications"
                      :key="index"
                      class="p-3 px-5 text-sm leading-6 text-stone-700 hover:bg-stone-100 2xl:p-5 2xl:text-base"
                    >
                      <div class="flex-auto">
                        <a
                          :href="notification.href"
                          class="block overflow-hidden truncate whitespace-nowrap"
                        >
                          {{ notification.content }}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverPanel>
            </transition>
          </Popover>
          <Popover class="h-12">
            <PopoverButton class="focus:outline-none" @click="closeMenu">
              <div
                class="flex size-12 items-center justify-center overflow-hidden rounded-full bg-white p-1"
              >
                <img
                  class="rounded-full object-cover"
                  :src="`/assets/img/avatar (${user.profile.selectedAvatarIndex}).png`"
                  alt="avatar"
                />
              </div>
            </PopoverButton>

            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <PopoverPanel
                class="absolute right-2 top-2/3 z-10 mt-4 flex flex-col items-center overflow-hidden rounded bg-white shadow-lg ring-1 ring-stone-600"
              >
                <div class="w-64">
                  <div
                    class="flex items-center gap-4 rounded rounded-b-none border border-b-0 border-white bg-stone-600 px-6 py-4"
                  >
                    <div
                      class=" flex size-16 items-center justify-center rounded-full border border-stone-700 bg-white p-2"
                    >
                      <img
                        class="rounded-full"
                        :src="`/assets/img/avatar (${user.profile.selectedAvatarIndex}).png`"
                        alt="avatar"
                      />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-xl font-bold">#{{ user.username }}</span>
                      <span class="text-sm">{{ user.email }}</span>
                    </div>
                  </div>
                  <div class="border border-white">
                    <div
                      v-for="(userAction, index) in userActions"
                      :key="index"
                      class="w-full cursor-pointer text-lg leading-6 text-stone-700 hover:bg-stone-200 lg:text-base 2xl:text-sm"
                    >
                      <div
                        @click="userAction.action"
                        class="flex flex-auto items-center gap-2 px-6 py-4  "
                      >
                        <div class="flex flex-none items-center justify-center">
                          <component :is="userAction.icon" class="w-4 " aria-hidden="true" />
                        </div>
                        <span
                          class="block whitespace-nowrap text-center tracking-widest"
                        >
                          {{ userAction.actionName }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverPanel>
            </transition>
          </Popover>
        </PopoverGroup>
      </div>
      <button
        v-else
        class="h-12 border-2 border-stone-600 bg-white px-2 py-1  text-2xl font-bold text-stone-700 transition-all duration-700 ease-in-out hover:border-white hover:bg-[#4b493ded] hover:text-white md:text-lg 2xl:text-xl"
      >
        <router-link :to="{ name: 'Login' }">Get started</router-link>
      </button>
      <div class="flex items-center gap-2 sm:hidden">
        <button class="text-white focus:outline-none" @click="toggleMenu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="size-8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      <transition
        enter-active-class="transition-max-height east duration-500"
        enter-from-class="max-h-0"
        enter-to-class="max-h-screen"
        leave-active-class="transition-max-height east duration-500"
        leave-from-class="max-h-screen"
        leave-to-class="max-h-0"
      >
        <div v-if="isMenuOpen" class="absolute left-0 top-20 z-50 w-full bg-stone-600 text-center">
          <ul class="flex flex-col items-start p-4 text-white">
            <li class="mx-auto my-2 w-3/4 border-b border-white py-2">
              <router-link
                @click="
                  () => {
                    refreshCurrentRoute('Articles')
                    closeMenu()
                  }
                "
                :to="{ name: 'Articles' }"
                class="block w-full px-4"
                >文章</router-link
              >
            </li>
            <li class="mx-auto my-2 w-3/4 border-b border-white py-2">
              <router-link
                @click="
                  () => {
                    refreshCurrentRoute('Explore')
                    closeMenu()
                  }
                "
                :to="{ name: 'Explore' }"
                class="block w-full px-4"
                >探索</router-link
              >
            </li>
            <li class="mx-auto my-2 w-3/4 border-b border-white py-2">
              <router-link
                @click="
                  () => {
                    refreshCurrentRoute('Gallery')
                    closeMenu()
                  }
                "
                :to="{ name: 'Gallery' }"
                class="block w-full px-4"
                >照片牆</router-link
              >
            </li>
            <li class="mx-auto my-2 w-3/4 py-2">
              <router-link
                @click="
                  () => {
                    refreshCurrentRoute('Community')
                    closeMenu()
                  }
                "
                :to="{ name: 'Community' }"
                class="block w-full px-4"
                >社區</router-link
              >
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </nav>
</template>
