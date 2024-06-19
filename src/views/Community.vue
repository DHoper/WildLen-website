<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import router from "../router";
import {
  EyeIcon,
  ChatBubbleBottomCenterIcon,
  PlusIcon,
} from "@heroicons/vue/24/outline";

import { HeartIcon } from "@heroicons/vue/24/solid";
import { getPostsData } from "@/api/community/community.js";
import { CommunityPostType } from "../types";
import { getTimeDifference } from "../utils/formattingUtils";
import { getAuthor } from "@/api/auth/auth.js";
import { setTagColor } from "../fakeData/topicTags.js";

const votes = ref([
  {
    id: 7,
    title: "野生動物保育投票",
    description: "支持野生動物保護措施的投票。",
    deadline: "2023-12-15",
  },
  {
    id: 8,
    title: "動物權法案支持",
    description: "支持推動更嚴格的動物權利法案的投票。",
    deadline: "2023-11-30",
  },
  {
    id: 9,
    title: "寵物領養倡議",
    description: "支持推廣寵物領養而非購買的投票。",
    deadline: "2023-12-31",
  },
  {
    id: 12,
    title: "野生動物保育投票",
    description: "支持野生動物保護措施的投票。",
    deadline: "2023-12-15",
  },
  {
    id: 10,
    title: "農場動物福祉改進",
    description: "支持提高農場動物福祉標準的投票。",
    deadline: "2023-11-15",
  },
  {
    id: 11,
    title: "是否支持森林開發",
    description: "調查支持森林開發的投票。",
    deadline: "2023-12-15",
  },
]);

const communityPosts = ref<CommunityPostType[]>();
const usernameList = ref<string[]>([]);
const fetchData = async () => {
  const response = await getPostsData();
  communityPosts.value = response.value;
};


//--分頁
const activeTab = ref("latest");
const currentPage = ref(1);
const itemsPerPage = 6;

const filteredVotes = computed(() => {
  if (activeTab.value === "latest") {
    return votes.value;
  } else if (activeTab.value === "hot") {
    return votes.value.reverse();
  } else if (activeTab.value === "myVotes") {
    return votes.value.reverse();
  }
});

const filteredPosts = computed(() => {
  if (!sortedPosts.value) return;
  return sortedPosts.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  );
});

const totalPages = computed(() =>
  Math.ceil(sortedPosts.value!.length / itemsPerPage)
);

const changeTab = (tab: string) => {
  activeTab.value = tab;
  currentPage.value = 1;
};

