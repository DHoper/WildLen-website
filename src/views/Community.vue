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
// const sortedPosts = computed(() => sortPostsByTopic())

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
    class="flex-1 flex flex-col items-center gap-12 py-4 2xl:py-16 2xl:px-8 bg-stone-100 p-4 overflow-auto"
  >
    <div class="votes w-full">
      <h1 class="text-3xl mb-4">話題投票</h1>
      <div class="border-b-2 border-stone-700 my-4"></div>
      <div class="flex gap-4 mb-4">
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
            'bg-stone-800 text-white px-4 py-2': activeTab === 'myCreatedVotes',
            'bg-stone-500 text-white px-4 py-2 hover:bg-stone-600': activeTab !== 'myCreatedVotes'
          }"
        >
          我的投票
        </button>

        <button
          @click="router.push({ name: 'CreateVote' })"
          class="ml-auto bg-green-700 text-white px-4 py-2 hover:bg-green-800 transition-all"
        >
          發起新投票
        </button>
      </div>
      <div class="flex gap-8 overflow-auto">
        <div
          v-for="vote in filteredVotes"
          :key="vote.id"
          :class="[
            'md:basis-1/3 2xl:basis-1/4 flex-shrink-0 p-4 border-2 shadow mb-4',
            vote.isEnd || isBeforeToday(vote.endDate)
              ? 'bg-gray-200 border-gray-400'
              : vote.userHasVoted
                ? 'bg-stone-300 border-stone-500'
                : 'bg-stone-100 border-stone-700'
          ]"
        >
          <div class="flex gap-4 items-center mb-2">
            <h2 class="text-xl">{{ vote.title }}</h2>
            <span class="h-fit flex gap-1 justify-center items-center text-red-500">
              <FireIcon class="h-4 w-4" />
              {{ vote.participantCount }}
            </span>
          </div>

          <div class="mt-4 flex justify-between items-end">
            <span class="text-stone-800"
              >截止日：{{ format(new Date(vote.endDate), 'yyyy-MM-dd') }}</span
            >

            <button
              @click="router.push({ name: 'Vote', params: { id: vote.id } })"
              :class="[
                'text-white px-4 py-2 transition-all',
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

    <!-- 貼文 -->
    <div class="w-full mt-auto">
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-3xl leading-none">社區討論</h1>
        <div class="flex gap-4 items-center">
          <div class="flex items-center h-12">
            <label
              for="searchByTopic"
              class="border-2 border-stone-600 bg-stone-600 text-stone-100 border-r-0 h-full px-4 text-lg flex justify-center items-center"
            >
              <p>搜尋</p>
            </label>
            <input
              type="text"
              id="searchByTopic"
              v-model="searchString"
              @input="sortPostsByTopic"
              class="rounded-none focus:outline-none border-2 border-stone-600 h-full text-lg m-0 w-48 px-2"
            />
          </div>
          <div
            @click="router.push({ name: 'CommunityCreatePost' })"
            class="flex items-center font-bold h-12 border-2 border-stone-600 bg-stone-600 text-stone-100 p-2 px-3 2xl:p-2 2xl:px-4 2xl:text-lg hover:bg-stone-100 hover:text-stone-600 transition-all duration-300 cursor-pointer"
          >
            <PlusIcon class="w-6 font-bold" />
          </div>
        </div>
      </div>
      <div class="border-b-2 border-stone-700 my-4"></div>
      <div
        v-if="communityPosts && communityPosts.length > 0"
        class="flex flex-col gap-4 justify-between mt-8"
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
          class="w-full basis-1 p-4 2xl:p-8 2xl:pb-4 border-2 border-stone-700 shadow cursor-pointer group hover:bg-stone-700 hover:text-white hover:border-stone-700 transition-all duration-300"
        >
          <div class="flex justify-between">
            <div class="flex gap-4 items-center justify-center">
              <h2
                class="text-xl font-bold max-w-[20rem] 2xl:max-w-[60rem] truncate overflow-hidden"
              >
                {{ communityPost.title }}
              </h2>
              <div class="flex gap-1">
                <span
                  v-for="(tag, index) in communityPost.topicTags"
                  :key="index"
                  class="px-2 py-1 text-xs 2xl:text-sm rounded text-stone-100"
                  :style="`background-color:${setTagColor(tag)}`"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          <div
            class="my-2 overflow-hidden 2xl:my-4 text-stone-600 2xl:text-lg truncate group-hover:text-stone-100"
          >
            {{ getFirstLineWithEllipsis(communityPost.content) }}
          </div>

          <div class="mt-4 w-full flex gap-4 justify-between">
            <div class="flex items-baseline gap-2">
              <p class="text-sm 2xl:text-base text-stone-700 font-bold group-hover:text-stone-100">
                #{{ communityPost.author?.username }}
              </p>
              <p class="text-sm 2xl:text-base italic text-stone-500 group-hover:text-stone-100">
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
          class="border-2 px-3 py-1 2xl:px-6 2xl:py-2 ml-2 2xl:text-lg transition-all duration-300"
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
            class="border-2 px-3 py-1 2xl:px-5 2xl:py-2 2xl:text-lg transition-all duration-300"
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
          class="border-2 px-3 py-1 2xl:px-6 2xl:py-2 2xl:text-lg transition-all duration-300"
          :class="
            currentPage === totalPages
              ? 'border-stone-500 text-stone-500'
              : 'border-stone-800 text-stone-800 cursor-pointer hover-text-white hover:bg-stone-800'
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
