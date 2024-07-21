<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { UserVote, Vote } from '@/types/Vote'
import { checkUserVoted, getVoteById } from '@/api/community/vote'
import { useUserStore } from '@/stores/user'
import VoteResult from '@/components/vote/VoteResult.vue'
import VoteParticipateIn from '@/components/vote/VoteParticipateIn.vue'
import { useLoadingStore } from '@/stores/loading'
import { format, formatDistance } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { isBeforeToday } from '@/utils/helper'

const router = useRouter()
const userStore = useUserStore()
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})

const vote = ref<Vote>()
const userHasVoted = computed(() => {
  return isUserVoted.value
})

const isUserVoted = ref<boolean>(false)
const existingUserVote = ref<UserVote | null>(null)

const checkIfVoted = async () => {
  try {
    const response = await checkUserVoted(vote.value!.id!, userStore.user!.id)

    isUserVoted.value = response.isVoted
    existingUserVote.value = response.existingUserVote
  } catch (error) {
    console.error('Error checking user vote:', error)
  }
}

const fetchVoteData = async () => {
  try {
    const response = await getVoteById(props.id)
    vote.value = response.value

    if (userStore.user) {
      const result = await checkUserVoted(props.id, userStore.user.id)
      userHasVoted.value = result.hasVoted
    }
  } catch (error) {
    console.error('Error fetching vote data:', error)
  }
}
onMounted(async () => {
  const loadingStore = useLoadingStore() //設置loading動畫頁
  loadingStore.setLoadingStatus(true)
  loadingStore.setInRequest(true)

  await fetchVoteData()
  await checkIfVoted()

  loadingStore.setInRequest(false)
  loadingStore.setLoadingStatus(false)
})
</script>

<template>
  <div v-if="vote" class="w-full flex-1 bg-fixed">
    <div class="w-full bg-stone-100 px-4 py-8">
      <div class="mx-auto flex max-w-7xl flex-col items-center gap-8 bg-stone-100 px-5 pt-20 lg:gap-20 lg:px-8 lg:pt-24">
        <button
          @click="router.back()"
          class="self-start text-sm font-bold text-stone-800 2xl:text-xl"
        >
          上一頁
        </button>
        <div class="mx-auto w-full border-2 border-stone-800 bg-white px-6 py-8 sm:px-12 sm:py-10 lg:px-24 lg:py-16">
          <div
            v-if="userHasVoted && !vote.isEnd"
            class="mb-4 rounded bg-orange-300 p-6 text-center text-base tracking-wide text-white"
          >
            已參與
          </div>
          <div
            v-if="vote.isEnd || isBeforeToday(vote.endDate)"
            class="mb-4 rounded bg-stone-300 p-6 text-center text-base tracking-wide text-white"
          >
            已結束
          </div>

          <h1 class="my-4 text-2xl font-bold text-stone-900 2xl:pt-4 2xl:text-4xl">
            {{ vote.title }}
          </h1>
          <div class="mb-6 flex flex-wrap items-center gap-4">
            <router-link :to="{ name: 'PersonalInfo', params: { email: vote.author?.email } }">
              <div class="flex items-center gap-2">
                <div
                  class="flex size-10 items-center justify-center overflow-hidden rounded-full border border-stone-800 bg-white p-1 2xl:size-12"
                >
                  <img
                    :src="`/assets/img/avatar (${vote.author?.profile?.selectedAvatarIndex}).png`"
                    alt="avatar"
                  />
                </div>
                <span class="font-bold text-stone-700 2xl:text-lg">{{
                  vote.author?.username
                }}</span>
              </div>
            </router-link>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-stone-500">
                {{
                  format(vote.startDate, 'yyyy-MM-dd', {
                    locale: zhTW
                  })
                }}
                <span class="text-base">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                {{
                  formatDistance(vote.startDate, new Date(), {
                    locale: zhTW
                  })
                }}
                前
              </span>
            </div>
          </div>
          <div class="mb-4 min-h-24 bg-white p-4">
            <div class="text-stone-700">{{ vote.description }}</div>
          </div>

          <div
            v-if="!vote.isEnd && !isBeforeToday(vote.endDate)"
            class="ml-auto w-fit text-sm font-semibold text-stone-500"
          >
            截止日期 :
            {{
              format(vote.endDate, 'yyyy-MM-dd', {
                locale: zhTW
              })
            }}
            <span class="text-base">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
            {{
              formatDistance(new Date(), vote.endDate, {
                locale: zhTW
              })
            }}
            後
          </div>

          <div class="mb-8 mt-2 w-full border-t-2 border-stone-600"></div>
          <VoteParticipateIn
            v-if="!vote.isEnd && !isBeforeToday(vote.endDate)"
            :vote="vote"
            :is-user-voted="isUserVoted"
            :existing-user-vote="existingUserVote"
          />
          <VoteResult v-else :vote="vote" />
        </div>
      </div>
    </div>
  </div>
</template>
