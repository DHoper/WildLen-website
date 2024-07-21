<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { EyeIcon, ChatBubbleBottomCenterIcon } from '@heroicons/vue/24/outline'
import { HeartIcon } from '@heroicons/vue/24/solid'
import { setTagColor } from '../../fakeData/topicTags.js'
import Comment from '@/components/post/Comment.vue'
import { getTimeDifference, formatDateTime } from '../../utils/formator.js'
import { getConvertedHtml } from '@/utils/convertor'
import { getPost, setStats } from '@/api/community/community.js'
import { deleteComment, getComments, createComment } from '@/api/community/communityComment.js'
import type { CommunityComment, CommunityPost } from '@/types/Post'

const router = useRouter()
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})

const post = ref<CommunityPost>()
const postComments = ref<CommunityComment[]>()

//--貼文資料
const fetchPostData = async () => {
  const responseData = await getPost(props.id)
  post.value = responseData.value
  postComments.value = responseData.value?.comments
}

//--留言區資料
const fetchCommentData = async () => {
  const commentsResponseData = await getComments(props.id)

  if (commentsResponseData.value) {
    postComments.value = commentsResponseData.value
  }
}

const reloadCommentData = async () => {
  //重新加載留言資料//
  await fetchCommentData()
}

const handlePostComment = async (submitData: { authorId: number; content: String }) => {
  await createComment(props.id, submitData).catch((err) => {
    console.error(`registerUser 失敗: ${err}`)
  })
  await reloadCommentData()
}

const handleDeleteComment = async (commentId: number) => {
  await deleteComment(commentId)
  await reloadCommentData()
}

//--按讚
let isLiked = false

async function handleLikes() {
  if (post.value && post.value && props.id && post.value.likes) {
    if (!isLiked) {
      await setStats(props.id, 'like')
      post.value.likes++
      isLiked = true
    } else {
      await setStats(props.id, 'unlike')
      post.value.likes--
      isLiked = false
    }
  }
}

onMounted(async () => {
  await setStats(props.id, 'view')
  await fetchPostData()
})
</script>

<template>
  <div v-if="post && post.author && post.author.profile" class="w-full flex-1 bg-fixed">
    <div class="w-full bg-stone-100 px-4 py-8">
      <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-20 bg-stone-100 px-5 pt-20">
        <button
          @click="router.back()"
          class="self-start text-sm font-bold text-stone-800 2xl:text-xl"
        >
          上一頁
        </button>
        <div class="mx-auto w-full border-2 border-stone-800 bg-white px-6 py-8 md:px-16 md:py-12">
          <div class="flex items-center gap-4">
            <router-link
              :to="{
                name: 'PersonalInfo',
                params: { email: post.author.email }
              }"
            >
              <div class="flex items-center gap-2">
                <div
                  class="flex size-10 items-center justify-center overflow-hidden rounded-full border border-stone-800 bg-white p-1 2xl:size-12"
                >
                  <img
                    :src="`/assets/img/avatar (${post.author.profile.selectedAvatarIndex}).png`"
                    alt="avatar"
                  />
                </div>
                <span class="font-bold text-stone-700 2xl:text-lg">
                  {{ post.author.username }}
                </span>
              </div>
            </router-link>
            <div class="flex flex-1 items-baseline justify-start gap-2">
              <span class="text-sm font-bold text-stone-500 2xl:text-base"
                >{{ formatDateTime(post.createdAt!) }}
                <span class="text-md italic">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                {{ getTimeDifference(post.createdAt!) }} 以前
              </span>
            </div>
          </div>
          <h1 class="my-4 text-2xl font-bold text-stone-900 2xl:pt-4 2xl:text-4xl">
            {{ post.title }}
          </h1>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(tag, index) in post.topicTags"
              :key="index"
              class="rounded-sm px-2 py-1 text-sm text-stone-100"
              :style="`background-color:${setTagColor(tag)}`"
            >
              {{ tag }}
            </span>
          </div>
          <div
            v-html="getConvertedHtml(post.content)"
            class="quill-content mt-10 overflow-auto whitespace-pre-wrap text-stone-700 2xl:text-lg"
          ></div>
          <div class="my-4 border-b-[1.5px] border-gray-300"></div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-8 2xl:text-xl">
              <span class="flex items-center gap-1 text-blue-900">
                <EyeIcon class="w-4 2xl:w-6" />{{ post.views }}
              </span>
              <span class="flex items-center gap-1 text-orange-900 2xl:text-xl">
                <ChatBubbleBottomCenterIcon class="w-4 2xl:w-6" />
                {{ postComments ? postComments.length : 0 }}
              </span>
            </div>
            <span
              class="group flex items-center gap-1 transition-all hover:cursor-pointer focus:text-red-600 2xl:text-xl"
              tabindex="0"
            >
              <HeartIcon
                @click="handleLikes"
                class="w-4 transition-all duration-300 group-focus:scale-[115%] 2xl:w-6"
              />{{ post.likes }}
            </span>
          </div>
        </div>
        <Comment
          :post-id="post.id!"
          :comments-data="postComments ? postComments : []"
          @delete-comment="(commentId) => handleDeleteComment(commentId)"
          @create-comment="(submitData) => handlePostComment(submitData)"
        />
      </div>
    </div>
  </div>
</template>