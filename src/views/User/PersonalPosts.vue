<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import router from '../../router'
import {
  EyeIcon,
  ChatBubbleBottomCenterIcon,
  TrashIcon,
  PencilSquareIcon
} from '@heroicons/vue/24/outline'
import { HeartIcon } from '@heroicons/vue/24/solid'
import {
  getUserPostsData as getPhotoPostsData,
  deletePost as deletePhotoPost
} from '@/api/photoPost/photoPost'
import {
  getUserPostsData as getCommunityPostsData,
  deletePost as deleteCommunityPost
} from '@/api/community/community'
import { useUserStore } from '../../stores/user'
import { formatDateTime } from '../../utils/formator'
import { getFirstLineWithEllipsis } from '@/utils/convertor'
import type { CommunityPost, PhotoPost } from '@/types/Post'
import type { Dialog } from '@/types/Common'

const userStore = useUserStore()
const userId = ref<number>()
let middleIdVar = userStore.getId()
if (middleIdVar) {
  userId.value = middleIdVar
}

const photoPosts = ref<PhotoPost[]>([])
const communityPosts = ref<CommunityPost[]>([])
const itemsPerPage = 5
const currentPage = ref(1)

const visiblePhotoPosts = computed(() => {
  if (photoPosts.value) {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return photoPosts.value.slice(start, end)
  }
  return []
})

const visibleCommunityPosts = computed(() => {
  if (communityPosts.value) {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return communityPosts.value.slice(start, end)
  }
  return []
})

const totalPage = computed(() => {
  if (photoPosts.value.length > 0) {
    return Math.ceil(photoPosts.value.length / itemsPerPage)
  }
  return 1
})

enum ActionPageType {
  PhotoPost = 'PhotoPost',
  CommunityPost = 'CommunityPost',
  EditPhotoPost = 'EditPhotoPost',
  EditCommunityPost = 'EditCommunityPost'
}

const openPostInNewTab = (actionPage: ActionPageType, postId: number) => {
  const url = router.resolve({
    name: actionPage,
    params: { id: postId }
  }).href
  window.open(url, '_blank')
}

// 刪除留言
const showDialog = ref(false)
const dialogData = ref<Dialog>({
  title: '刪除貼文',
  content: '是否確認刪除該貼文?',
  warringStyle: true,
  cancelButton: true
})

// 彈窗框邏輯
const userChoice = ref<boolean>()

const handleDialog = async () => {
  showDialog.value = true
  const dialogPromise = new Promise((resolve) => {
    watch(userChoice, () => {
      showDialog.value = false
      resolve(userChoice.value)
    })
  })
  return dialogPromise
}

const handleDelete = async (postType: ActionPageType, id: number) => {
  const choice = await handleDialog()
  if (choice) {
    if (postType === ActionPageType.PhotoPost) {
      await deletePhotoPost(id)
    } else if (postType === ActionPageType.CommunityPost) {
      await deleteCommunityPost(id)
    }
  }
  userChoice.value = undefined
  await fetchPostsData()
}

const fetchPostsData = async () => {
  if (!userId.value) return
  const photoPostsResponseData = await getPhotoPostsData(userId.value)

  const communityPostsResponseData = await getCommunityPostsData(userId.value)
  if (photoPostsResponseData.value && communityPostsResponseData.value) {
    photoPosts.value = photoPostsResponseData.value
    communityPosts.value = communityPostsResponseData.value
  }
}

const changePage = (pageChange: number) => {
  currentPage.value += pageChange
}

onMounted(async () => {
  await fetchPostsData()
})
const activeTab = ref('photoPosts')
</script>

