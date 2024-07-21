<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ExclamationCircleIcon } from '@heroicons/vue/24/solid'
import { useUserStore } from '../../stores/user'
import { type FieldName, inputValidator } from '../../utils/validator'
import { getCurrentUser } from '@/api/auth/auth.js'
import Dialog from '@/components/utils/Dialog.vue'
import { topicTags } from '../../fakeData/topicTags.js'
import { getCookie } from '@/utils/helper'
import type { User } from '@/types/User'

const route = useRoute()
const props = defineProps({
  email: {
    type: String,
    require: true
  }
})

//獲取用戶資料
const userStore = useUserStore()
const userData = ref<User>()
const fetchUserData = async () => {
  if (props.email === 'self') {
    const responseData = userStore.getData()
    if (responseData) userData.value = responseData
  } else if (props.email) {
    const storedToken = await getCookie('auth_token')
    const responseData = await getCurrentUser(storedToken)
    userData.value = responseData.value
  }
}

const formData = ref()
const setInputData = () => {
  if (userData.value && userData.value.profile) {
    const { username, email, password, profile, id } = userData.value
    const { selectedTags, selectedAvatarIndex, intro } = profile

    formData.value = {
      username,
      email,
      password,
      passwordConfirm: password,
      selectedTags,
      selectedAvatarIndex,
      intro,
      id
    }
  }
}

const showAvatarSelector = ref<boolean>(false) //頭樣選擇窗

//驗證
const validator = inputValidator()
const formInputInvalid = validator.formInputInvalid
const validateInput = (fieldName: FieldName | 'UserData') => {
  //重新包裝validator
  validator.validate(fieldName, formData.value)
}
const validateEmail = () => {
  if (formData.value.email === userData.value?.email) {
    formInputInvalid.value.email.registered = false
    formInputInvalid.value.email.valid = true
  } else {
    validateInput('email')
  }
}

//提交
const showDialog = ref<boolean>(false)
const dialogData = {
  title: '編輯成功',
  content: '編輯成功，個人資料已更新'
}

const isEditing = ref(false)
const submitEdit = async () => {
  if (isEditing.value && formData.value) {
    validateInput('UserData')
    validateEmail()
    const { username, email, password, selectedTags, selectedAvatarIndex, intro, id } =
      formData.value

    const submitData: User = {
      username,
      email,
      password,
      profile: {
        selectedTags,
        selectedAvatarIndex,
        intro
      },
      id
    }
    await userStore.updateUser(submitData)
    showDialog.value = true
  } else if (!isEditing.value && userData.value) {
    validateInput('UserData')
    validateEmail()
  }
  isEditing.value = !isEditing.value
  window.scrollTo(0, 0)
}
const cancelEdit = () => {
  setInputData()
  isEditing.value = false
  window.scrollTo(0, 0)
}

watch(
  () => route.params.email,
  async (newEmail, oldEmail) => {
    if (newEmail !== oldEmail) {
      await fetchUserData()
      setInputData()
    }
  }
)

onMounted(async () => {
  await fetchUserData()
  setInputData()
})
</script>

