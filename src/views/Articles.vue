<script setup lang="ts">
import { useRouter } from 'vue-router'
import { EyeIcon, ChatBubbleBottomCenterIcon } from '@heroicons/vue/24/outline'
import { HeartIcon } from '@heroicons/vue/24/solid'
import { onMounted, ref } from 'vue'
import { getAllArticles } from '@/api/article/article'
import { format, formatDistance } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import type { Article } from '@/types/Article'
import { useLoadingStore } from '@/stores/loading'

const router = useRouter()

const articles = ref<Article[]>()
const fetchArticlesData = async () => {
  const commentsResponseData = await getAllArticles()

  if (commentsResponseData.value) {
    articles.value = commentsResponseData.value.reverse()
  }
}

onMounted(async () => {
  const loadingStore = useLoadingStore() //設置loading動畫頁
  loadingStore.setLoadingStatus(true)
  loadingStore.setInRequest(true)

  await fetchArticlesData()

  loadingStore.setInRequest(false)
  loadingStore.setLoadingStatus(false)
})
</script>

<template>
  <div
    class="flex w-full flex-col items-center bg-articles bg-cover bg-fixed bg-center bg-no-repeat"
  >
    <div class="mt-44 flex flex-col items-center font-Josefin tracking-widest">
      <h1 class="text-center text-5xl font-bold uppercase">The beauty of nature</h1>
      <h3 class="mt-2 text-xl italic">探索自然與保育之美</h3>
    </div>
    <div v-if="articles && articles.length > 0" class="mt-48 w-full bg-white">
      <ul class="mx-auto flex w-full translate-y-[-7.5rem] flex-col items-center xl:w-2/3">
        <li v-for="(article, index) in articles" :key="index" class="w-full bg-white p-5">
          <div class="group" @click="router.push({ name: 'Article', params: { id: article.id } })">
            <div class="max-h-[32.5rem] overflow-hidden 2xl:max-h-[40rem]">
              <img :src="article.coverImage" class="w-full grayscale-[10%]" />
            </div>
            <div
              class="w-full overflow-hidden border border-stone-300 px-12 py-6 2xl:px-20 2xl:py-12"
            >
              <span class="text-sm 2xl:text-base">
                {{
                  format(article.createdAt, 'yyyy-MM-dd', {
                    locale: zhTW
                  })
                }}
                <span class="text-base font-bold">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                {{
                  formatDistance(article.createdAt, new Date(), {
                    locale: zhTW
                  })
                }}
                前</span
              >
              <div>
                <h4
                  class="mt-2 cursor-pointer text-2xl font-bold text-stone-900 transition-all group-hover:text-green-500 2xl:text-3xl"
                >
                  {{ article.title }}
                </h4>
              </div>
              <div class="my-4 border-b-[.0938rem] border-gray-300 2xl:border-b-2 2xl:py-2" />
              <div class="flex justify-between">
                <div class="flex gap-8">
                  <span class="flex items-center gap-1 2xl:text-base">
                    <EyeIcon class="w-4 2xl:w-6" />{{ article.views }}
                  </span>
                  <span class="flex items-center gap-1 2xl:text-base">
                    <ChatBubbleBottomCenterIcon class="w-4 2xl:w-6" />{{ article.comments.length }}
                  </span>
                </div>
                <span class="group flex items-center gap-1 2xl:text-base" tabindex="0">
                  <HeartIcon class="w-4 2xl:w-6" />{{ article.likes }}
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="my-12 flex h-48 w-2/3 items-center justify-center bg-white">
      <p class="text-2xl font-bold text-stone-400 2xl:text-3xl">目前暫無文章</p>
    </div>
  </div>
</template>
