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
  <div v-if="post && post.author && post.author.profile" class="flex-1 w-full bg-fixed">
    <div class="bg-stone-100 w-full py-8 px-4">
      <div class="mx-auto flex flex-col items-center gap-20 bg-stone-100 w-[62rem] pt-20 px-5">
        <button
          @click="router.back()"
          class="self-start text-sm 2xl:text-xl font-bold text-stone-800"
        >
          上一頁
        </button>
        <div class="mx-auto border-2 border-stone-800 w-full px-24 py-16 bg-white">
          <div class="flex items-center gap-4">
            <router-link
              :to="{
                name: 'PersonalInfo',
                params: { email: post.author.email }
              }"
            >
              <div class="flex items-center gap-2">
                <div
                  class="border border-stone-800 rounded-full bg-white w-10 h-10 2xl:w-12 2xl:h-12 p-1 flex items-center justify-center overflow-hidden"
                >
                  <img
                    :src="`/assets/img/avatar (${post.author.profile.selectedAvatarIndex}).png`"
                    alt="avatar"
                  />
                </div>
                <span class="2xl:text-lg text-stone-700 font-bold">
                  {{ post.author.username }}
                </span>
              </div>
            </router-link>
            <div class="flex gap-2 items-baseline justify-start flex-1">
              <span class="font-bold text-sm 2xl:text-base text-stone-500"
                >{{ formatDateTime(post.createdAt!) }}
                <span class="text-md italic">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                {{ getTimeDifference(post.createdAt!) }} 以前
              </span>
            </div>
          </div>
          <h1 class="my-4 text-2xl 2xl:text-4xl 2xl:pt-4 text-stone-900 font-bold">
            {{ post.title }}
          </h1>
          <div class="flex gap-2 flex-wrap">
            <span
              v-for="(tag, index) in post.topicTags"
              :key="index"
              class="px-2 py-1 text-sm rounded-sm text-stone-100"
              :style="`background-color:${setTagColor(tag)}`"
            >
              {{ tag }}
            </span>
          </div>
          <!-- <div
            v-if="post.images && post.images.length > 0"
            class="mt-20 flex flex-col gap-4"
          >
            <img :src="post.images[0].url" class="border-2 border-stone-700" />
          </div> -->
          <div
            v-html="getConvertedHtml(post.content)"
            class="quill-content mt-10 text-stone-700 2xl:text-lg whitespace-pre-wrap overflow-auto"
          ></div>
          <!-- <div
            v-if="post.images && post.images.length > 0"
            class="mt-4 flex flex-col gap-4"
          >
            <div v-for="(image, index) in post.images" :key="index">
              <img
                :key="index"
                v-if="index !== 0"
                :src="image.url"
                class="border-2 border-stone-700"
              />
            </div>
          </div> -->
          <div class="border-b-[1.5px] border-gray-300 my-4"></div>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-8 2xl:text-xl">
              <span class="flex items-center gap-1 text-blue-900">
                <EyeIcon class="w-4 2xl:w-6" />{{ post.views }}
              </span>
              <span class="flex items-center gap-1 2xl:text-xl text-orange-900">
                <ChatBubbleBottomCenterIcon class="w-4 2xl:w-6" />
                {{ postComments ? postComments.length : 0 }}
              </span>
            </div>
            <span
              class="group flex items-center gap-1 2xl:text-xl hover:cursor-pointer focus:text-red-600 transition-all"
              tabindex="0"
            >
              <HeartIcon
                @click="handleLikes"
                class="w-4 2xl:w-6 group-focus:scale-[115%] transition-all duration-300"
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
