<script setup lang="ts">
import { getPost, setStats } from '@/api/photoPost/photoPost'
import Comment from '@/components/post/Comment.vue'
import { createComment, deleteComment } from '@/api/photoPost/photoPostComment'
import { useUserStore } from '../../stores/user'
import { formatDateTime } from '../../utils/formator.js'
import { ref, toRefs, onMounted } from 'vue'
import router from '../../router/index'
import { XCircleIcon, EyeIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import { HeartIcon } from '@heroicons/vue/24/solid'
import { getComments } from '@/api/photoPost/photoPostComment'
import { useRoute } from 'vue-router'
import type { PhotoPost } from '@/types/Post'
import type { PostComment } from '@/types/Common'

const route = useRoute()
const userStore = useUserStore()
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})
const emit = defineEmits(['close'])

const userId = ref<number>()
let middleIdVar = userStore.getId()
if (middleIdVar) {
  userId.value = middleIdVar
}

const leftBlock = ref<HTMLElement | null>(null)
const rightBlock = ref<HTMLElement | null>(null)
const turnPage = ref<boolean>(false) //換頁判定變數

function close() {
  leftBlock.value?.classList.add('animate-slideInLeftBack')
  rightBlock.value?.classList.add('animate-slideInRightBack')
  leftBlock.value?.addEventListener('animationend', () => {
    emit('close')
  })
  rightBlock.value?.addEventListener('animationend', () => {
    emit('close')
  })
}

const { id } = toRefs(props)

const post = ref<PhotoPost>()
const pictureIndex = ref<number>(0)

//取得數據
const fetchPost = async () => {
  const responseData = await getPost(props.id)
  post.value = responseData.value
  postComments.value = responseData.value?.comments.reverse()
}

let isLiked = false

async function handleLikes() {
  if (!userStore.isLogin) {
    router.push({ name: 'Login' })
  }
  if (post.value && post.value && id && id.value) {
    if (!isLiked) {
      await setStats(id.value, 'like')
      post.value.likes++
      isLiked = true
    } else {
      await setStats(id.value, 'unlike')
      post.value.likes--
      isLiked = false
    }
  }
}

//--留言區資料
const postComments = ref<PostComment[]>()
const fetchCommentData = async () => {
  const commentsResponseData = await getComments(props.id)

  if (commentsResponseData.value) {
    postComments.value = commentsResponseData.value.reverse()
  }
}

const reloadCommentData = async () => {
  //重新加載留言資料//
  await fetchPost()
  if (post.value) {
    await fetchCommentData()
  }
}

const handleCreateComment = async (submitData: { authorId: number; content: String }) => {
  await createComment(props.id, submitData).catch((err) => {
    console.error(`發布評論失敗 失敗: ${err}`)
  })
  await reloadCommentData()
}

const handleDeleteComment = async (commentId: number) => {
  await deleteComment(commentId)
  await reloadCommentData()
}

onMounted(async () => {
  await setStats(props.id, 'view')
  await fetchPost()
})
</script>

