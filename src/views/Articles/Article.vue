<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { EyeIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as SolidHeartIcon } from '@heroicons/vue/24/solid'
import {
  getArticle,
  incrementArticleViews,
  incrementArticleLikes,
  decrementArticleLikes
} from '@/api/article/article'
import type { Article } from '@/types/Article'
import Comment from '@/components/post/Comment.vue'
import { format, formatDistance } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { useLoadingStore } from '@/stores/loading'
import { getConvertedHtml } from '@/utils/convertor'
import { deleteComment } from '@/api/photoPost/photoPostComment'
import type { PostComment } from '@/types/Common'
import { createComment, getComments } from '@/api/article/articleComment'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})

const router = useRouter()
const article = ref<Article>()
const isLiked = ref<boolean>(false)
const userStore = useUserStore()
const user = userStore.getData()

//--留言區資料
const articleComments = ref<PostComment[]>()
const fetchCommentData = async () => {
  const commentsResponseData = await getComments(props.id)

  if (commentsResponseData.value) {
    articleComments.value = commentsResponseData.value.reverse()
  }
}

const reloadCommentData = async () => {
  await fetchCommentData()
}

const handleCreateComment = async (submitData: { authorId: number; content: String }) => {
  if (!user) {
    router.push({ name: 'Login' })
    return
  }
  await createComment(props.id, submitData).catch((err) => {
    console.error(`發布評論失敗: ${err}`)
  })
  await reloadCommentData()
}

const handleDeleteComment = async (commentId: number) => {
  await deleteComment(commentId)
  await reloadCommentData()
}

const fetchArticleData = async () => {
  try {
    const loadingStore = useLoadingStore()
    loadingStore.setLoadingStatus(true)
    loadingStore.setInRequest(true)

    const articleResponseData = await getArticle(props.id)
    if (articleResponseData.value) {
      article.value = articleResponseData.value
      articleComments.value = articleResponseData.value?.comments.reverse()
      incrementArticleViews(props.id)
    }

    loadingStore.setInRequest(false)
    loadingStore.setLoadingStatus(false)
  } catch (error: any) {
    console.error('獲取文章數據時發生錯誤：', error)
  }
}

const toggleLike = async () => {
  if (!user) {
    router.push({ name: 'Login' })
    return
  }
  try {
    if (article.value) {
      if (!isLiked.value) {
        await incrementArticleLikes(article.value.id)
        article.value.likes++
      } else {
        await decrementArticleLikes(article.value.id)
        article.value.likes--
      }
      isLiked.value = !isLiked.value
    }
  } catch (error: any) {
    console.error('計算點讚時發生錯誤：', error)
  }
}

onMounted(async () => {
  await fetchArticleData()
})
</script>

<template>
  <div class="w-full bg-articles bg-cover bg-fixed bg-center bg-no-repeat">
    <div
      class="absolute left-1/2 top-40 flex -translate-x-1/2 flex-col items-center font-Josefin tracking-widest xl:top-52"
    >
      <h1 class="text-center text-5xl font-bold uppercase">The beauty of nature</h1>
      <h3 class="mt-2 text-xl italic">探索自然與保育之美</h3>
    </div>
    <div class="mt-[55vh] w-full bg-white px-4 py-12 xl:mt-[45vh]">
      <div
        class="mx-auto flex w-full -translate-y-28 flex-col bg-white px-2 pt-4 lg:w-[62rem] xl:px-5 xl:pt-28"
      >
        <button
          @click="router.back()"
          class="self-start p-2 text-base font-bold text-stone-800 xl:p-0 xl:text-sm"
        >
          上一頁
        </button>
        <div v-if="article" class="border-2 border-stone-800 p-8 xl:px-24 xl:py-16">
          <span class="text-sm font-bold text-stone-500">
            {{
              format(article.createdAt, 'yyyy-MM-dd', {
                locale: zhTW
              })
            }}
            <span class="text-base">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
            {{
              formatDistance(article.createdAt, new Date(), {
                locale: zhTW
              })
            }}
            前
          </span>
          <h1 class="my-8 text-4xl text-stone-600">{{ article.title }}</h1>
          <p class="text-sm font-bold italic text-stone-900">{{ article.subTitle }}</p>
          <div class="mt-4 max-h-[32.5rem] overflow-hidden">
            <img :src="article.coverImage" class="w-full grayscale-[10%]" />
          </div>
          <div
            class="quill-content my-8 w-full text-base"
            v-html="getConvertedHtml(article.content)"
          ></div>
          <div class="my-4 border-b-[.0938rem] border-gray-300"></div>
          <div class="flex justify-between">
            <div class="flex gap-8">
              <span class="flex items-center gap-1">
                <EyeIcon class="w-8 sm:w-6" />
                <span class="text-lg sm:text-base">{{ article.views }}</span></span
              >
            </div>
            <span
              class="group flex items-center gap-1 hover:cursor-pointer"
              :class="{ 'text-red-500': isLiked }"
              tabindex="0"
              @click="toggleLike"
            >
              <component
                :is="isLiked ? SolidHeartIcon : HeartIcon"
                class="w-8 duration-300 group-focus:scale-[125%] sm:w-6"
                :class="{ 'scale-[125%]': isLiked }"
              />
              <span class="text-lg sm:text-base">
                {{ article.likes }}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div class="mx-auto flex w-full bg-white px-2 pt-4 lg:w-[62rem] xl:px-5">
        <Comment
          :post-id="props.id"
          :comments-data="articleComments ? articleComments : []"
          @deleteComment="(commentId: number) => handleDeleteComment(commentId)"
          @createComment="(submitData: PostComment) => handleCreateComment(submitData)"
        />
      </div>
    </div>
  </div>
</template>
