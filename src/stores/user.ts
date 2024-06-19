import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authLogin, getUser, updateUser } from '@/api/auth/auth'
import type { UserDataType } from '../types'
import router from '../router/index'

export enum LoginStatus {
  Success = '登錄成功',
  EmailError = '信箱錯誤',
  PasswordError = '密碼錯誤'
}

export const useUserStore = defineStore('user', () => {
  const storedUser = localStorage.getItem('user')
  const data = ref<UserDataType | null>()
  if (storedUser) {
    data.value = JSON.parse(storedUser)
  } else {
    data.value = null
  }

  const isLogin = computed<boolean>(() => (data.value ? true : false))
  const loggingStatus = ref<LoginStatus | undefined>()

  async function login(email: string, password: string) {
    try {
      const responseData = await authLogin(email, password)
      console.log(555, responseData)
      if (responseData?.token) {
        loggingStatus.value = LoginStatus.Success
      }
    } catch (err) {
      console.error('getUser取得資料失敗: ', err)
    }
  }

  function logout() {
    localStorage.removeItem('user')
    data.value = null
    router.push({ name: 'Articles' })
  }

  function getData() {
    if (isLogin.value) {
      return data.value
    } else {
      return null
    }
  }

  function getId() {
    if (isLogin.value && data.value) {
      return data.value._id
    } else {
      return null
    }
  }

  async function updateUser(updatedData: UserDataType) {
    try {
      await updateUser(updatedData)
      if (data.value) {
        const responseData = await getUser(data.value.email)
        if (responseData.value) {
          const userData = ref<UserDataType>(responseData.value)
          data.value = userData.value
          localStorage.setItem('user', JSON.stringify(data.value))
        }
      }
    } catch (err) {
      console.error('getUser取得資料失敗: ', err)
    }
  }

  return {
    data,
    isLogin,
    loggingStatus,
    getData,
    getId,
    login,
    logout,
    updateUser
  }
})
