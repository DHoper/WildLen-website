<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { ExclamationCircleIcon } from "@heroicons/vue/24/solid";
import CreatePostPreview from "./CreatePostPreview.vue";
import { createPost } from "@/api/community/community.js";
import { useUserStore } from "../../stores/user";
import type { CommunityPostType, PhotoPostImageType } from "@/types";
import { useLoadingStore } from "../../stores/loading";
import { type FieldName, inputValidator } from "../../utils/validator";
import { postImages } from "@/api/image/image";
import { topicTags } from "../../fakeData/topicTags.js";

const router = useRouter();
const userStore = useUserStore();
const loadingStore = useLoadingStore();

const formData = ref({
  title: "",
  images: [] as PhotoPostImageType[],
  content: "",
  views: 0,
  likes: 0,
  authorId: userStore.getId()!,
  topicTags: [] as string[],
  commentsId: [],
  isEdit: false,
});
const submitData = ref<CommunityPostType>();

const isMaxSelected = computed(() => {
  //限制tag最多選五
  return formData.value.topicTags.length >= 5;
});
const inPreview = ref<boolean>(false);

//驗證器
const validator = inputValidator();
const formInputInvalid = validator.formInputInvalid;
const validateInput = (fieldName: FieldName | "UserData") => {
  //重新包裝validator
  validator.validate(fieldName, formData.value);
};

//預覽驗證
const previewAble = computed(
  () =>
    formData.value.topicTags.length > 0 &&
    formInputInvalid.value.title &&
    formInputInvalid.value.content &&
    formData.value.title &&
    formData.value.content
);
const handelPreview = () => {
  if (previewAble.value) {
    inPreview.value = true;
  }
};

//圖片處裡
const imgInput = ref<HTMLInputElement>();
const files = ref<File[]>([])

const setFileUrl = () => {
  formData.value.images = [];
  if (imgInput.value && imgInput.value.files) {
    const selectedFiles = Array.from(imgInput.value.files);
    files.value = Array.from(imgInput.value.files);
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    for (const url of urls) {
      formData.value.images.push({ url, filename: "previewFile" });
    }
  }
};

let createPostImages: PhotoPostImageType[] = []; //儲存最終提交之圖片url
const uploadImages = async () => {
  const inputElement = imgInput.value;

  if (inputElement) {
    const files = inputElement.files as FileList;

    createPostImages = await postImages(files, "Community");
  }
};

const handelSubmit = async () => {
  loadingStore.setLoadingStatus(true);
  loadingStore.setInRequest(true);
  loadingStore.setIsCountingSeconds(true);
  loadingStore.setIsCountingSeconds(false);
  await uploadImages();

  const {
    title,
    content,
    views,
    likes,
    topicTags,
    authorId,
    commentsId,
    isEdit,
  } = formData.value;

  submitData.value = {
    title,
    images: createPostImages,
    content,
    views,
    likes,
    topicTags,
    authorId,
    commentsId,
    isEdit,
  };
  await createPost(submitData.value);
  loadingStore.setInRequest(false);
  loadingStore.setLoadingStatus(false);
  router.push({ name: "Community" });
};
</script>

<template>
  <div class="relative flex-1">
    <div class="bg-white w-full py-12 px-4">
      <div class="mx-auto flex flex-col bg-white w-[62rem] max-w-full px-5">
        <button @click="router.back()" class="self-start text-sm 2xl:text-lg font-bold text-stone-800">
          上一頁
        </button>
        <div class="mt-12 border-2 border-stone-800 px-24 py-16">
          <h1 class="my-8 text-4xl text-stone-600">發佈新貼文</h1>
          <form class="mt-4 flex flex-col gap-4 2xl:gap-12">
            <div class="relative">
              <label for="title" class="text-stone-600 font-bold text-sm 2xl:text-lg">標題</label>
              <input v-model="formData.title" type="text" id="title" name="title" placeholder="3 ~ 40字"
                @blur="validateInput('title')" class="mt-2 w-full border-2 py-2 px-3 outline-none" :class="formInputInvalid.title ? 'border-stone-800' : 'border-red-700'
                  " required />
              <div v-if="!formInputInvalid.title"
                class="w-full absolute left-0 bottom-0 2xl:-bottom-1 translate-y-full flex items-center gap-1 text-xs 2xl:text-base text-red-500">
                <ExclamationCircleIcon class="w-4 2xl:w-6" />
                <p>請輸入3 ~ 40字有效標題</p>
              </div>
            </div>
            <div>
              <label for="img" class="text-stone-600 font-bold text-sm 2xl:text-lg">圖片(可選)</label>
              <div class="flex items-center mt-4 gap-4">
                <label for="imgUpload"
                  class="border-2 border-stone-500 bg-stone-500 text-white hover:bg-white hover:text-stone-500 font-bold py-2 px-4 cursor-pointer text-sm 2xl:text-lg">
                  選擇檔案
                </label>
                <input ref="imgInput" id="imgUpload" name="imgUpload" type="file" class="hidden" @change="setFileUrl"
                  multiple />
                <div v-if="files" class="truncate w-40 flex gap-2 border-b-2 border-stone-600">
                  <p v-for="file in files" class="truncate">
                    {{ file.name }}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label for="img" class="text-stone-600 font-bold text-sm 2xl:text-lg">貼文主題(最多五項)</label>
              <div class="mt-4 border-2 border-stone-700 p-2 overflow-auto max-h-48">
                <div class="flex gap-2 items-center justify-center flex-wrap" v-for="topic in topicTags">
                  <div class="mt-4 flex flex-wrap gap-2 justify-center">
                    <label v-for="tag in topic.tags" :key="tag" class="border-2 border-stone-700 px-2 py-1" :style="formData.topicTags.includes(tag)
                      ? `background-color:${topic.color};color:white`
                      : ''
                      ">
                      <input type="checkbox" v-model="formData.topicTags" :value="tag" class="hidden" :disabled="isMaxSelected && !formData.topicTags.includes(tag)
                        " />
                      <span class="cursor-pointer">{{ tag }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="relative">
              <label for="content" class="text-stone-600 font-bold text-sm 2xl:text-lg">貼文内容</label>
              <textarea v-model="formData.content" id="content" name="content" cols="20" rows="10" maxlength="2000"
                placeholder="10 ~ 2000字" @blur="validateInput('content')"
                class="mt-2 mb-0 w-full border-2 border-stone-800 py-2 px-3 2xl:p-6 2xl:text-lg outline-none resize-none"
                :class="formInputInvalid.content
                  ? 'border-stone-800'
                  : 'border-red-700'
                  " required />
              <div v-if="!formInputInvalid.content"
                class="w-full absolute left-0 bottom-1 translate-y-full flex items-center gap-1 text-xs 2xl:text-base text-red-500">
                <ExclamationCircleIcon class="w-4 2xl:w-6" />
                <p>請輸入10 ~ 2000字有效內容</p>
              </div>
            </div>
            <div class="mt-8 flex justify-between">
              <button @click="handelPreview" type="button" :disabled="!previewAble"
                class="text-white border-2 border-transparent px-8 py-2 transition-all duration-300" :class="previewAble
                  ? 'bg-blue-900 hover:bg-white hover:text-blue-900 hover:border-blue-900'
                  : 'bg-stone-600'
                  ">
                預覽
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <Transition name="previewPost" enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-300" leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1">
      <CreatePostPreview v-if="inPreview" :data="formData" @close="inPreview = false" @submit="handelSubmit" />
    </Transition>
  </div>
</template>
@/api/community/community
