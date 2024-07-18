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

// const articles = [
//   {
//     id: '1es3dar',
//     img: 'https://images.unsplash.com/photo-1503066211613-c17ebc9daef0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
//     title: '東南亞的虎類保護工作',
//     abstract:
//       '虎是壯麗的生物，但由於棲息地喪失和盜獵等威脅，它們正面臨著危險。東南亞的保護組織一直在不懈努力保護這些宏偉的動物。這些努力包括建立保護區、反盜獵巡邏以及社區教育計劃，以提高人們對虎類保護重要性的認識。',
//     stats: { views: 1589, likes: 876 },
//     comments: [
//       '我很高興看到有人在拯救老虎！',
//       '我該如何為這些保護計劃做出貢獻？',
//       '老虎是如此美麗的生物，我們必須保護它們。'
//     ],
//     createdAt: '2023-09-02 14:30:00'
//   },
//   {
//     id: '19se983',
//     img: 'https://images.unsplash.com/photo-1597953601374-1ff2d5640c85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
//     title: '熊貓研究和繁殖計劃',
//     abstract:
//       '大熊貓是瀕臨物種，研究和繁殖計劃對它們的生存至關重要。研究人員正在研究熊貓的行為、基因和繁殖，以更好地了解它們的需求。繁殖計劃已成功將大熊貓重新引入自然環境，為它們的種群增長做出了貢獻。',
//     stats: { views: 2047, likes: 1245 },
//     comments: [
//       '熊貓是我最喜歡的動物！我支持熊貓保護工作。',
//       '我不知道他們在繁殖熊貓方面取得了進展。',
//       '世界需要更多的熊貓！'
//     ],
//     postDate: '2023-09-03 16:45:00'
//   },
//   {
//     id: '209sds',
//     img: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80',
//     title: '大象保護和棲息地保育',
//     abstract:
//       '非洲和亞洲的大象面臨嚴重的威脅，包括象牙貿易和棲息地喪失。保護組織正採取措施保護這些令人驚嘆的生物。這些措施包括打擊象牙貿易、創建大象保護區以及協助恢復和保護它們的棲息地。',
//     stats: { views: 1367, likes: 945 },
//     comments: [
//       '大象是地球上最偉大的動物之一！我們必須保護它們。',
//       '象牙貿易必須停止。',
//       '大象的故事總是讓人感到震撼。'
//     ],
//     postDate: '2023-09-05 09:15:00'
//   },
//   {
//     id: 'eee33erfds',
//     img: 'https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
//     title: '東南亞的虎類保護工作',
//     abstract:
//       '虎是壯麗的生物，但由於棲息地喪失和盜獵等威脅，它們正面臨著危險。東南亞的保護組織一直在不懈努力保護這些宏偉的動物。這些努力包括建立保護區、反盜獵巡邏以及社區教育計劃，以提高人們對虎類保護重要性的認識。',
//     stats: { views: 1589, likes: 876 },
//     comments: [
//       '我很高興看到有人在拯救老虎！',
//       '我該如何為這些保護計劃做出貢獻？',
//       '老虎是如此美麗的生物，我們必須保護它們。'
//     ],
//     postDate: '2023-09-02 14:30:00'
//   },
//   {
//     id: 'ee2344s',
//     img: 'https://images.unsplash.com/photo-1597953601374-1ff2d5640c85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
//     title: '熊貓研究和繁殖計劃',
//     abstract:
//       '大熊貓是瀕臨物種，研究和繁殖計劃對它們的生存至關重要。研究人員正在研究熊貓的行為、基因和繁殖，以更好地了解它們的需求。繁殖計劃已成功將大熊貓重新引入自然環境，為它們的種群增長做出了貢獻。',
//     stats: { views: 2047, likes: 1245 },
//     comments: [
//       '熊貓是我最喜歡的動物！我支持熊貓保護工作。',
//       '我不知道他們在繁殖熊貓方面取得了進展。',
//       '世界需要更多的熊貓！'
//     ],
//     postDate: '2023-09-03 16:45:00'
//   },
//   {
//     id: '223s44s',
//     img: 'https://images.unsplash.com/photo-1521651201144-634f700b36ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
//     title: '大象保護和棲息地保育',
//     abstract:
//       '非洲和亞洲的大象面臨嚴重的威脅，包括象牙貿易和棲息地喪失。保護組織正採取措施保護這些令人驚嘆的生物。這些措施包括打擊象牙貿易、創建大象保護區以及協助恢復和保護它們的棲息地。',
//     stats: { views: 1367, likes: 945 },
//     comments: [
//       '大象是地球上最偉大的動物之一！我們必須保護它們。',
//       '象牙貿易必須停止。',
//       '大象的故事總是讓人感到震撼。'
//     ],
//     postDate: '2022-09-05 14:33:00'
//   }
// ]
</script>

<template>
  <div
    class="bg-articles bg-no-repeat bg-cover bg-center w-full bg-fixed flex flex-col items-center"
  >
    <div class="flex flex-col items-center mt-44 font-Josefin tracking-widest">
      <h1 class="uppercase text-5xl font-bold text-center">The beauty of nature</h1>
      <h3 class="italic text-xl mt-2">探索自然與保育之美</h3>
    </div>
    <div v-if="articles && articles.length > 0" class="bg-white w-full mt-48">
      <ul class="mx-auto flex flex-col items-center w-2/3 translate-y-[-7.5rem]">
        <li v-for="(article, index) in articles" :key="index" class="bg-white p-5 w-full">
          <div class="group" @click="router.push({ name: 'Article', params: { id: article.id } })">
            <div class="max-h-[32.5rem] 2xl:max-h-[40rem] overflow-hidden">
              <img :src="article.coverImage" class="w-full filter grayscale-[10%]" />
            </div>
            <div
              class="w-full border border-stone-300 px-12 py-6 2xl:px-20 2xl:py-12 overflow-hidden"
            >
              <span class="text-sm 2xl:text-base">
                {{
                  format(article.createdAt, 'yyyy-MM-dd', {
                    locale: zhTW
                  })
                }}
                <span class="font-bold text-md">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                {{
                  formatDistance(article.createdAt, new Date(), {
                    locale: zhTW
                  })
                }}
                前</span
              >
              <div>
                <h4
                  class="mt-2 text-2xl 2xl:text-3xl font-bold text-stone-900 cursor-pointer group-hover:text-green-500 transition-all"
                >
                  {{ article.title }}
                </h4>
              </div>
              <div class="border-b-[.0938rem] 2xl:border-b-2 2xl:py-2 border-gray-300 my-4" />
              <div class="flex justify-between">
                <div class="flex gap-8">
                  <span class="flex gap-1 2xl:">
                    <EyeIcon class="w-4 2xl:w-8" />{{ article.views }}
                  </span>
                  <span class="flex gap-1 2xl:">
                    <!-- <ChatBubbleBottomCenterIcon class="w-4 2xl:w-8" />{{ article.comments.length }} -->
                  </span>
                </div>
                <span class="group flex gap-1 text-red-500" tabindex="0">
                  <HeartIcon class="w-4 2xl:w-8" />{{ article.likes }}
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="bg-white w-2/3 my-12 h-48 flex justify-center items-center">
      <p class="text-2xl 2xl:text-3xl font-bold text-stone-400">目前暫無文章</p>
    </div>
  </div>
</template>
