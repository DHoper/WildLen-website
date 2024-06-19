<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useUserStore } from "../../stores/user";
import {
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/vue";
import {
  UserIcon,
  BookmarkSquareIcon,
  HeartIcon,
  ArrowLeftOnRectangleIcon,
  QuestionMarkCircleIcon,
  BellIcon,
} from "@heroicons/vue/24/outline";
import type { UserDataType } from "@/types";
import { useRoute } from "vue-router";
import router from "../../router";

const route = useRoute();

const userStore = useUserStore();
const userData = computed(() => userStore.getData()) as any as UserDataType; //問題: 原寫法無法通過TS檢查
const isLogin = computed<boolean>(() => userStore.isLogin);

const userActions = [
  {
    actionName: "個人資訊",
    icon: UserIcon,
    action: () =>
      router.push({ name: "PersonalInfo", params: { email: "self" } }),
  },
  {
    actionName: "貼文",
    icon: BookmarkSquareIcon,
    action: () => router.push({ name: "PersonalPosts" }),
  },
  { actionName: "追蹤", icon: HeartIcon },
  {
    actionName: "幫助",
    icon: QuestionMarkCircleIcon,
    action: () => router.push({ name: "Help" }),
  },
  {
    actionName: "登出",
    action: userStore.logout,
    icon: ArrowLeftOnRectangleIcon,
  },
];

const notifications = [
  { content: "#Molina123 為你的一則貼文點了讚" },
  { content: "#Fain64543 為你的一則貼文點了讚" },
  { content: "#Ol34i2 已經開始追蹤您" },
  { content: "#Albert34442 為你的一則貼文點了讚", href: "#" },
];

//----隱藏效果
const isHidden = ref(false);

let prevScrollY = window.scrollY;

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  isHidden.value = currentScrollY > prevScrollY;
  prevScrollY = currentScrollY;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

const refreshCurrentRoute = (routeName: string) => {
  if (route.name === routeName) {
    router.go(0);
  }
};
</script>

<template>
  <nav
    class="sticky font-Cormorant top-0 w-full bg-stone-600 text-white px-6 py-2 2xl:py-4 flex items-center justify-between z-40"
    id="invisible" :class="{ 'visible-none': isHidden, visible: !isHidden }">
    <div class="logo flex items-center">
      <img src="/assets/img/deerIcon.png" alt="deerIcon" class="w-8 2xl:w-12 mr-0" />
      <a class="ml-2 text-2xl 2xl:text-3xl font-bold" href="/">WILDLENS</a>
    </div>
    <div class="navbar flex items-center gap-4">
      <ul class="flex gap-3 text-lg 2xl:text-xl font-thin">
        <li
          class="border-2 border-transparent hover:border-white transition-all duration-700 ease-in-out font-bold py-1 text-white">
          <router-link @click="refreshCurrentRoute('Articles')" :to="{ name: 'Articles' }"
            class="tracking-widest px-4">文章</router-link>
        </li>
        <li
          class="border-2 border-transparent hover:border-white transition-all duration-700 ease-in-out font-bold py-1 text-white">
          <router-link @click="refreshCurrentRoute('Explore')" :to="{ name: 'Explore' }"
            class="tracking-widest px-4">探索</router-link>
        </li>
        <li
          class="border-2 border-transparent hover:border-white transition-all duration-700 ease-in-out font-bold py-1 text-wite">
          <router-link @click="refreshCurrentRoute('Gallery')" :to="{ name: 'Gallery' }"
            class="tracking-widest px-4">照片牆</router-link>
        </li>
        <li
          class="border-2 border-transparent hover:border-white transition-all duration-700 ease-in-out font-bold py-1 text-white">
          <router-link @click="refreshCurrentRoute('Community')" :to="{ name: 'Community' }"
            class="tracking-widest px-4">社區</router-link>
        </li>
      </ul>
      <div v-if="isLogin && userData" class="avatar border-2 border-transparent flex items-center gap-2">
        <PopoverGroup class="flex items-center gap-2">
          <Popover>
            <PopoverButton class="flex items-center gap-x-1 text-sm font-semibold leading-6 focus:outline-none">
              <BellIcon class="w-6 2xl:w-8 text-white" />
            </PopoverButton>

            <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
              <PopoverPanel
                class="flex items-center flex-col absolute right-2 top-2/3 z-10 mt-3 overflow-hidden rounded bg-white shadow-lg ring-1 ring-stone-600 w-72 2xl:w-96">
                <div class="w-full">
                  <span
                    class="block rounded rounded-b-none bg-stone-600 text-white border border-white p-3 px-5 font-bold w-full 2xl:text-lg">通知</span>
                  <div class="border border-white">
                    <div v-for="(notification, index) in notifications" :key="index"
                      class="p-3 px-5 text-sm 2xl:p-5 2xl:text-base leading-6 hover:bg-stone-100 text-stone-700">
                      <div class="flex-auto">
                        <a :href="notification.href" class="whitespace-nowrap block overflow-hidden truncate">
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
            <PopoverButton class="focus:outline-none">
              <div class="rounded-full bg-white w-12 h-12 p-1 flex items-center justify-center overflow-hidden">
                <img class="rounded-full" :src="`/assets/img/avatar (${userData.selectedAvatarIndex}).png`"
                  alt="avatar" />
              </div>
            </PopoverButton>

            <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
              <PopoverPanel
                class="flex items-center flex-col absolute right-2 top-2/3 z-10 mt-4 overflow-hidden rounded bg-white shadow-lg ring-1 ring-stone-600">
                <div class="w-64 2xl:w-96">
                  <div
                    class="px-6 py-4 flex items-center gap-4 bg-stone-600 rounded rounded-b-none border border-b-0 border-white">
                    <div
                      class="rounded-full bg-white w-16 h-16 2xl:w-20 2xl:h-20 p-2 flex items-center justify-center border border-stone-700">
                      <img class="rounded-full" :src="`/assets/img/avatar (${userData.selectedAvatarIndex}).png`"
                        alt="avatar" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-xl 2xl:text-2xl font-bold">#{{ userData.username }}</span>
                      <span class="text-sm 2xl:text-lg">{{
                        userData.email
                      }}</span>
                    </div>
                  </div>
                  <div class="border border-white">
                    <div v-for="(userAction, index) in userActions" :key="index"
                      class="text w-full leading-6 hover:bg-stone-200 text-stone-700 cursor-pointer">
                      <div @click="userAction.action"
                        class="flex-auto flex items-center 2xl:gap-8 gap-2 px-6 py-4 2xl:py-6">
                        <div class="flex flex-none items-center justify-center">
                          <component :is="userAction.icon" class="w-4 2xl:w-8" aria-hidden="true" />
                        </div>
                        <span class="whitespace-nowrap text-center block tracking-widest 2xl:text-xl">
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
      <button v-else
        class="text-stone-600 text-lg 2xl:text-xl h-12 bg-white border-2 border-stone-600 hover:bg-[#4b493ded] hover:text-white hover:border-white transition-all duration-700 ease-in-out font-bold py-1 px-2">
        <router-link :to="{ name: 'Login' }">Get started</router-link>
      </button>
    </div>
  </nav>
</template>
