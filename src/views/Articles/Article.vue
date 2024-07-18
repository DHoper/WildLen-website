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

const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})

const router = useRouter()

const article = ref<Article>()
const isLiked = ref<boolean>(false)

//--留言區資料
const articleComments = ref<PostComment[]>()
const fetchCommentData = async () => {
  const commentsResponseData = await getComments(props.id)

  if (commentsResponseData.value) {
    articleComments.value = commentsResponseData.value
  }
}

const reloadCommentData = async () => {
  await fetchArticleData()
  if (article.value) {
    await fetchCommentData()
  }
}

const handleCreateComment = async (submitData: { authorId: number; content: String }) => {
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
      articleComments.value = articleResponseData.value?.comments
      incrementArticleViews(props.id)
    }

    loadingStore.setInRequest(false)
    loadingStore.setLoadingStatus(false)
  } catch (error: any) {
    console.error('獲取文章數據時發生錯誤：', error)
  }
}

const toggleLike = async () => {
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
  <div class="bg-articles bg-no-repeat bg-cover bg-center w-full bg-fixed">
    <div
      class="absolute flex flex-col items-center top-52 left-1/2 -translate-x-1/2 font-Josefin tracking-widest"
    >
      <h1 class="uppercase text-5xl font-bold">The beauty of nature</h1>
      <h3 class="italic text-xl mt-2">探索自然與保育之美</h3>
    </div>
    <div class="bg-white w-full mt-[90vh] py-12 px-4">
      <div class="mx-auto flex flex-col bg-white w-[62rem] translate-y-[-7rem] pt-28 px-5">
        <button @click="router.back()" class="self-start text-sm font-bold text-stone-800">
          上一頁
        </button>
        <div v-if="article" class="mt-12 border-2 border-stone-800 px-24 py-16 mb-20">
          <span class="font-bold text-sm text-stone-500">
            {{
              format(article.createdAt, 'yyyy-MM-dd', {
                locale: zhTW
              })
            }}
            <span class="text-md">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
            {{
              formatDistance(article.createdAt, new Date(), {
                locale: zhTW
              })
            }}
            前
          </span>
          <h1 class="my-8 text-4xl text-stone-600">{{ article.title }}</h1>
          <p class="font-bold italic text-sm text-stone-900">{{ article.subTitle }}</p>
          <div class="mt-4 max-h-[32.5rem] overflow-hidden">
            <img :src="article.coverImage" class="w-full filter grayscale-[10%]" />
          </div>
          <div class="quill-content w-full my-8" v-html="getConvertedHtml(article.content)"></div>
          <div class="border-b-[.0938rem] border-gray-300 my-4"></div>
          <div class="flex justify-between">
            <div class="flex gap-8">
              <span class="flex gap-1"><EyeIcon class="w-4" />{{ article.views }}</span>
              <span class="flex gap-1"
                ><!-- <ChatBubbleBottomCenterIcon class="w-4" />{{ article.length }} --></span
              >
            </div>
            <span
              class="group flex gap-1 hover:cursor-pointer transition-scale"
              :class="{ 'text-red-500': isLiked }"
              tabindex="0"
              @click="toggleLike"
            >
              <component
                :is="isLiked ? SolidHeartIcon : HeartIcon"
                class="w-4 group-focus:scale-[125%] transition-scale duration-300"
                :class="{ 'scale-[125%]': isLiked }"
              />
              {{ article.likes }}
            </span>
          </div>
        </div>
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