<template>
  <div class="flex-1 bg-stone-100 py-24">
    <div
      class="mx-auto flex w-[90%] flex-col items-center border-4 border-stone-700 bg-stone-100 px-8 pb-10 pt-20 shadow sm:w-4/5 md:w-2/3 md:px-28 2xl:w-1/2"
    >
      <h1 class="mb-20 text-5xl font-bold">貼文紀錄</h1>
      <!-- 選項卡 -->
      <div class="flex space-x-4">
        <button
          @click="activeTab = 'photoPosts'"
          class="cursor-pointer border-2 px-4 py-2"
          :class="{
            'border-transparent bg-stone-700 text-white': activeTab === 'photoPosts',
            'border-stone-700 bg-white': activeTab !== 'photoPosts'
          }"
        >
          照片牆貼文
        </button>
        <button
          @click="activeTab = 'communityPosts'"
          class="cursor-pointer border-2 px-4 py-2"
          :class="{
            'border-transparent bg-stone-700 text-white': activeTab === 'communityPosts',
            'border-stone-700 bg-white': activeTab !== 'communityPosts'
          }"
        >
          社區頁貼文
        </button>
      </div>

      <!-- 照片牆 -->
      <div
        v-if="activeTab === 'photoPosts' && visiblePhotoPosts.length > 0"
        class="mt-10 h-[45rem] w-full"
      >
        <div
          v-for="post in visiblePhotoPosts"
          :key="post.id!"
          class="mb-4 flex h-32 w-full flex-col justify-between gap-1 border-2 border-stone-700 bg-white p-4 text-stone-700 shadow"
        >
          <div class="flex justify-between">
            <h2 class="truncate text-xl font-bold">{{ post.title }}</h2>
            <div class="flex gap-4">
              <EyeIcon
                @click="openPostInNewTab(ActionPageType.PhotoPost, post.id!)"
                class="w-6 cursor-pointer text-blue-900 transition-all duration-300 hover:text-blue-700"
              />
              <PencilSquareIcon
                @click="openPostInNewTab(ActionPageType.EditPhotoPost, post.id!)"
                class="w-6 cursor-pointer text-blue-700 transition-all duration-300 hover:text-blue-500"
              />
              <TrashIcon
                @click="handleDelete(ActionPageType.PhotoPost, post.id!)"
                class="w-6 cursor-pointer text-red-700 transition-all duration-300 hover:text-red-500"
              />
            </div>
          </div>
          <p class="truncate text-stone-500">{{ post.description }}</p>
          <div class="flex justify-between gap-2 text-sm text-gray-500">
            <div class="ml-auto flex gap-2 sm:ml-0">
              <span class="flex items-center gap-1 text-base text-blue-900">
                <EyeIcon class="w-5" /> {{ post.views }}
              </span>
              <span class="flex items-center gap-1 text-base text-red-700">
                <HeartIcon class="w-5" />{{ post.likes }}
              </span>
              <span class="flex items-center gap-1 text-base text-teal-900">
                <ChatBubbleBottomCenterIcon class="w-5" />
                {{ post.comments!.length }}
              </span>
            </div>
            <span class="hidden sm:block">
              {{ formatDateTime(post.createdAt!) }}
            </span>
          </div>
        </div>
      </div>
      <div
        v-else-if="activeTab === 'photoPosts'"
        class="mb-4 mt-8 flex h-32 w-full items-center justify-center border-2 border-stone-700 bg-white p-4 text-lg text-stone-700 shadow"
      >
        暫無貼文紀錄
      </div>

      <!-- 社區 -->
      <div
        v-if="activeTab === 'communityPosts' && visibleCommunityPosts.length > 0"
        class="mt-10 h-[45rem] w-full"
      >
        <div
          v-for="post in visibleCommunityPosts"
          :key="post.id!"
          class="mb-4 flex h-32 w-full flex-col justify-between gap-1 border-2 border-stone-700 bg-white p-4 text-stone-700 shadow"
        >
          <div class="flex justify-between">
            <h2 class="truncate text-xl font-bold">{{ post.title }}</h2>
            <div class="flex gap-4">
              <EyeIcon
                @click="openPostInNewTab(ActionPageType.CommunityPost, post.id!)"
                class="w-6 cursor-pointer text-blue-900 transition-all duration-300 hover:text-blue-700"
              />
              <PencilSquareIcon
                @click="openPostInNewTab(ActionPageType.EditCommunityPost, post.id!)"
                class="w-6 cursor-pointer text-blue-700 transition-all duration-300 hover:text-blue-500"
              />
              <TrashIcon
                @click="handleDelete(ActionPageType.CommunityPost, post.id!)"
                class="w-6 cursor-pointer text-red-700 transition-all duration-300 hover:text-red-500"
              />
            </div>
          </div>
          <p class="truncate text-stone-500">{{ getFirstLineWithEllipsis(post.content) }}</p>
          <div class="flex justify-between gap-2 text-sm text-gray-500">
            <div class="ml-auto flex gap-2 sm:ml-0">
              <span class="flex items-center gap-1 text-base text-blue-900">
                <EyeIcon class="w-5" /> {{ post.views }}
              </span>
              <span class="flex items-center gap-1 text-base text-red-700">
                <HeartIcon class="w-5" />{{ post.likes }}
              </span>
              <span class="flex items-center gap-1 text-base text-teal-900">
                <ChatBubbleBottomCenterIcon class="w-5" />
                {{ post.comments!.length }}
              </span>
            </div>
            <span class="hidden sm:block">
              {{ formatDateTime(post.createdAt!) }}
            </span>
          </div>
        </div>
      </div>
      <div
        v-else-if="activeTab === 'communityPosts'"
        class="mb-4 mt-8 flex h-32 w-full items-center justify-center border-2 border-stone-700 bg-white p-4 text-lg text-stone-700 shadow"
      >
        暫無貼文紀錄
      </div>

      <!-- 分頁 -->
      <div class="mt-4">
        <button
          @click="changePage(-1)"
          :disabled="currentPage === 1"
          class="cursor-pointer border-2 border-stone-600 px-4 py-2"
        >
          上一頁
        </button>
        <span class="mx-2 border-2 border-stone-900 px-4 py-2">{{ currentPage }}</span>
        <button
          @click="changePage(1)"
          :disabled="currentPage === totalPage"
          class="cursor-pointer border-2 border-stone-600 px-4 py-2"
        >
          下一頁
        </button>
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
      <Dialog
        v-if="showDialog"
        :dialogData="dialogData"
        @closePopup="(choice: boolean) => (userChoice = choice)"
      />
    </Transition>
  </div>
</template>
