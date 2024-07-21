<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import router from '../router'
import { EyeIcon, ChatBubbleBottomCenterIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { HeartIcon } from '@heroicons/vue/24/solid'
import { FireIcon } from '@heroicons/vue/24/solid'
import { getPosts } from '@/api/community/community.js'
import { getTimeDifference } from '../utils/formator'
import { setTagColor } from '../fakeData/topicTags.js'
import type { CommunityPost } from '@/types/Post'
import { getFirstLineWithEllipsis } from '@/utils/convertor'
import type { Vote } from '@/types/Vote'
import { getAllVotes } from '@/api/community/vote'
import { format } from 'date-fns'
import { useLoadingStore } from '@/stores/loading'
import { useUserStore } from '@/stores/user'
import { isBeforeToday } from '@/utils/helper'

const userStore = useUserStore()

const communityPosts = ref<CommunityPost[]>([])
const votes = ref<Vote[]>([])
const searchString = ref<string>('')
const currentPage = ref(1)
const totalPages = ref<number>()
const itemsPerPage = 6

const fetchData = async (startFromLast: number) => {
  const response = await getPosts(startFromLast)

  if (response.value && response.value.posts && response.value.totalCount) {
    communityPosts.value = response.value.posts

    const totalCount = response.value.totalCount
    totalPages.value = Math.ceil(totalCount / itemsPerPage)

    sortPostsByTopic()
  }
}

const fetchVotesData = async () => {
  const response = await getAllVotes(userStore.user!.id)
  votes.value = response.value
}

const activeTab = ref('latest')
const filteredVotes = computed(() => {
  switch (activeTab.value) {
    case 'hot':
      return votes.value
        .filter((vote) => !vote.isEnd || isBeforeToday(vote.endDate))
        .sort((a, b) => b.participantCount! - a.participantCount!)
    case 'myVotes':
      return votes.value.filter((vote) => vote.userHasVoted)
    case 'ended':
      return votes.value.filter((vote) => vote.isEnd || isBeforeToday(vote.endDate))
    case 'myCreatedVotes':
      return votes.value.filter((vote) => vote.author!.id === userStore.user!.id)
    default:
      return votes.value
        .filter((vote) => !vote.isEnd || isBeforeToday(vote.endDate))
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
  }
})

const changeTab = (tab: string) => {
  activeTab.value = tab
  currentPage.value = 1
}

const changePage = (action: string) => {
  if (!totalPages.value) return
  if (action === 'prev' && currentPage.value > 1) {
    currentPage.value--
    fetchData((currentPage.value - 1) * itemsPerPage)
  } else if (action === 'next' && currentPage.value < totalPages.value) {
    currentPage.value++
    fetchData((currentPage.value - 1) * itemsPerPage)
  }
}

const goToPage = (pageNumber: number) => {
  currentPage.value = pageNumber
  fetchData((pageNumber - 1) * itemsPerPage)
}

const sortPostsByTopic = () => {
  if (!communityPosts.value) return []
  const search = searchString.value.toLowerCase()
  return communityPosts.value.filter(
    (post) =>
      post.topicTags.some((tag) => tag.toLowerCase().includes(search)) ||
      post.title.toLowerCase().includes(search)
  )
}

onMounted(async () => {
  const loadingStore = useLoadingStore()
  loadingStore.setLoadingStatus(true)
  loadingStore.setInRequest(true)

  await fetchData(0)
  await fetchVotesData()

  loadingStore.setInRequest(false)
  loadingStore.setLoadingStatus(false)
})
</script>

<template>
  <div
    v-if="communityPosts && votes"
    class="flex flex-1 flex-col items-center gap-12 overflow-auto bg-stone-100 p-4 sm:p-6 md:p-8 lg:p-10 2xl:px-8 2xl:py-16"
  >
    <div class="w-full">
      <h1 class="mb-4 text-2xl sm:text-3xl">話題投票</h1>
      <div class="my-4 border-b-2 border-stone-700"></div>
      <div class="mb-8 flex flex-wrap gap-4 lg:mb-4">
        <button
          @click="changeTab('latest')"
          class="transition-all"
          :class="
            activeTab === 'latest'
              ? 'bg-stone-800 text-white px-4 py-2'
              : 'bg-stone-500 text-white px-4 py-2 hover:bg-stone-600'
          "
        >
          最新
        </button>
        <button
          @click="changeTab('hot')"
          class="transition-all"
          :class="
            activeTab === 'hot'
              ? 'bg-stone-800 text-white px-4 py-2'
              : 'bg-stone-500 text-white px-4 py-2 hover:bg-stone-600'
          "
        >
          熱門
        </button>
        <button
          @click="changeTab('myVotes')"
          class="transition-all"
          :class="
            activeTab === 'myVotes'
              ? 'bg-stone-800 text-white px-4 py-2'
              : 'bg-stone-500 text-white px-4 py-2 hover:bg-stone-600'
          "
        >
          已參與的投票
        </button>
        <button
          @click="changeTab('ended')"
          class="transition-all"
          :class="
            activeTab === 'ended'
              ? 'bg-stone-800 text-white px-4 py-2'
              : 'bg-stone-500 text-white px-4 py-2 hover:bg-stone-600'
          "
        >
          已結束
        </button>
        <button
          @click="changeTab('myCreatedVotes')"
          class="transition-all"
          :class="{
            'bg-stone-800 px-4 py-2 text-white': activeTab === 'myCreatedVotes',
            'bg-stone-500 px-4 py-2 text-white hover:bg-stone-600': activeTab !== 'myCreatedVotes'
          }"
        >
          我的投票
        </button>
        <button
          @click="router.push({ name: 'CreateVote' })"
          class="ml-auto bg-green-700 px-4 py-2 text-white transition-all hover:bg-green-800"
        >
          發起新投票
        </button>
      </div>
      <div class="overflow-x-auto ">
        <div class="flex max-h-52 w-full flex-wrap gap-4 lg:max-h-36 lg:flex-nowrap">
          <div
            v-for="vote in filteredVotes"
            :key="vote.id"
            :class="[
              'w-full shrink-0 border-2 p-4 shadow sm:w-[calc(50%-1rem)] lg:mb-4 lg:w-1/4',
              vote.isEnd || isBeforeToday(vote.endDate)
                ? 'border-gray-400 bg-gray-200'
                : vote.userHasVoted
                  ? 'border-stone-500 bg-stone-300'
                  : 'border-stone-700 bg-stone-100'
            ]"
          >
            <div class="mb-2 flex items-center gap-4">
              <h2 class="text-xl">{{ vote.title }}</h2>
              <span class="flex h-fit items-center justify-center gap-1 text-red-500">
                <FireIcon class="w-4" />
                {{ vote.participantCount }}
              </span>
            </div>

            <div class="mt-4 flex items-end justify-between">
              <span class="text-stone-800"
                >截止日：{{ format(new Date(vote.endDate), 'yyyy-MM-dd') }}</span
              >

              <button
                @click="router.push({ name: 'Vote', params: { id: vote.id } })"
                :class="[
                  'px-4 py-2 text-white transition-all',
                  vote.isEnd || isBeforeToday(vote.endDate)
                    ? 'bg-gray-400 hover:bg-gray-500'
                    : vote.userHasVoted
                      ? 'bg-stone-600 hover:bg-stone-700'
                      : 'bg-stone-500 hover:bg-stone-600'
                ]"
              >
                {{ vote.isEnd ? '已結束' : vote.userHasVoted ? '已投票' : '投票' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 貼文 -->
    <div class="mt-auto w-full">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-2xl leading-none sm:text-3xl">社區討論</h1>
        <div class="flex items-center gap-4">
          <div class="flex h-12 items-center">
            <label
              for="searchByTopic"
              class="flex h-full items-center justify-center border-2 border-r-0 border-stone-600 bg-stone-600 px-4 text-lg text-stone-100"
            >
              <p>搜尋</p>
            </label>
            <input
              type="text"
              id="searchByTopic"
              v-model="searchString"
              @input="sortPostsByTopic"
              class="m-0 h-full w-48 rounded-none border-2 border-stone-600 px-2 text-lg focus:outline-none"
            />
          </div>
          <div
            @click="router.push({ name: 'CommunityCreatePost' })"
            class="flex h-12 cursor-pointer items-center border-2 border-stone-600 bg-stone-600 p-2 px-3 font-bold text-stone-100 transition-all duration-300 hover:bg-stone-100 hover:text-stone-600 2xl:p-2 2xl:px-4 2xl:text-lg"
          >
            <PlusIcon class="w-6 font-bold" />
          </div>
        </div>
      </div>
      <div class="my-4 border-b-2 border-stone-700"></div>
      <div
        v-if="communityPosts && communityPosts.length > 0"
        class="mt-8 flex flex-col justify-between gap-4"
      >
        <div
          v-for="communityPost in communityPosts"
          :key="communityPost.id"
          @click="
            router.push({
              name: 'CommunityPost',
              params: { id: communityPost.id }
            })
          "
          class="group w-full cursor-pointer border-2 border-stone-700 p-4 shadow transition-all duration-300 hover:border-stone-700 hover:bg-stone-700 hover:text-white 2xl:p-8 2xl:pb-4"
        >
          <div class="flex justify-between">
            <div class="flex items-center justify-center gap-4">
              <h2
                class="max-w-40 overflow-hidden truncate text-xl font-bold sm:max-w-80 md:max-w-[30rem] lg:max-w-[40rem] 2xl:max-w-[60rem]"
              >
                {{ communityPost.title }}
              </h2>
              <div class="flex gap-1">
                <span
                  v-for="(tag, index) in communityPost.topicTags"
                  :key="index"
                  class="rounded px-2 py-1 text-xs text-stone-100 2xl:text-sm"
                  :style="`background-color:${setTagColor(tag)}`"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          <div
            class="my-2 overflow-hidden truncate text-stone-600 group-hover:text-stone-100 2xl:my-4 2xl:text-lg"
          >
            {{ getFirstLineWithEllipsis(communityPost.content) }}
          </div>

          <div class="mt-4 flex w-full justify-between gap-4">
            <div class="flex items-baseline gap-2">
              <p class="text-sm font-bold text-stone-700 group-hover:text-stone-100 2xl:text-base">
                #{{ communityPost.author?.username }}
              </p>
              <p class="text-sm italic text-stone-500 group-hover:text-stone-100 2xl:text-base">
                --{{ getTimeDifference(communityPost.createdAt!) }}&nbsp;前
              </p>
            </div>

            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1 text-blue-900 group-hover:text-stone-100">
                <EyeIcon class="w-6 2xl:w-7" />{{ communityPost.views }}
              </span>
              <span class="flex items-center gap-1 text-red-600 group-hover:text-stone-100">
                <HeartIcon class="w-6 2xl:w-7" />{{ communityPost.likes }}
              </span>
              <span class="flex items-center gap-1 text-stone-700 group-hover:text-stone-100">
                <ChatBubbleBottomCenterIcon class="w-6 2xl:w-7" />{{
                  communityPost.comments ? communityPost.comments.length : 0
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="ml-1">暫無任何文章</div>

      <!-- 分頁標籤 -->
      <div class="mt-16 flex justify-center gap-4">
        <button
          @click="changePage('prev')"
          :disabled="currentPage === 1"
          class="ml-2 border-2 px-3 py-1 transition-all duration-300 2xl:px-6 2xl:py-2 2xl:text-lg"
          :class="
            currentPage === 1
              ? 'border-stone-500 text-stone-500'
              : 'border-stone-800 text-stone-800 cursor-pointer hover:text-white hover:bg-stone-800'
          "
        >
          上一頁
        </button>
        <div class="flex space-x-2">
          <button
            v-for="pageNumber in totalPages"
            :key="pageNumber"
            @click="goToPage(pageNumber)"
            class="border-2 px-3 py-1 transition-all duration-300 2xl:px-5 2xl:py-2 2xl:text-lg"
            :class="
              pageNumber != currentPage
                ? 'border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white'
                : 'bg-stone-500 text-white hover:bg-stone-600 '
            "
          >
            {{ pageNumber }}
          </button>
        </div>
        <button
          @click="changePage('next')"
          :disabled="currentPage === totalPages"
          class="border-2 px-3 py-1 transition-all duration-300 2xl:px-6 2xl:py-2 2xl:text-lg"
          :class="
            currentPage === totalPages
              ? 'border-stone-500 text-stone-500'
              : 'border-stone-800 text-stone-800 cursor-pointer hover:text-white hover:bg-stone-800'
          "
        >
          下一頁
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.votes ::-webkit-scrollbar {
  width: 6px;
}

.votes ::-webkit-scrollbar-track {
  background-color: white;
}

.votes ::-webkit-scrollbar-thumb {
  background-color: gray;
}
</style>
