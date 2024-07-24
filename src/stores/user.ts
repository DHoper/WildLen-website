import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authLogin, getCurrentUser, updateUser as updatedUserApi } from '@/api/auth/auth'
import router from '../router/index'
import type { User } from '@/types/User'
import { getCookie, removeCookie, setCookie } from '@/utils/helper'

export enum LoginStatus {
  Success = '登錄成功',
  EmailError = '信箱錯誤',
  PasswordError = '密碼錯誤'
}

export const useUserStore = defineStore('user', () => {
  const isLoginCheck = ref<boolean>(false)
  const user = ref<User | null>(null)

  const isLogin = computed<boolean>(() => !!user.value)
  const loggingStatus = ref<LoginStatus | undefined>()

  const login = async (email: string, password: string) => {
    try {
      const responseData = await authLogin(email, password)
      if (responseData?.token && responseData.user) {
        loggingStatus.value = LoginStatus.Success
        user.value = responseData.user

        setCookie('auth_token', responseData.token, 7)
      }
    } catch (err) {
      console.error('getUser取得資料失敗: ', err)
    }
  }

  const logout = () => {
    removeCookie('auth_token')
    user.value = null
    router.push({ name: 'Articles' })
  }

  const getData = () => {
    return isLogin.value ? user.value : null
  }

  const getId = () => {
    return isLogin.value && user.value ? user.value.id : null
  }

  const updateUser = async (updatedData: User) => {
    try {
      await updatedUserApi(updatedData)
      if (user.value) {
        const storedToken = await getCookie('auth_token')
        const responseData = await getCurrentUser(storedToken)
        if (responseData && responseData?.value) {
          user.value = responseData.value
        }
      }
    } catch (err) {
      console.error('getUser取得資料失敗: ', err)
    }
  }

  const checkLogin = async () => {
    const storedToken = await getCookie('auth_token')

    if (storedToken) {
      try {
        const userData = await getCurrentUser(storedToken)
        if (!userData || !userData?.value) {
          isLoginCheck.value = true
          return
        }
        user.value = userData.value
      } catch (err) {
        console.error('獲取用戶資料失敗: ', err)
      }
    }
    isLoginCheck.value = true
  }

  return {
    isLoginCheck,
    user,
    isLogin,
    loggingStatus,
    getData,
    getId,
    login,
    logout,
    updateUser,
    checkLogin
  }
})
