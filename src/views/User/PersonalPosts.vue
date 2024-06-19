<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import router from "../../router";
import {
  EyeIcon,
  ChatBubbleBottomCenterIcon,
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/vue/24/outline";
import { HeartIcon } from "@heroicons/vue/24/solid";
import type { CommunityPostType, DialogType, PhotoPostType } from "@/types";
import {
  getUserPostsData as getPhotoPostsData,
  deletePost as deletePhotoPost,
} from "@/api/photoPost/photoPost";
import {
  getUserPostsData as getCommunityPostsData,
  deletePost as deleteCommunityPost,
} from "@/api/community/community";
import { useUserStore } from "../../stores/user";
import { formatDateTime } from "../../utils/formattingUtils";
import { deleteImages } from "@/api/image/image";

const userStore = useUserStore();
const userId = ref<string>();
let middleIdVar = userStore.getId();
if (middleIdVar) {
  userId.value = middleIdVar;
}

const photoPosts = ref<PhotoPostType[]>();
const communityPosts = ref<CommunityPostType[]>();
const itemsPerPage = 5;
const currentPage = ref(1);

const visiblePhotoPosts = computed(() => {
  if (photoPosts.value) {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    return photoPosts.value.slice(start, end);
  }
});

const visibleCommunityPosts = computed(() => {
  if (communityPosts.value) {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return communityPosts.value.slice(start, end);
  }
});

const totalPage = computed(() => {
  if (photoPosts.value) {
    return Math.ceil(photoPosts.value.length / itemsPerPage);
  }
});

enum ActionPageType {
  PhotoPost = "PhotoPost",
  CommunityPost = "CommunityPost",
  EditPhotoPost = "EditPhotoPost",
  EditCommunityPost = "EditCommunityPost",
}

const openPostInNewTab = (actionPage: ActionPageType, postId: string) => {
  const url = router.resolve({
    name: actionPage,
    params: { id: postId },
  }).href;
  window.open(url, "_blank");
};

////刪除留言
const showDialog = ref(false);
const dialogData = ref<DialogType>({
  title: "刪除貼文",
  content: "是否確認刪除該貼文?",
  warringStyle: true,
  cancelButton: true,
});

//彈窗框邏輯
const userChoice = ref<boolean>();

const handleDialog = async () => {
  showDialog.value = true;
  const dialogPromise = new Promise((resolve) => {
    watch(userChoice, () => {
      showDialog.value = false;
      resolve(userChoice.value);
    });
  });
  return dialogPromise;
};

const handleDelete = async (postType: ActionPageType, id: string) => {
  const choice = await handleDialog();
  if (choice) {
    if (postType === ActionPageType.PhotoPost) {
      const deletedPostData = await deletePhotoPost(id);
      let deletedImagesPublicIds = [];
      for (const image of deletedPostData.images) {
        deletedImagesPublicIds.push(image.filename);
      }
      await deleteImages(deletedImagesPublicIds);
    } else if (postType === ActionPageType.CommunityPost) {
      const deletedPostData = await deleteCommunityPost(id);

      let deletedImagesPublicIds = [];
      for (const image of deletedPostData.images) {
        deletedImagesPublicIds.push(image.filename);
      }
      await deleteImages(deletedImagesPublicIds);
    }
  }
  userChoice.value = undefined;
  await fetchPostsData();
};

const fetchPostsData = async () => {
  if (!userId.value) return;
  const photoPostsResponseData = await getPhotoPostsData(userId.value);
  const communityPostsResponseData = await getCommunityPostsData(userId.value);
  if (photoPostsResponseData.value && communityPostsResponseData.value) {
    photoPosts.value = photoPostsResponseData.value;
    communityPosts.value = communityPostsResponseData.value;
  }
};

const changePage = (pageChange: number) => {
  currentPage.value += pageChange;
};

onMounted(async () => {
  await fetchPostsData();
});
const activeTab = ref("photoPosts");
</script>

<template>
  <div class="flex-1 bg-stone-100 py-24">
    <div v-if="photoPosts && communityPosts"
      class="flex-1 px-28 pt-20 pb-10 2xl:w-1/2 mx-auto flex flex-col items-center border-4 border-stone-700 shadow bg-stone-100">
      <h1 class="text-5xl mb-20 font-bold">貼文紀錄</h1>
      <!-- 選項卡 -->
      <div class="flex space-x-4">
        <button @click="activeTab = 'photoPosts'" class="py-2 px-4 cursor-pointer border-2" :class="{
          'bg-stone-700 text-white border-transparent':
            activeTab === 'photoPosts',
          'bg-white border-stone-700': activeTab !== 'photoPosts',
        }">
          照片牆貼文
        </button>
        <button @click="activeTab = 'communityPosts'" class="py-2 px-4 cursor-pointer border-2" :class="{
          'bg-stone-700 text-white border-transparent':
            activeTab === 'communityPosts',
          'bg-white border-stone-700': activeTab !== 'communityPosts',
        }">
          社區頁貼文
        </button>
      </div>

      <!-- 照片牆 -->
      <div v-if="activeTab === 'photoPosts' && visiblePhotoPosts" class="w-full mt-10"
        :class="visiblePhotoPosts.length > 0 ? 'h-[45rem]' : ''">
        <div v-if="visiblePhotoPosts.length > 0" v-for="post in visiblePhotoPosts" :key="post._id"
          class="bg-white text-stone-700 p-4 flex flex-col gap-1 justify-between shadow mb-4 h-32 w-full border-2 border-stone-700">
          <div class="flex justify-between">
            <h2 class="text-xl font-bold truncate">{{ post.title }}</h2>
            <div class="flex gap-4">
              <EyeIcon @click="openPostInNewTab(ActionPageType.PhotoPost, post._id!)"
                class="w-6 cursor-pointer text-blue-900 hover:text-blue-700 transition-all duration-300" />
              <PencilSquareIcon @click="
                openPostInNewTab(ActionPageType.EditPhotoPost, post._id!)
                " class="w-6 cursor-pointer text-blue-700 hover:text-blue-500 transition-all duration-300" />
              <TrashIcon @click="handleDelete(ActionPageType.PhotoPost, post._id!)"
                class="w-6 cursor-pointer text-red-700 hover:text-red-500 transition-all duration-300" />
            </div>
          </div>
          <p class="text-stone-500 truncate">{{ post.description }}</p>
          <div class="flex justify-between gap-2 text-sm text-gray-500">
            <div class="flex gap-2">
              <span class="flex gap-1 items-center text-base text-blue-900">
                <EyeIcon class="w-5" /> {{ post.views }}
              </span>
              <span class="flex gap-1 items-center text-base text-red-700">
                <HeartIcon class="w-5" />{{ post.likes }}
              </span>
              <span class="flex gap-1 items-center text-base text-teal-900">
                <ChatBubbleBottomCenterIcon class="w-5" />
                {{ post.commentsId.length }}
              </span>
            </div>
            <span>
              {{ formatDateTime(post.createdAt!) }}
            </span>
          </div>
        </div>
        <div v-else
          class="bg-white text-stone-700 p-4 shadow mb-4 h-28 w-full border-2 border-stone-400 flex justify-center items-center">
          <p class="text-stone-400 text-xl">尚未發布過任何貼文</p>
        </div>
      </div>

      <!-- 社區 -->
      <div v-if="activeTab === 'communityPosts' && visibleCommunityPosts" class="w-full mt-10"
        :class="visibleCommunityPosts.length > 0 ? 'h-[45rem]' : ''">
        <div v-if="visibleCommunityPosts.length > 0" v-for="post in visibleCommunityPosts" :key="post._id"
          class="bg-white text-stone-700 p-4 flex flex-col gap-1 justify-between shadow mb-4 h-32 w-full border-2 border-stone-700">
          <div class="flex justify-between">
            <h2 class="text-xl font-bold truncate">{{ post.title }}</h2>
            <div class="flex gap-4">
              <EyeIcon @click="
                openPostInNewTab(ActionPageType.CommunityPost, post._id!)
                " class="w-6 cursor-pointer text-blue-900 hover:text-blue-700 transition-all duration-300" />
              <PencilSquareIcon @click="
                openPostInNewTab(ActionPageType.EditCommunityPost, post._id!)
                " class="w-6 cursor-pointer text-blue-700 hover:text-blue-500 transition-all duration-300" />
              <TrashIcon @click="handleDelete(ActionPageType.CommunityPost, post._id!)"
                class="w-6 cursor-pointer text-red-700 hover:text-red-500 transition-all duration-300" />
            </div>
          </div>
          <p class="text-stone-500 truncate">{{ post.content }}</p>
          <div class="flex justify-between gap-2 text-sm text-gray-500">
            <div class="flex gap-2">
              <span class="flex gap-1 items-center text-base text-blue-900">
                <EyeIcon class="w-5" /> {{ post.views }}
              </span>
              <span class="flex gap-1 items-center text-base text-red-700">
                <HeartIcon class="w-5" />{{ post.likes }}
              </span>
              <span class="flex gap-1 items-center text-base text-teal-900">
                <ChatBubbleBottomCenterIcon class="w-5" />
                {{ post.commentsId.length }}
              </span>
            </div>
            <span>
              {{ formatDateTime(post.createdAt!) }}
            </span>
          </div>
        </div>
        <div v-else
          class="bg-white text-stone-700 p-4 shadow mb-4 h-28 w-full border-2 border-stone-400 flex justify-center items-center">
          <p class="text-stone-400 text-xl">尚未發布過任何貼文</p>
        </div>
      </div>

      <!-- 分頁 -->
      <div class="mt-4">
        <button @click="changePage(-1)" :disabled="currentPage === 1"
          class="py-2 px-4 cursor-pointer border-2 border-stone-600">
          上一頁
        </button>
        <span class="mx-2 py-2 px-4 border-2 border-stone-900">{{
          currentPage
          }}</span>
        <button @click="changePage(1)" :disabled="currentPage === totalPage"
          class="py-2 px-4 cursor-pointer border-2 border-stone-600">
          下一頁
        </button>
      </div>
    </div>
    <Transition enter-active-class="transition ease-in duration-150 delay-0" enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150 delay-0"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
      <Dialog v-if="showDialog" :dialogData="dialogData" @closePopup="(choice: boolean) => userChoice = choice" />
    </Transition>
  </div>
</template>
