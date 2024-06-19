<script setup lang="ts">
import { getPostData, setStats } from "@/api/photoPost/photoPost.ts";
import { getAuthor } from "@/api/auth/auth.ts";
import Comment from "@/components/post/Comment.vue";
import {
  postComment,
  deleteComment,
} from "@/api/photoPost/photoPostComment.ts";
import { useUserStore } from "../../stores/user.ts";
import { formatDateTime } from "../../utils/formattingUtils.ts";
import { CommentType, PhotoPostType, AuthorDataType } from "../../types/index.js";
import { ref, toRefs, onMounted } from "vue";
import router from "../../router";
import { XCircleIcon, EyeIcon, PhotoIcon } from "@heroicons/vue/24/outline";
import { HeartIcon } from "@heroicons/vue/24/solid";
import { getComments } from "@/api/photoPost/photoPostComment.ts";
import { useRoute } from "vue-router";

const route = useRoute();
const userStore = useUserStore();
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["close"]);

const userId = ref<string>();
let middleIdVar = userStore.getId();
if (middleIdVar) {
  userId.value = middleIdVar;
}

const leftBlock = ref<HTMLElement | null>(null);
const rightBlock = ref<HTMLElement | null>(null);
const turnPage = ref<boolean>(false); //換頁判定變數

function close() {
  leftBlock.value?.classList.add("animate-slideInLeftBack");
  rightBlock.value?.classList.add("animate-slideInRightBack");
  leftBlock.value?.addEventListener("animationend", () => {
    emit("close");
  });
  rightBlock.value?.addEventListener("animationend", () => {
    emit("close");
  });
}

const { id } = toRefs(props);

const postData = ref<PhotoPostType>();
const postAuthorData = ref<AuthorDataType>();
const pictureIndex = ref<number>(0);

//取得數據
const fetchPostData = async () => {
  const responseData = await getPostData(props.id);
  postData.value = responseData.value;
};

let isLiked = false;

async function handleLikes() {
  if (!userStore.isLogin) {
    router.push({ name: "Login" });
  }
  if (postData && postData.value && id && id.value) {
    if (!isLiked) {
      await setStats(id.value, "increaseLikes");
      postData.value.likes++;
      isLiked = true;
    } else {
      await setStats(id.value, "reduceLikes");
      postData.value.likes--;
      isLiked = false;
    }
  }
}

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

onMounted(async () => {
  await setStats(props.id, "updateViews");
  await fetchPostData();
  if (postData.value) {
    const authorResponseData = await getAuthor(postData.value.authorId);
    postAuthorData.value = authorResponseData.value!;

    if (postData.value.commentsId.length > 0) {
      await fetchCommentData(postData.value.commentsId);
    }
  }
});
</script>

