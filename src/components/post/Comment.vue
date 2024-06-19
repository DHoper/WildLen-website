<script setup lang="ts">
import { onMounted, ref, watch, watchEffect } from "vue";
import { TrashIcon } from "@heroicons/vue/24/outline";
import {
  CommentType,
  AuthorDataType,
  UserDataType,
  DialogType,
} from "../../types/index.js";
import { useUserStore } from "../../stores/user.ts";
import { formatDateTime } from "../../utils/formattingUtils.ts";
import { getAuthor } from "@/api/auth/auth.ts";

const userStore = useUserStore();
const props = defineProps({
  postId: {
    type: String,
    required: true,
  },
  commentsData: {
    type: Array as () => CommentType[],
    required: true,
  },
});
const emit = defineEmits(["postComment", "deleteComment", "reloadComment"]);

const isLogin = ref<boolean>(userStore.isLogin);
const userId = ref<string>();
let middleIdVar = userStore.getId();
if (middleIdVar) {
  userId.value = middleIdVar;
}

const commentsData = ref<CommentType[]>();
const authorData = ref<AuthorDataType[]>([]);

const fetchAuthorData = async () => {
  if (commentsData.value) {
    let authorList: AuthorDataType[] = [];
    for (const comment of commentsData.value) {
      const authorResponseData = await getAuthor(comment.authorId);
      if (authorResponseData.value) {
        authorList.push(authorResponseData.value);
      }
    }
    authorData.value = authorList;
  }
};
//輸入框樣式偵測
const commentPost = ref("");
const commentSubmitButton = ref();

watchEffect(() => {
  if (commentSubmitButton.value) {
    const trimmedComment = commentPost.value.trim();

    if (trimmedComment) {
      commentSubmitButton.value.classList.toggle("bg-green-600", true);
      commentSubmitButton.value.classList.toggle("bg-gray-300", false);
    } else {
      commentSubmitButton.value.classList.toggle("bg-green-600", false);
      commentSubmitButton.value.classList.toggle("bg-gray-300", true);
    }
  }
});

async function handleCommentSubmit() {
  const userData: UserDataType = userStore.getData()!;

  if (commentPost.value) {
    const submitData: CommentType = {
      authorId: userData._id,
      postId: props.postId,
      content: commentPost.value,
    };

    emit("postComment", submitData);
    commentPost.value = "";
  }
}

////刪除留言
const showDialog = ref(false);
const dialogData = ref<DialogType>({
  title: "刪除評論",
  content: "是否確認刪除該評論?",
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

async function handleDeleteComment(commentId: string) {
  const choice = await handleDialog();
  if (choice) {
    emit("deleteComment", commentId);
  }
  userChoice.value = undefined;
}

watch(
  () => props.commentsData,
  async () => {
    if (props.commentsData) {
      commentsData.value = props.commentsData;
    }
    await fetchAuthorData();
  }
);

onMounted(async () => {
  if (props.commentsData) {
    commentsData.value = props.commentsData;
  }
  await fetchAuthorData();
});
</script>

<template>
  <div class="w-full border-2 border-stone-800 bg-white py-10 px-8 2xl:px-24 2xl:py-20 overflow-auto">
    <span class="font-bold text-stone-600 tracking-widest 2xl:text-xl">留言區</span>
    <div class="border-b-[.0938rem] 2xl:border-b-2 border-stone-300 my-4"></div>
    <form method="POST" @submit.prevent="handleCommentSubmit">
      <div class="mt-10 mb-4 border-2 border-stone-600 p-4 2xl:p-8 2xl:text-lg">
        <textarea v-model="commentPost" name="" id="" cols="20" rows="3" placeholder="輸入留言..." maxlength="50"
          class="w-full border-none outline-none resize-none bg-transparent p-0 m-0 text-current" />
      </div>
      <div class="flex justify-end gap-4 2xl:gap-6">
        <button type="button" @click="commentPost = ''"
          class="text-green-400 px-5 py-2 2xl:text-lg hover:text-green-600">
          取消
        </button>
        <button ref="commentSubmitButton" type="submit"
          class="text-white bg-gray-300 px-5 py-2 2xl:text-lg transition-all">
          送出
        </button>
      </div>
    </form>
    <ul v-if="commentsData && authorData.length > 0" class="mt-8">
      <li v-for="(comment, index) in commentsData">
        <div v-if="authorData[index]">
          <div class="flex items-center gap-4">
            <router-link :to="{
              name: 'PersonalInfo',
              params: { email: authorData[index].email },
            }">
              <div class="flex items-center gap-2">
                <div
                  class="border border-stone-800 rounded-full bg-white w-10 h-10 2xl:w-12 2xl:h-12 p-1 flex items-center justify-center overflow-hidden">
                  <img :src="`/assets/img/avatar (${authorData[index].selectedAvatarIndex}).png`" alt="avatar" />
                </div>
                <span class="2xl:text-lg text-stone-700 font-bold">
                  {{ authorData[index].username }}
                </span>
              </div>
            </router-link>
            <div class="flex gap-2 items-baseline justify-start flex-1">
              <span class="text-sm 2xl:text-base text-stone-500 text-center">{{ formatDateTime(comment.createdAt!,
                "concise") }}
              </span>
              <TrashIcon v-if="isLogin && userId === comment.authorId" @click="handleDeleteComment(comment._id!)"
                class="w-6 cursor-pointer text-red-700 ml-auto" />
            </div>
          </div>
          <div>
            <p class="mt-10 text-stone-700 2xl:text-lg whitespace-pre-wrap overflow-auto">
              {{ comment.content }}
            </p>
          </div>
          <div class="border-b-[.0938rem] 2xl:border-b-2 border-gray-300 my-4"></div>
        </div>
      </li>
    </ul>
    <div v-else class="border-b-2 2xl:text-lg 2xl:border-b-2 border-gray-300 mt-10 text-center text-gray-400 py-1">
      尚未有留言
    </div>
    <Transition enter-active-class="transition ease-in duration-150 delay-0" enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150 delay-0"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
      <Dialog v-if="showDialog" :dialogData="dialogData" @closePopup="(choice: boolean) => userChoice = choice" />
    </Transition>
  </div>
</template>