const changePage = (action: string) => {
  if (action === "prev" && currentPage.value > 1) {
    currentPage.value--;
  } else if (action === "next" && currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (pageNumber: number) => {
  currentPage.value = pageNumber;
};

//--搜索
const searchString = ref<string>("");
const sortedPosts = ref<CommunityPostType[]>([]);

const sortPostsByTopic = () => {
  if (!communityPosts.value) return;
  const search = searchString.value.toLowerCase();
  sortedPosts.value = communityPosts.value.filter(
    (post) =>
      post.topicTags.some((tag) => tag.toLowerCase().includes(search)) ||
      post.title.toLowerCase().includes(search)
  );
};

onMounted(async () => {
  await fetchData();
  if (communityPosts.value) {
    for (const post of communityPosts.value) {
      const responseData = await getAuthor(post.authorId);
      if (responseData.value) {
        const username = responseData.value.username;
        usernameList.value.push(username);
      }
    }
    sortPostsByTopic();
  }
});
</script>

<template>
  <div v-if="communityPosts && votes && usernameList"
    class="flex-1 flex flex-col items-center gap-12 py-4 2xl:py-16 2xl:px-8 bg-stone-100 p-4 overflow-auto">
    <div class="votes w-full">
      <h1 class="text-3xl mb-4">話題投票</h1>
      <div class="border-b-2 border-stone-700 my-4"></div>
      <div class="flex space-x-4 mb-4">
        <button @click="changeTab('latest')" :class="activeTab === 'latest'
            ? 'bg-stone-800 text-white px-4 py-2 hover:bg-stone-800'
            : 'bg-stone-500 text-white px-4 py-2 hover:bg-stone-600'
          ">
          最新
        </button>
        <button @click="changeTab('hot')" :class="activeTab === 'hot'
            ? 'bg-stone-800 text-white px-4 py-2 hover:bg-stone-800'
            : 'bg-stone-500 text-white px-4 py-2 hover:bg-stone-600'
          ">
          熱門
        </button>
        <button @click="changeTab('myVotes')" :class="activeTab === 'myVotes'
            ? 'bg-stone-800 text-white px-4 py-2 hover:bg-stone-800'
            : 'bg-stone-500 text-white px-4 py-2 hover:bg-stone-600'
          ">
          我的投票
        </button>
      </div>
      <div class="flex gap-8 overflow-auto">
        <div v-for="vote in filteredVotes" :key="vote.id"
          class="md:basis-1/3 2xl:basis-1/4 flex-shrink-0 p-4 border-2 border-stone-700 shadow mb-4">
          <h2 class="text-xl mb-2">{{ vote.title }}</h2>
          <p class="text-stone-600">{{ vote.description }}</p>
          <div class="mt-4 flex justify-between items-center">
            <span class="text-stone-800">截止日期：{{ vote.deadline }}</span>
            <button class="bg-stone-800 text-white px-3 py-1 hover:bg-stone-800">
              投票
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
            <label for="searchByTopic"
              class="border-2 border-stone-600 bg-stone-600 text-stone-100 border-r-0 h-full px-4 text-lg flex justify-center items-center">
              <p>搜索</p>
            </label>
            <input type="text" id="searchByTopic" v-model="searchString" @input="sortPostsByTopic"
              class="rounded-none focus:outline-none border-2 border-stone-600 h-full text-lg m-0 w-48 px-2" />
          </div>
          <div @click="router.push({ name: 'CommunityCreatePost' })"
            class="flex gap-2 border-2 border-stone-600 p-1 px-2 2xl:p-2 2xl:px-4 2xl:text-lg hover:bg-stone-600 hover:text-stone-100 transition-all duration-300 cursor-pointer">
            新增文章
            <PlusIcon class="w-4" />
          </div>
        </div>
      </div>
      <div class="border-b-2 border-stone-700 my-4"></div>
      <div class="flex flex-col gap-4 justify-between mt-8">
        <div v-for="(communityPost, index) in filteredPosts" :key="communityPost._id" @click="
          router.push({
            name: 'CommunityPost',
            params: { id: communityPost._id },
          })
          "
          class="w-full basis-1 p-4 2xl:p-8 2xl:pb-4 border-2 border-stone-700 shadow cursor-pointer group hover:bg-stone-700 hover:text-white hover:border-stone-700 transition-all duration-300">
          <div class="flex justify-between">
            <div class="flex gap-4 items-center justify-center">
              <h2 class="text-xl font-bold max-w-[20rem] 2xl:max-w-[60rem] truncate overflow-hidden">
                {{ communityPost.title }}
              </h2>
              <div class="flex gap-2 flex-wrap">
                <span v-for="tag in communityPost.topicTags"
                  class="px-2 py-1 text-xs 2xl:text-sm rounded text-stone-100"
                  :style="`background-color:${setTagColor(tag)}`">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          <p class="my-2 2xl:my-4 text-stone-600 2xl:text-lg truncate group-hover:text-stone-100">
            {{ communityPost.content }}
          </p>

          <div class="mt-4 w-full flex gap-4 justify-between">
            <div class="flex items-baseline gap-2">
              <p class="text-sm 2xl:text-base text-stone-700 font-bold group-hover:text-stone-100">
                #{{ usernameList[index] }}
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
                  communityPost.commentsId.length
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分頁標籤 -->
      <div class="mt-16 flex justify-center gap-4">
        <button @click="changePage('prev')" :disabled="currentPage === 1"
          class="border-2 px-3 py-1 2xl:px-6 2xl:py-2 ml-2 2xl:text-lg transition-all duration-300" :class="currentPage === 1
              ? 'border-stone-500 text-stone-500'
              : 'border-stone-800 text-stone-800 cursor-pointer hover:text-white hover:bg-stone-800'
            ">
          上一頁
        </button>
        <div class="flex space-x-2">
          <button v-for="pageNumber in totalPages" :key="pageNumber" @click="goToPage(pageNumber)"
            class="border-2 px-3 py-1 2xl:px-5 2xl:py-2 2xl:text-lg transition-all duration-300" :class="pageNumber != currentPage
                ? 'border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white'
                : 'bg-stone-500 text-white hover:bg-stone-600 '
              ">
            {{ pageNumber }}
          </button>
        </div>
        <button @click="changePage('next')" :disabled="currentPage === totalPages"
          class="border-2 px-3 py-1 2xl:px-6 2xl:py-2 2xl:text-lg transition-all duration-300" :class="currentPage === totalPages
              ? 'border-stone-500 text-stone-500'
              : 'border-stone-800 text-stone-800 cursor-pointer hover-text-white hover:bg-stone-800'
            ">
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
