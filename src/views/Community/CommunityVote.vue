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
  <div v-if="vote" class="flex-1 w-full bg-fixed">
    <div class="bg-stone-100 w-full py-8 px-4">
      <div class="mx-auto flex flex-col items-center gap-20 bg-stone-100 w-[62rem] pt-20 px-5">
        <button
          @click="router.back()"
          class="self-start text-sm 2xl:text-xl font-bold text-stone-800"
        >
          上一頁
        </button>
        <div class="mx-auto border-2 border-stone-800 w-full px-24 py-12 bg-white">
          <div
            v-if="userHasVoted"
            class="mb-4 p-6 bg-orange-300 rounded text-white text-center text-base tracking-wide"
          >
            已參與
          </div>
          <div
            v-if="vote.isEnd || isBeforeToday(vote.endDate)"
            class="mb-4 p-6 bg-stone-300 rounded text-white text-center text-base tracking-wide"
          >
            已結束
          </div>

          <h1 class="my-4 text-2xl 2xl:text-4xl 2xl:pt-4 text-stone-900 font-bold">
            {{ vote.title }}
          </h1>
          <div class="flex items-center gap-4 mb-6">
            <router-link :to="{ name: 'PersonalInfo', params: { email: vote.author?.email } }">
              <div class="flex items-center gap-2">
                <div
                  class="border border-stone-800 rounded-full bg-white w-10 h-10 2xl:w-12 2xl:h-12 p-1 flex items-center justify-center overflow-hidden"
                >
                  <img
                    :src="`/assets/img/avatar (${vote.author?.profile?.selectedAvatarIndex}).png`"
                    alt="avatar"
                  />
                </div>
                <span class="2xl:text-lg text-stone-700 font-bold">{{
                  vote.author?.username
                }}</span>
              </div>
            </router-link>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-stone-500">
                {{
                  format(vote.startDate, 'yyyy-MM-dd', {
                    locale: zhTW
                  })
                }}
                <span class="text-md">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                {{
                  formatDistance(vote.startDate, new Date(), {
                    locale: zhTW
                  })
                }}
                前
              </span>
            </div>
          </div>
          <div class="bg-white p-4 mb-4 min-h-24">
            <div class="text-stone-700">{{ vote.description }}</div>
          </div>

          <div
            v-if="!vote.isEnd && !isBeforeToday(vote.endDate)"
            class="w-fit ml-auto font-semibold text-sm text-stone-500"
          >
            截止日期 :
            {{
              format(vote.endDate, 'yyyy-MM-dd', {
                locale: zhTW
              })
            }}
            <span class="text-md">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
            {{
              formatDistance(new Date(), vote.endDate, {
                locale: zhTW
              })
            }}
            後
          </div>

          <div class="border-t-2 border-stone-600 w-full mt-2 mb-8"></div>
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
