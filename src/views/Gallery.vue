<script setup lang="ts">
import Post from './Gallery/Post.vue'
import { PlusCircleIcon } from '@heroicons/vue/24/solid'
import { ref, onMounted } from 'vue'
import { useLoadingStore } from '../stores/loading'
import { formatDateTime } from '../utils/formator'
import type { PhotoPost } from '@/types/Post'
import { getAllPosts } from '@/api/photoPost/photoPost'

const galleryDataset = ref<PhotoPost[]>()
const fetchData = async () => {
  const response = await getAllPosts()
  galleryDataset.value = response.value
}

onMounted(async () => {
  const loadingStore = useLoadingStore() //設置loading動畫頁
  loadingStore.setLoadingStatus(true)
  loadingStore.setInRequest(true)

  await fetchData()
  rightBlock.value?.addEventListener('scroll', handleScroll)

  loadingStore.setInRequest(false)
  loadingStore.setLoadingStatus(false)
})

enum AddBlock {
  Block = 'block',
  Icon = 'icon'
}

const addBlock = ref<AddBlock>(AddBlock.Icon)
const rightBlock = ref<HTMLElement | null>(null)

//處理發布按鈕 當頁面置底時隱藏
function handleScroll() {
  if (rightBlock.value) {
    const scrollY = rightBlock.value.scrollTop
    const clientHeight = rightBlock.value.clientHeight
    const scrollHeight = rightBlock.value.scrollHeight

    if (scrollY + clientHeight + 200 >= scrollHeight) {
      addBlock.value = AddBlock.Block
    } else {
      addBlock.value = AddBlock.Icon
    }
  }
}

//photoPost組件邏輯
const photoPostShow = ref(false)
const photoPostID = ref<number | null>(null)

function openPhoto(id: number) {
  photoPostID.value = id
  photoPostShow.value = true
}
function closePhoto() {
  photoPostShow.value = false
  photoPostID.value = null
}
</script>

<template>
  <div class="relative flex w-full flex-1 flex-col overflow-hidden">
    <div v-if="galleryDataset" class="relative flex size-full flex-col-reverse overflow-hidden bg-stone-600 sm:flex-row">
      <div
        class="flex h-full basis-[30%] flex-col items-center justify-center bg-gallery bg-cover bg-center bg-no-repeat py-4 text-white"
      >
        <span
          class="mt-auto text-4xl font-bold tracking-[1rem] [writing-mode:vertical-lr] sm:text-5xl 2xl:text-6xl"
          >偉大的世界</span
        >
        <div
          class="my-auto flex flex-col items-center gap-4 text-lg tracking-[.8rem] text-[#f9f9f9c8] 2xl:text-xl"
        >
          <span>還有許多</span>
          <span>你未曾探尋之地</span>
        </div>
      </div>
      <div class="h-full basis-[70%]">
        <div
          ref="rightBlock"
          class="scrollbar-hide flex size-full flex-wrap content-start justify-start overflow-y-auto overflow-x-hidden"
        >
          <div
            v-for="(post, index) in galleryDataset"
            :key="index"
            class="group relative m-0 flex-none basis-1/2 cursor-pointer p-0 hover:z-10 md:basis-1/2 lg:basis-1/3 xl:max-w-[25%] xl:basis-1/4 2xl:w-1/5"
          >
            <img
              class="aspect-video w-full scale-[101%] object-cover transition-all duration-700 ease-in group-hover:scale-105"
              :src="post.images![0].url"
            />
            <div
              class="absolute left-0 top-0 size-full scale-[101%] bg-black/0 transition-all duration-700 ease-in group-hover:scale-105 group-hover:bg-black/30"
            ></div>
            <div
              @click="openPhoto(post.id!)"
              class="absolute left-0 top-0 flex size-full -translate-x-4 scale-[101%] flex-col justify-between px-4 pb-2 pt-3 text-white opacity-0 transition-all duration-700 ease-in group-hover:translate-x-0 group-hover:scale-105 group-hover:opacity-100"
              tabindex="-1"
            >
              <div v-if="post.createdAt">
                <p class="text-xs text-[#fdfdfdda] 2xl:text-base">
                  {{ formatDateTime(post.createdAt) }}
                </p>
                <h3 class="my-2 text-xl text-[#fdfdfdda] 2xl:text-3xl">
                  {{ post.title }}
                </h3>
                <p class="text-xs text-[#fdfdfdda] 2xl:text-base">
                  {{ post.location }}
                </p>
              </div>
              <div class="mt-auto">
                <div class="border border-[#fdfdfdb7] 2xl:mb-2"></div>
                <div class="flex h-7 items-center justify-between">
                  <span class="text-sm tracking-widest 2xl:text-base">查看更多</span>
                  <img
                    src="/assets/svg/long-arrow.svg"
                    alt="long-arrow"
                    class="h-10 w-14 -translate-x-1/2 transition-all duration-1000 ease-linear group-hover:translate-x-0"
                  />
                </div>
              </div>
            </div>
          </div>
          <router-link class="grow" v-if="addBlock === 'block'" :to="{ name: 'CreatePost' }">
            <div
              class="flex h-full flex-1 cursor-pointer items-center justify-center border-2 bg-gray-100 py-8 text-xl font-bold text-stone-700 transition-all duration-[1150ms] hover:z-10 hover:scale-105 hover:bg-white hover:text-stone-800 2xl:py-10 2xl:text-3xl"
            >
              添加更多發現
            </div>
          </router-link>
          <router-link v-else :to="{ name: 'CreatePost' }">
            <PlusCircleIcon
              class="fixed bottom-12 right-12 z-10 size-16 cursor-pointer text-white transition-all ease-in hover:scale-110 hover:text-emerald-400 2xl:size-20"
            />
          </router-link>
        </div>
      </div>
      <Post v-if="photoPostShow && photoPostID" :id="photoPostID" @close="closePhoto" />
    </div>
  </div>
</template>
