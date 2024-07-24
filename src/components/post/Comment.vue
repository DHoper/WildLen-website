<script setup lang="ts">
import { onMounted, ref, watch, watchEffect } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import { useUserStore } from '../../stores/user'
import { formatDateTime } from '../../utils/formator.js'
import { getUserById } from '@/api/auth/auth'
import type { User } from '@/types/User.js'
import type { Dialog, PostComment } from '@/types/Common.js'
import DialogComponent from '../utils/Dialog.vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const user = userStore.getData()
const router = useRouter()
const props = defineProps({
  postId: {
    type: Number,
    required: true
  },
  commentsData: {
    type: Array as () => PostComment[],
    required: true
  }
})
const emit = defineEmits(['createComment', 'deleteComment', 'reloadComment'])

const isLogin = ref<boolean>(userStore.isLogin)
const userId = ref<number>()
let middleIdVar = userStore.getId()
if (middleIdVar) {
  userId.value = middleIdVar
}

const comments = ref<PostComment[]>()
const authors = ref<User[]>([])

const fetchAuthorData = async () => {
  if (comments.value) {
    let authorList: User[] = []
    for (const comment of comments.value) {
      const authorResponseData = await getUserById(comment.authorId!)
      if (authorResponseData.value) {
        authorList.push(authorResponseData.value)
      }
    }
    authors.value = authorList
  }
}
//輸入框樣式偵測
const commentPost = ref('')
const commentSubmitButton = ref()

watchEffect(() => {
  if (commentSubmitButton.value) {
    const trimmedComment = commentPost.value.trim()

    if (trimmedComment) {
      commentSubmitButton.value.classList.toggle('bg-green-600', true)
      commentSubmitButton.value.classList.toggle('bg-gray-300', false)
    } else {
      commentSubmitButton.value.classList.toggle('bg-green-600', false)
      commentSubmitButton.value.classList.toggle('bg-gray-300', true)
    }
  }
})

async function handleCommentSubmit() {
  if (!user) {
    router.push({ name: 'Login' })
    return
  }

  if (commentPost.value) {
    const submitData: PostComment = {
      authorId: user.id,
      postId: props.postId,
      content: commentPost.value
    }

    emit('createComment', submitData)
    commentPost.value = ''
  }
}

////刪除留言
const showDialog = ref(false)
const dialogData = ref<Dialog>({
  title: '刪除評論',
  content: '是否確認刪除該評論?',
  warringStyle: true,
  cancelButton: true
})

//彈窗框邏輯
const userChoice = ref<boolean>()

const handleDialog = async () => {
  showDialog.value = true
  const dialogPromise = new Promise((resolve) => {
    watch(userChoice, () => {
      showDialog.value = false
      resolve(userChoice.value)
    })
  })
  return dialogPromise
}

async function handleDeleteComment(commentId: number) {
  const choice = await handleDialog()
  if (choice) {
    emit('deleteComment', commentId)
  }
  userChoice.value = undefined
}

watch(
  () => props.commentsData,
  async () => {
    if (props.commentsData) {
      comments.value = props.commentsData
    }
    await fetchAuthorData()
  }
)

onMounted(async () => {
  if (props.commentsData) {
    comments.value = props.commentsData
  }
  await fetchAuthorData()
})
</script>

<template>
  <div
    class="w-full overflow-y-auto border-2 border-stone-800 bg-white px-8 py-10 2xl:px-24 2xl:py-20"
  >
    <span class="font-bold tracking-widest text-stone-700 2xl:text-xl">留言區</span>
    <div class="my-4 border-b-[.0938rem] border-stone-700 2xl:border-b-2"></div>
    <form method="POST" @submit.prevent="handleCommentSubmit">
      <div class="mb-4 mt-10 border-2 border-stone-600 p-4 2xl:p-8 2xl:text-lg">
        <textarea
          v-model="commentPost"
          name=""
          id=""
          cols="20"
          rows="3"
          placeholder="輸入留言..."
          maxlength="50"
          class="m-0 w-full resize-none border-none bg-transparent p-0 text-current outline-none"
        />
      </div>
      <div class="flex justify-end gap-4 2xl:gap-6">
        <button
          type="button"
          @click="commentPost = ''"
          class="px-5 py-2 text-green-400 hover:text-green-600 2xl:text-lg"
        >
          取消
        </button>
        <button
          ref="commentSubmitButton"
          type="submit"
          class="bg-gray-300 px-5 py-2 text-white transition-all 2xl:text-lg"
        >
          送出
        </button>
      </div>
    </form>
    <ul v-if="commentsData && authors.length > 0" class="mt-12">
      <li v-for="(comment, index) in commentsData" :key="index">
        <div v-if="authors[index]">
          <div class="flex items-center justify-between gap-4">
            <router-link
              :to="{
                name: 'PersonalInfo',
                params: { email: authors[index].email }
              }"
            >
              <div class="flex items-center gap-2">
                <div
                  class="flex size-10 items-center justify-center overflow-hidden rounded-full border border-stone-800 bg-white p-1 2xl:size-12"
                >
                  <img
                    :src="`/assets/img/avatar (${authors[index].profile!.selectedAvatarIndex}).png`"
                    alt="avatar"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="font-bold text-stone-700 2xl:text-lg">
                    {{ authors[index].username }}
                  </span>
                  <span class="text-center text-sm text-stone-500 2xl:text-base" e
                    >{{ formatDateTime(comment.createdAt!, 'concise') }}
                  </span>
                </div>
              </div>
            </router-link>
            <TrashIcon
              v-if="isLogin && userId === comment.authorId"
              @click="handleDeleteComment(comment.id!)"
              class="w-6 cursor-pointer text-red-700"
            />
          </div>
          <div>
            <p class="mt-10 overflow-auto whitespace-pre-wrap pl-2 text-stone-700 2xl:text-lg">
              {{ comment.content }}
            </p>
          </div>
          <div class="my-4 border-b-[.0938rem] border-gray-300 2xl:border-b-2"></div>
        </div>
      </li>
    </ul>
    <div
      v-else
      class="my-12 border-b-2 border-gray-300 py-1 text-center text-gray-400 2xl:border-b-2 2xl:text-lg"
    >
      尚未有留言
    </div>
    <Transition
      enter-active-class="transition ease-in duration-150 delay-0"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150 delay-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <DialogComponent
        v-if="showDialog"
        :dialogData="dialogData"
        @closePopup="(choice: boolean) => (userChoice = choice)"
      />
    </Transition>
  </div>
</template>
