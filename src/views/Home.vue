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
    class="flex h-screen w-full flex-col items-center overflow-hidden bg-white bg-banner bg-cover bg-center bg-no-repeat px-16 pb-12 pt-10 font-Cormorant text-white shadow-inner lg:pb-2 xl:pb-4 2xl:pb-10"
  >
    <div class="flex h-full flex-col items-center justify-around pb-24 lg:pb-0">
      <h1 class="text-6xl">WILDLENS</h1>
      <nav ref="nav" class="mt-2 flex flex-wrap justify-end text-xl font-semibold text-[#ffffff9e]">
        <button
          @mouseover="addTabClass(0)"
          class="mx-4 my-2 h-10 scale-110 border-b-2 border-white text-white transition duration-500"
        >
          探索
        </button>
        <button @mouseover="addTabClass(1)" class="mx-4 my-2 transition duration-500">紀錄</button>
        <button @mouseover="addTabClass(2)" class="mx-4 my-2 transition duration-500">分享</button>
      </nav>
      <div class="relative flex h-48 w-80 flex-col items-center lg:w-[30rem]">
        <Transition>
          <div v-if="activeTab == 0" class="absolute top-0 flex w-full flex-col items-center">
            <h2 class="mb-4 font-Cormorant text-7xl tracking-tighter">探索&nbsp;&nbsp;視界.</h2>
            <p class="text-center text-lg tracking-wide">
              這個廣大壯闊的世界，還有多少你未曾發現的事物?
            </p>
            <p class="text-center text-lg tracking-wide">
              以全新的視野，重新走進這個世界，發掘那些你從前不曾留意過的美麗
            </p>
          </div>
        </Transition>
        <Transition>
          <div v-if="activeTab == 1" class="absolute top-0 flex flex-col items-center">
            <h2 class="mb-4 font-Cormorant text-7xl tracking-tighter">紀錄&nbsp;&nbsp;冒險.</h2>
            <p class="text-lg tracking-wide">無論大或小，每一段記憶都值得被好好珍藏</p>
            <p class="text-lg tracking-wide">
              從這裡開始，和我們一起，紀錄下那些獨一無二的獨特時光
            </p>
          </div>
        </Transition>
        <Transition>
          <div v-if="activeTab == 2" class="absolute top-0 flex flex-col items-center">
            <h2 class="mb-4 font-Cormorant text-7xl tracking-tighter">分享&nbsp;&nbsp;體驗.</h2>
            <p class="text-center text-lg tracking-wide">
              將你的感動化成照片和文字，與世界各地的人們交流
            </p>
            <p class="text-center text-lg tracking-wide">
              分享的力量是無限的，將你的所見傳遞給出去，彼此的距離因此變得不再遙遠
            </p>
          </div>
        </Transition>
      </div>
      <div class="h-20">
        <button
          ref="button"
          @click="router.push({ name: 'Articles' })"
          class="relative mt-8 h-16 w-72 origin-center rounded-full border-2 border-white py-2 text-2xl font-bold tracking-widest text-white transition-all hover:animate-circle hover:bg-[#3332323f] lg:h-12 lg:w-60 lg:text-lg"
          tabindex="0"
          @mouseover.once="addAnimateClass"
          @mouseenter="addLineClass"
          @mouseleave="removeLineClass"
        >
          <span>現&nbsp;&nbsp;在&nbsp;&nbsp;開&nbsp;&nbsp;始</span>
          <img
            src="/assets/img/deerIcon.png"
            alt="deerIcon"
            class="absolute left-0 top-0 size-full opacity-0 transition-all hover:animate-deerIcon focus:animate-deerIconActive"
            tabindex="0"
          />
          <span
            class="absolute left-0 top-1/2 w-1/2 -translate-x-full border-b-2 border-white opacity-0 duration-300 ease-in-out hover:animate-line"
          ></span>
          <span
            class="absolute right-0 top-1/2 w-1/2 translate-x-full border-b-2 border-white opacity-0 duration-300 ease-in-out"
          ></span>
        </button>
      </div>
    </div>
    <span class="ml-1 mt-auto text-xl lg:text-base">&copy; 2024 ~ Now. All rights reserved.</span>
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