<template>
  <div
    v-if="userData && formData"
    class="flex flex-1 items-center justify-center bg-stone-100 py-10"
  >
    <div
      class="flex w-[30rem] flex-col items-center gap-6 border-2 border-stone-700 bg-white p-8 shadow-xl"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="flex size-36 justify-center overflow-hidden border-2 border-stone-700 p-2">
          <img
            :src="`/assets/img/avatar (${formData.selectedAvatarIndex}).png`"
            alt="User Avatar"
            class="object-contain"
          />
        </div>
        <button
          v-if="isEditing"
          @click="showAvatarSelector = true"
          class="bg-stone-600 px-8 py-2 text-stone-100 transition-all duration-300 hover:bg-stone-700"
        >
          選擇頭像
        </button>
      </div>

      <div class="flex w-full flex-col items-center gap-4">
        <div class="relative flex flex-col items-center gap-3">
          <label class="font-bold text-gray-700">暱稱</label>
          <p class="text-lg" v-if="!isEditing">{{ formData.username }}</p>
          <div v-else class="relative">
            <input
              v-model="formData.username"
              @blur="validateInput('username')"
              placeholder="2 ~ 7字"
              class="border-2 p-2 text-lg"
              :class="formInputInvalid.username ? 'border-stone-600' : 'border-red-600'"
            />
            <div
              v-if="!formInputInvalid.username"
              class="absolute -top-5 left-0 flex w-full items-center gap-1 text-xs text-red-500"
            >
              <ExclamationCircleIcon class="w-4" />
              <p>請輸入有效暱稱</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center gap-3">
          <label class="font-bold text-gray-700">信箱</label>
          <p class="text-lg" v-if="!isEditing">{{ formData.email }}</p>
          <div v-else class="relative">
            <input
              v-model="formData.email"
              @blur="validateEmail"
              placeholder="有效信箱"
              class="border-2 p-2 text-lg"
              :class="
                formInputInvalid.email.valid && !formInputInvalid.email.registered
                  ? 'border-stone-600'
                  : 'border-red-600'
              "
            />
            <div
              v-if="!formInputInvalid.email.valid"
              class="absolute -top-5 left-0 flex w-full items-center gap-1 text-xs text-red-500"
            >
              <ExclamationCircleIcon class="w-4" />
              <p>請輸入有效信箱</p>
            </div>
            <div
              v-else-if="formInputInvalid.email.registered"
              class="absolute -top-5 left-0 flex w-full items-center gap-1 text-xs text-red-500"
            >
              <ExclamationCircleIcon class="w-4" />
              <p>此信箱已被註冊</p>
            </div>
          </div>
        </div>

        <div v-if="isEditing" class="flex flex-col items-center gap-4">
          <label class="font-bold text-gray-700">密碼</label>
          <div class="flex flex-col gap-5">
            <div class="relative">
              <input
                type="password"
                v-model="formData.password"
                @blur="validateInput('password')"
                placeholder="6 ~ 15字"
                class="border-2 p-2 text-lg"
                :class="formInputInvalid.password ? 'border-stone-600' : 'border-red-600'"
              />
              <div
                v-if="!formInputInvalid.password"
                class="absolute -top-5 left-0 flex w-full items-center gap-1 text-xs text-red-500"
              >
                <ExclamationCircleIcon class="w-4" />
                <p>請輸入六個字以上的有效密碼</p>
              </div>
            </div>
            <div class="relative">
              <input
                type="password"
                v-model="formData.passwordConfirm"
                @blur="validateInput('passwordConfirm')"
                placeholder="6 ~ 15字"
                class="border-2 p-2 text-lg"
                :class="formInputInvalid.passwordConfirm ? 'border-stone-600' : 'border-red-600'"
              />
              <div
                v-if="!formInputInvalid.passwordConfirm"
                class="absolute -top-5 left-0 flex w-full items-center gap-1 text-xs text-red-500"
              >
                <ExclamationCircleIcon class="w-4" />
                <p>請輸入與上方相同之密碼</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex w-full flex-1 flex-col items-center gap-3">
          <p class="font-bold text-gray-700">感興趣的主題</p>
          <div
            class="flex max-h-40 w-full flex-wrap items-center justify-center gap-2 overflow-auto border-2 border-stone-600 p-2"
          >
            <div v-if="!isEditing" class="flex flex-wrap items-center justify-center gap-2">
              <span
                v-for="(tag, index) in formData.selectedTags"
                :key="index"
                class="border-2 border-stone-700 px-2 py-1"
              >
                {{ tag }}
              </span>
            </div>
            <div
              v-else
              class="flex flex-wrap items-center justify-center gap-2"
              v-for="(topic, index) in topicTags"
              :key="index"
            >
              <label
                v-for="(tag, index) in topic.tags"
                :key="index"
                class="border-2 border-stone-700 px-2 py-1"
                :style="
                  formData.selectedTags.includes(tag)
                    ? `background-color:${topic.color};color:white`
                    : ''
                "
              >
                <input
                  type="checkbox"
                  v-model="formData.selectedTags"
                  :value="tag"
                  class="hidden"
                />
                <span class="cursor-pointer">{{ tag }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="flex w-full flex-col items-center gap-4">
          <label class="font-bold text-gray-700">簡介</label>
          <div
            class="h-40 w-full overflow-auto whitespace-pre-wrap border-2 border-stone-600 p-2"
            v-if="!isEditing"
            :class="formData.intro ? '' : 'text-stone-500 italic'"
          >
            {{ formData.intro || '尚未填寫自介內容' }}
          </div>
          <textarea
            v-else
            v-model="formData.intro"
            placeholder="10 ~ 100字"
            maxlength="100"
            class="h-40 w-full resize-none overflow-auto border-2 border-stone-600 p-2"
          ></textarea>
        </div>
      </div>
      <div class="flex w-full gap-8">
        <button
          v-if="props.email === 'self'"
          @click="submitEdit"
          class="mt-4 flex-1 bg-stone-600 py-2 text-white transition-all duration-300 hover:bg-stone-700"
        >
          {{ isEditing ? '保存' : '編輯' }}
        </button>
        <button
          v-if="isEditing"
          @click="cancelEdit"
          class="mt-4 box-content flex-1 border-2 border-stone-500 py-2 text-stone-600 transition-all duration-300 hover:border-stone-900"
        >
          取消
        </button>
      </div>
    </div>
    <Transition
      name="avatarSelector"
      enter-active-class="animate-slideInRight"
      leave-active-class="animate-slideInRightBack"
    >
      <div
        v-if="showAvatarSelector"
        class="fixed left-0 top-0 flex size-full items-center justify-center bg-stone-700 bg-opacity-60"
      >
        <div
          class="z-10 flex size-full flex-col items-center justify-around gap-4 overflow-auto bg-white px-16 pb-10 pt-4"
        >
          <p class="block text-xl font-bold tracking-widest text-stone-700">選擇頭像</p>
          <div class="grid grid-cols-6 gap-4 p-4">
            <div v-for="index in 12" :key="index">
              <label class="cursor-pointer">
                <input
                  class="hidden"
                  type="radio"
                  :value="index"
                  name="avatar"
                  v-model="formData.selectedAvatarIndex"
                />
                <div
                  class="group border-2 border-dashed border-stone-600 p-1 transition-all duration-300 focus-within:border-solid hover:scale-105 hover:border-solid"
                >
                  <img
                    class="w-12 transition-all duration-300 focus:scale-110 sm:w-16 md:w-20 lg:w-32"
                    :src="`/assets/img/avatar (${index}).png`"
                    alt=""
                    tabindex="0"
                  />
                </div>
              </label>
            </div>
          </div>
          <button
            @click="showAvatarSelector = false"
            class="w-full bg-stone-600 px-4 py-3 font-bold tracking-widest text-white transition-all duration-500 hover:bg-stone-700 focus:outline-none"
          >
            完成
          </button>
        </div>
      </div>
    </Transition>
  </div>
  <Transition
    enter-active-class="transition ease-in duration-150 delay-0"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-150 delay-0"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-1"
  >
    <Dialog v-if="showDialog" :dialogData="dialogData" @closePopup="showDialog = false" />
  </Transition>
</template>