<template>
  <div
    v-if="post && post.author && post.author.profile"
    class="left-0 top-0 z-20 flex size-full overflow-hidden"
    :class="route.name === 'PhotoPost' ? 'relative' : 'absolute'"
  >
    <div class="relative flex size-full flex-col-reverse lg:flex-row">
      <div ref="leftBlock" class="h-full basis-[30%] animate-slideInLeft overflow-auto bg-white">
        <Comment
          :post-id="post.id!"
          :comments-data="postComments ? postComments : []"
          @deleteComment="(commentId: number) => handleDeleteComment(commentId)"
          @createComment="(submitData: PostComment) => handleCreateComment(submitData)"
          style="height: 100%"
        />
      </div>
      <div
        ref="rightBlock"
        class="flex w-full basis-[70%] animate-slideInRight flex-col justify-around gap-2 overflow-auto bg-[#484538] px-4 pb-2 pt-8 sm:px-16 md:px-20 lg:pb-12 2xl:gap-4 2xl:py-8 2xl:pt-12"
      >
        <div class="relative z-0 flex-1">
          <div
            class="relative flex h-full flex-col gap-2 border border-stone-400 bg-white px-2 pb-1 pt-6 shadow-sm shadow-stone-600 sm:max-h-[28rem] sm:px-8 2xl:max-h-[32rem] 2xl:p-10"
          >
            <Transition :duration="1000">
              <div
                v-if="!turnPage"
                class="absolute left-0 top-0 flex size-full flex-col overflow-auto p-4 px-8 xl:justify-between 2xl:gap-4"
              >
                <div class="flex flex-1 flex-col items-center justify-between sm:flex-row sm:gap-4">
                  <div class="relative -ml-2 object-cover sm:basis-2/3 2xl:basis-1/2">
                    <img
                      :src="post.images![0].url"
                      :alt="post.images![0].publicId.toString()"
                      class="z-10 aspect-[4/3] rounded-sm object-cover shadow-sm shadow-stone-600 2xl:w-full"
                    />
                  </div>
                  <div
                    class="flex h-full flex-1 flex-col items-center overflow-hidden border-b-4 border-stone-600 pt-4 text-stone-700"
                  >
                    <h2 class="truncate text-center text-2xl font-bold 2xl:text-3xl">
                      {{ post.title }}
                    </h2>
                    <p class="py-2 text-center text-sm text-stone-500 2xl:py-4 2xl:text-xl">
                      {{ post.location }}
                    </p>
                    <p
                      class="my-auto flex max-h-60 w-full justify-center overflow-auto p-4 text-center italic 2xl:text-xl"
                    >
                      {{ post.description }}
                    </p>
                  </div>
                </div>
                <div
                  class="my-auto mt-2 flex flex-col justify-between gap-4 italic sm:mt-0 sm:flex-row xl:mt-4 2xl:mt-4"
                >
                  <div class="flex flex-col items-center gap-4 py-2 sm:flex-row sm:gap-2">
                    <router-link
                      :to="{
                        name: 'PersonalInfo',
                        params: { email: post.author.email }
                      }"
                    >
                      <div class="group flex items-center gap-2">
                        <div
                          class="flex size-10 items-center justify-center rounded-full border border-stone-800 bg-white p-1 2xl:size-14"
                        >
                          <img
                            class="rounded-full"
                            :src="`/assets/img/avatar (${post.author.profile.selectedAvatarIndex!}).png`"
                            alt="avatar"
                          />
                        </div>
                        <p
                          class="font-bold text-stone-600 group-hover:text-blue-800 2xl:text-xl 2xl:text-stone-700"
                        >
                          {{ post.author.username }}
                        </p>
                      </div>
                    </router-link>
                    <div class="flex items-baseline">
                      <p v-if="post.createdAt" class="text-sm text-stone-600 2xl:text-base">
                        -- {{ formatDateTime(post.createdAt) }}
                      </p>
                      <p v-if="!post.isEdit" class="text-sm text-stone-600 2xl:text-base">發布</p>
                      <p v-else class="text-sm text-stone-600 2xl:text-base">已編輯</p>
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-4 sm:justify-start">
                    <span class="flex items-center gap-1 text-blue-900 2xl:text-lg">
                      <EyeIcon class="w-6 2xl:w-8" />
                      <span>{{ post.views }}</span>
                    </span>
                    <span
                      class="group flex items-center gap-1 2xl:text-lg"
                      :class="isLiked ? 'text-red-500' : 'text-stone-700'"
                    >
                      <HeartIcon
                        @click="handleLikes"
                        class="w-6 cursor-pointer transition-all duration-500 group-hover:scale-105 2xl:w-8"
                      />
                      <span class="transition-all duration-500">{{ post.likes }}</span>
                    </span>
                  </div>
                </div>
              </div>
              <!-- 背面 -->
              <div
                v-else
                class="absolute top-0 size-full p-4 sm:w-auto sm:p-0 2xl:w-[calc(100%-2.5rem)]"
              >
                <div
                  class="flex h-full flex-col-reverse items-center justify-around gap-8 p-4 sm:flex-row lg:flex-row 2xl:px-0 2xl:py-8 2xl:pr-10"
                >
                  <div
                    class="flex size-full basis-1/2 flex-row gap-4 overflow-auto p-0 sm:w-auto sm:basis-1/4 sm:flex-col lg:basis-1/3 xl:basis-1/4 2xl:basis-1/3 2xl:gap-10 2xl:px-0"
                  >
                    <div
                      v-for="(picture, index) in post.images!"
                      :key="index"
                      @click="pictureIndex = index"
                      class="relative aspect-[4/3] shrink-0 cursor-pointer border-4 border-stone-400 object-cover transition-all duration-500 hover:scale-[105%] focus:border-stone-700 2xl:hover:scale-100"
                      tabindex="0"
                    >
                      <img
                        :src="picture.url"
                        :alt="picture.publicId.toString()"
                        class="relative z-10 shadow-sm shadow-stone-600"
                      />
                    </div>
                    <div
                      v-if="post.images!.length === 1"
                      class="relative flex aspect-[4/3] shrink-0 items-center justify-center border-4 border-dashed border-stone-200 text-stone-400"
                    >
                      <PhotoIcon
                        class="absolute left-1/2 top-1/2 w-8 -translate-x-1/2 -translate-y-1/2 xl:w-12"
                      />
                    </div>
                    <div
                      class="relative flex aspect-[4/3] shrink-0 items-center justify-center border-4 border-dashed border-stone-200 text-stone-400"
                    >
                      <PhotoIcon
                        class="absolute left-1/2 top-1/2 w-8 -translate-x-1/2 -translate-y-1/2 xl:w-12"
                      />
                    </div>
                  </div>

                  <div class="flex size-full overflow-auto sm:w-auto sm:items-center">
                    <div
                      class="h-fit w-full overflow-auto rounded-sm border-4 border-b-2 border-stone-600 sm:w-auto"
                    >
                      <img
                        :src="post.images![pictureIndex].url"
                        :alt="post.images![pictureIndex].publicId.toString()"
                        class="relative z-10 w-full shadow-sm shadow-stone-600 sm:w-auto 2xl:w-[36rem]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
          <div
            @click="turnPage = !turnPage"
            class="absolute left-0 top-4 -z-10 size-full rotate-3 cursor-pointer bg-white shadow-sm shadow-stone-600 transition-all duration-500 hover:top-4 sm:top-2 sm:max-h-[28rem] 2xl:max-h-[32rem]"
          >
            <span class="absolute bottom-1 right-2 text-sm italic text-stone-600">
              {{ turnPage ? 'Page2' : 'Page1' }}</span
            >
          </div>
        </div>
        <div class="mx-auto w-fit">
          <XCircleIcon
            @click="close"
            class="mx-auto w-12 cursor-pointer text-white transition-all ease-in hover:scale-105 2xl:w-16"
            :class="route.name === 'PhotoPost' ? 'hidden' : 'block'"
          />
        </div>
      </div>
    </div>
  </div>
  <Transition
    enter-active-class="transition ease-in duration-150 delay-0"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-150 delay-0"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-1"
  >
  </Transition>
</template>