<template>
  <div v-if="postData && postAuthorData" class="z-10 flex top-0 left-0 w-full h-full overflow-hidden"
    :class="route.name === 'PhotoPost' ? 'relative' : 'absolute'">
    <div class="relative flex w-full h-full">
      <div ref="leftBlock" class="h-full animate-slideInLeft basis-[30%] bg-white overflow-auto">
        <Comment :post-id="postData._id!" :comments-data="commentsData ? commentsData : []"
          @delete-comment="(commentId) => handleDeleteComment(commentId)"
          @post-comment="(submitData) => handlePostComment(submitData)" style="height: 100%" />
      </div>
      <div ref="rightBlock"
        class="animate-slideInRight basis-[70%] flex flex-col w-full bg-[#484538] pt-8 px-20 overflow-auto">
        <div class="relative h-[26rem] 2xl:h-[36rem] my-auto">
          <div
            class="relative bg-white px-8 pb-1 pt-6 2xl:p-10 rounded-xs flex flex-col gap-2 shadow-sm shadow-stone-600 h-full border border-stone-400">
            <Transition :duration="1000">
              <div v-if="!turnPage" class="h-full flex flex-col">
                <div class="flex gap-4">
                  <div class="relative basis-2/3 -ml-2">
                    <img :src="postData.images[0].url" :alt="postData.images[0].filename"
                      class="rounded-sm 2xl:w-[36rem] z-10 shadow-sm shadow-stone-600" />
                  </div>
                  <div
                    class="flex-1 h-full pt-4 flex flex-col items-center text-stone-700 border-b-4 border-stone-600 overflow-hidden">
                    <h2 class="text-2xl font-bold text-center 2xl:text-3x truncate">
                      {{ postData.title }}
                    </h2>
                    <p class="text-sm text-center text-stone-500 py-2 2xl:py-4 2xl:text-xl">
                      {{ postData.location }}
                    </p>
                    <p
                      class="w-full max-h-60 p-4 italic text-center flex justify-center my-auto overflow-auto 2xl:text-xl">
                      {{ postData.description }}
                    </p>
                  </div>
                </div>
                <div class="flex gap-4 justify-between italic my-auto xl:mt-4 2xl:mt-4">
                  <div class="flex items-center py-2 gap-2">
                    <router-link :to="{
                      name: 'PersonalInfo',
                      params: { email: postAuthorData.email },
                    }">
                      <div class="flex items-center gap-2 group">
                        <div
                          class="border border-stone-800 rounded-full bg-white w-10 h-10 2xl:w-14 2xl:h-14 p-1 flex items-center justify-center">
                          <img class="rounded-full"
                            :src="`/assets/img/avatar (${postAuthorData.selectedAvatarIndex!}).png`" alt="avatar" />
                        </div>
                        <p class="text-stone-600 2xl:text-xl 2xl:text-stone-700 group-hover:text-blue-800 font-bold">
                          {{ postAuthorData.username }}
                        </p>
                      </div>
                    </router-link>
                    <div class="flex items-baseline">
                      <p v-if="postData.createdAt" class="text-stone-600 2xl:text-base text-sm">
                        -- {{ formatDateTime(postData.createdAt) }}
                      </p>
                      <p v-if="!postData.isEdit" class="text-stone-600 2xl:text-base text-sm">
                        發布
                      </p>
                      <p v-else class="text-stone-600 2xl:text-base text-sm">
                        已編輯
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="flex items-center gap-1 2xl:text-lg text-blue-900">
                      <EyeIcon class="w-6 2xl:w-8" />
                      <span>{{ postData.views }}</span>
                    </span>
                    <span class="flex items-center gap-1 2xl:text-lg group"
                      :class="isLiked ? 'text-red-500' : 'text-stone-700'">
                      <HeartIcon @click="handleLikes"
                        class="w-6 2xl:w-8 cursor-pointer group-hover:scale-105 transition-all duration-500" />
                      <span class="transition-all duration-500">{{
                        postData.likes
                        }}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="2xl:w-[calc(100%-2.5rem)] h-full absolute top-0">
                <div class="flex justify-around gap-8 2xl:pr-10 items-center h-full p-4 2xl:py-8 2xl:px-0">
                  <div
                    class="imgList basis-1/4 2xl:basis-1/3 overflow-hidden overflow-y-auto h-full flex flex-col gap-4 2xl:gap-10 p-2 2xl:px-0">
                    <div v-for="(picture, index) in postData.images" @click="pictureIndex = index"
                      class="relative cursor-pointer hover:scale-[105%] 2xl:hover:scale-100 transition-all duration-500 border-4 border-stone-400 focus:border-stone-700"
                      tabindex="0">
                      <img :src="picture.url" :alt="picture.filename"
                        class="relative z-10 shadow-sm shadow-stone-600" />
                    </div>
                    <div v-if="postData.images.length === 1"
                      class="relative flex items-center justify-center 2xl:h-80 border-4 border-dashed border-stone-200 lg:py-8 xl:py-10 2xl:py-28 2xl:text-2xl text-stone-400">
                      <PhotoIcon class="lg:w-8 xl:w-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div
                      class="relative flex items-center justify-center 2xl:h-80 border-4 border-dashed border-stone-200 lg:py-8 xl:py-10 2xl:py-28 2xl:text-2xl text-stone-400">
                      <PhotoIcon class="lg:w-8 xl:w-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div class="bigImg border-4 border-b-2 border-stone-600 rounded-sm">
                    <img :src="postData.images[pictureIndex].url" :alt="postData.images[pictureIndex].filename"
                      class="relative z-10 shadow-sm shadow-stone-600 2xl:w-[36rem]" />
                  </div>
                </div>
              </div>
            </Transition>
          </div>
          <div @click="turnPage = !turnPage"
            class="absolute top-2 left-0 shadow-sm shadow-stone-600 rotate-[3deg] w-full h-full -z-10 bg-white cursor-pointer hover:top-4 transition-all duration-500">
            <span class="absolute bottom-1 right-2 text-sm text-stone-600 italic">
              {{ turnPage ? "Page1" : "Page2" }}</span>
          </div>
        </div>
        <div class="mx-auto self-center flex justify-around 2xl:mb-4">
          <XCircleIcon @click="close"
            class="w-12 2xl:w-16 cursor-pointer text-white mx-auto py-4 hover:scale-105 transition-all ease-in"
            :class="route.name === 'PhotoPost' ? 'hidden' : 'block'" />
        </div>
      </div>
    </div>
  </div>
  <Transition enter-active-class="transition ease-in duration-150 delay-0" enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150 delay-0"
    leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
  </Transition>
</template>
