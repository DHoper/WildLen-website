<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const button = ref<HTMLButtonElement | null>(null)
const nav = ref<HTMLButtonElement | null>(null)
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
const addAnimateClass = () => {
  if (button.value) {
    const imgElement = button.value.childNodes[1] as HTMLElement
    const line1 = button.value.childNodes[2] as HTMLElement
    const line2 = button.value.childNodes[3] as HTMLElement
    button.value.classList.add('animate-circleB')
    imgElement.classList.add('animate-deerIconB')
    line1.classList.toggle('animate-lineB')
    line2.classList.toggle('animate-lineB')
  }
}

const addLineClass = () => {
  if (button.value) {
    const line1 = button.value.childNodes[2] as HTMLElement
    const line2 = button.value.childNodes[3] as HTMLElement
    line1.classList.toggle('animate-line')
    line2.classList.toggle('animate-line')
    line1.classList.toggle('animate-lineB')
    line2.classList.toggle('animate-lineB')
  }
}

const removeLineClass = () => {
  if (button.value) {
    const line1 = button.value.childNodes[2] as HTMLElement
    const line2 = button.value.childNodes[3] as HTMLElement
    line1.classList.toggle('animate-line')
    line2.classList.toggle('animate-line')
    line1.classList.toggle('animate-lineB')
    line2.classList.toggle('animate-lineB')
  }
}
</script>

<template>
  <div
    class="banner font-Cormorant overflow-hidden flex flex-col items-center w-full h-screen pt-10 pb-2 xl:pb-4 2xl:pb-10 bg-white text-white px-16 bg-banner bg-no-repeat bg-cover bg-center text-shadow-md shadow-inner"
  >
    <div class="flex flex-col items-center justify-around h-full">
      <h1 class="text-6xl">WILDLENS</h1>
      <nav ref="nav" class="flex flex-wrap mt-2 justify-end font-semibold text-xl text-[#ffffff9e]">
        <button
          @mouseover="addTabClass(0)"
          class="h-10 mx-4 my-2 transition duration-500 text-white border-white border-b-2 scale-110"
        >
          探索
        </button>
        <button @mouseover="addTabClass(1)" class="mx-4 my-2 transition duration-500">紀錄</button>
        <button @mouseover="addTabClass(2)" class="mx-4 my-2 transition duration-500">分享</button>
      </nav>
      <div class="w-[30rem] h-48 flex flex-col items-center relative">
        <Transition>
          <div v-if="activeTab == 0" class="w-full flex flex-col items-center absolute top-0">
            <h2 class="text-7xl mb-4 font-Cormorant tracking-tighter">探索&nbsp;&nbsp;視界.</h2>
            <p class="text-lg tracking-wide text-center">
              這個廣大壯闊的世界，還有多少你未曾發現的事物?
            </p>
            <p class="text-lg tracking-wide text-center">
              以全新的視野，重新走進這個世界，發掘那些你從前不曾留意過的美麗
            </p>
          </div>
        </Transition>
        <Transition>
          <div v-if="activeTab == 1" class="flex flex-col items-center absolute top-0">
            <h2 class="text-7xl mb-4 font-Cormorant tracking-tighter">紀錄&nbsp;&nbsp;冒險.</h2>
            <p class="text-lg tracking-wide">無論大或小，每一段記憶都值得被好好珍藏</p>
            <p class="text-lg tracking-wide">
              從這裡開始，和我們一起，紀錄下那些獨一無二的獨特時光
            </p>
          </div>
        </Transition>
        <Transition>
          <div v-if="activeTab == 2" class="flex flex-col items-center absolute top-0">
            <h2 class="text-7xl mb-4 font-Cormorant tracking-tighter">分享&nbsp;&nbsp;體驗.</h2>
            <p class="text-lg tracking-wide text-center">
              將你的感動化成照片和文字，與世界各地的人們交流
            </p>
            <p class="text-lg tracking-wide text-center">
              分享的力量是無限的，將你的所見傳遞給出去，彼此的距離因此變得不再遙遠
            </p>
          </div>
        </Transition>
      </div>
      <div class="h-20">
        <button
          ref="button"
          @click="router.push({ name: 'Articles' })"
          class="relative w-60 h-12 text-white border-2 text-lg border-white hover:bg-[#3332323f] font-bold py-2 mt-8 rounded-full tracking-widest transition-all origin-center hover:animate-circle"
          tabindex="0"
          @mouseover.once="addAnimateClass"
          @mouseenter="addLineClass"
          @mouseleave="removeLineClass"
        >
          <span>現&nbsp;&nbsp;在&nbsp;&nbsp;開&nbsp;&nbsp;始</span>
          <img
            src="/assets/img/deerIcon.png"
            alt="deerIcon"
            class="absolute w-full h-full top-0 left-0 opacity-0 hover:animate-deerIcon transition-all focus:animate-deerIconActive"
            tabindex="0"
          />
          <span
            class="absolute w-1/2 border-b-2 border-white top-1/2 left-0 -translate-x-full transition-width duration-300 ease-in-out opacity-0 hover:animate-line"
          ></span>
          <span
            class="absolute w-1/2 border-b-2 border-white top-1/2 right-0 translate-x-full transition-width duration-300 ease-in-out opacity-0"
          ></span>
        </button>
      </div>
    </div>
    <span class="mt-auto ml-1">&copy; 2024 ~ Now. All rights reserved.</span>
  </div>
</template>

<style>
.v-enter-active {
  transition: opacity 1.2s ease-in;
}

.v-leave-active {
  transition: opacity 0.4s ease-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
