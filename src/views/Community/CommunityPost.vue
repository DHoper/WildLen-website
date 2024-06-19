<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { EyeIcon, ChatBubbleBottomCenterIcon } from "@heroicons/vue/24/outline";
import { HeartIcon } from "@heroicons/vue/24/solid";
import Comment from "@/components/post/Comment.vue";
import { getTimeDifference, formatDateTime } from "../../utils/formattingUtils";
import type { AuthorDataType, CommentType, CommunityPostType } from "@/types";
import { getPostData, setStats } from "@/api/community/community.js";
import { getAuthor } from "@/api/auth/auth.js";
import { setTagColor } from "../../fakeData/topicTags.js";
import {
  deleteComment,
  getComments,
  postComment,
} from "@/api/community/communityComment.js";

const router = useRouter();
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const postData = ref<CommunityPostType>();
const authorData = ref<AuthorDataType>();

//--貼文資料
const fetchPostData = async () => {
  const responseData = await getPostData(props.id);
  postData.value = responseData.value;
};

//--留言區資料
const commentsData = ref<CommentType[]>();
const fetchCommentData = async (idList: string[]) => {
  const commentsResponseData = await getComments(idList);

  if (commentsResponseData.value) {
    commentsData.value = commentsResponseData.value;
  }
};

const reloadCommentData = async () => {
  //重新加載留言資料//
  await fetchPostData();
  if (postData.value) {
    await fetchCommentData(postData.value.commentsId);
  }
};

const handlePostComment = async (submitData: object) => {
  await postComment(submitData).catch((err) => {
    console.error(`registerUser 失敗: ${err}`);
  });
  await reloadCommentData();
};

const handleDeleteComment = async (commentId: string) => {
  await deleteComment(commentId);
  await reloadCommentData();
};

//--按讚
let isLiked = false;

async function handleLikes() {
  if (postData.value && postData.value && props.id) {
    if (!isLiked) {
      await setStats(props.id, "increaseLikes");
      postData.value.likes++;
      isLiked = true;
    } else {
      await setStats(props.id, "reduceLikes");
      postData.value.likes--;
      isLiked = false;
    }
  }
}

onMounted(async () => {
  await setStats(props.id, "updateViews");
  await fetchPostData();
  if (postData.value) {
    const authorResponseData = await getAuthor(postData.value.authorId);
    authorData.value = authorResponseData.value;

    if (postData.value.commentsId.length > 0) {
      await fetchCommentData(postData.value.commentsId);
    }
  }
});
</script>

<template>
  <div v-if="postData && authorData" class="flex-1 w-full bg-fixed">
    <div class="bg-stone-100 w-full py-8 px-4">
      <div class="mx-auto flex flex-col items-center gap-20 bg-stone-100 w-[62rem] pt-20 px-5">
        <button @click="router.back()" class="self-start text-sm 2xl:text-xl font-bold text-stone-800">
          上一頁
        </button>
        <div class="mx-auto border-2 border-stone-800 w-full px-24 py-16 bg-white">
          <div class="flex items-center gap-4">
            <router-link :to="{
              name: 'PersonalInfo',
              params: { email: authorData.email },
            }">
              <div class="flex items-center gap-2">
                <div
                  class="border border-stone-800 rounded-full bg-white w-10 h-10 2xl:w-12 2xl:h-12 p-1 flex items-center justify-center overflow-hidden">
                  <img :src="`/assets/img/avatar (${authorData.selectedAvatarIndex}).png`" alt="avatar" />
                </div>
                <span class="2xl:text-lg text-stone-700 font-bold">
                  {{ authorData.username }}
                </span>
              </div>
            </router-link>
            <div class="flex gap-2 items-baseline justify-start flex-1">
              <span class="font-bold text-sm 2xl:text-base text-stone-500">{{ formatDateTime(postData.createdAt!) }}
                <span class="text-md italic">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                {{ getTimeDifference(postData.createdAt!) }} 以前
              </span>
            </div>
          </div>
          <h1 class="my-4 text-2xl 2xl:text-4xl 2xl:pt-4 text-stone-900 font-bold">
            {{ postData.title }}
          </h1>
          <div class="flex gap-2 flex-wrap">
            <span v-for="tag in postData.topicTags" class="px-2 py-1 text-sm rounded-sm text-stone-100"
              :style="`background-color:${setTagColor(tag)}`">
              {{ tag }}
            </span>
          </div>
          <div v-if="postData.images && postData.images.length > 0" class="mt-20 flex flex-col gap-4">
            <img :src="postData.images[0].url" class="border-2 border-stone-700" />
          </div>
          <p class="mt-10 text-stone-700 2xl:text-lg whitespace-pre-wrap overflow-auto">
            {{ postData.content }}
          </p>
          <div v-if="postData.images && postData.images.length > 0" class="mt-4 flex flex-col gap-4">
            <div v-for="(image, index) in postData.images">
              <img :key="index" v-if="index !== 0" :src="image.url" class="border-2 border-stone-700" />
            </div>
          </div>
          <div class="border-b-[1.5px] border-gray-300 my-4"></div>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-8 2xl:text-xl">
              <span class="flex items-center gap-1 text-blue-900">
                <EyeIcon class="w-4 2xl:w-6" />{{ postData.views }}
              </span>
              <span class="flex items-center gap-1 2xl:text-xl text-orange-900">
                <ChatBubbleBottomCenterIcon class="w-4 2xl:w-6" />
                {{ commentsData ? commentsData.length : 0 }}
              </span>
            </div>
            <span
              class="group flex items-center gap-1 2xl:text-xl hover:cursor-pointer focus:text-red-600 transition-all"
              tabindex="0">
              <HeartIcon @click="handleLikes"
                class="w-4 2xl:w-6 group-focus:scale-[115%] transition-all duration-300" />{{ postData.likes }}
            </span>
          </div>
        </div>
        <Comment :post-id="postData._id!" :comments-data="commentsData ? commentsData : []"
          @delete-comment="(commentId) => handleDeleteComment(commentId)"
          @post-comment="(submitData) => handlePostComment(submitData)" />
      </div>
    </div>
  </div>
</template>
