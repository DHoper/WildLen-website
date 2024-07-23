import { ref } from 'vue'
import type { User } from '@/types/User'
import { apiClient } from '../axiosClient'

export const ApiConfig = {
  index: '/auth/user',
  bySingleId: (userId: number) => `/auth/user/${userId}`,
  checkEmail: (email: string) => `/auth/user/checkEmail/${email}`,
}

export async function authLogin(email: string, password: string) {
  try {
    const response = await apiClient.post(ApiConfig.index + '/login', { email, password })
    return response.data
  } catch (error) {
    console.error('登陸時發生錯誤:', error)
    throw error
  }
}

export async function checkRepeatEmail(email: string) {
  try {
    const response = await apiClient.get(ApiConfig.checkEmail(email))
    console.log(response.data)

    const checkResult = response.data.exists

    return checkResult
  } catch (error) {
    console.error('檢查信箱時發生錯誤:', error)
    throw error
  }
}

export async function getCurrentUser(token: string | undefined) {
  try {
    const responseData = ref<User>()
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    const response = await apiClient.get(ApiConfig.index, { headers })

    if (response.data.user) {
      responseData.value = response.data.user
      return responseData
    } else {
      return false
    }
  } catch (error) {
    console.error('獲取使用者資料時發生錯誤:', error)
    throw error
  }
}

export async function getUserById(userId: number) {
  try {
    const responseData = ref<User>()
    const response = await apiClient.get(ApiConfig.bySingleId(userId))

    responseData.value = response.data.user

    if (response.status === 200) {
      return responseData
    } else {
      throw new Error(`API請求失敗，錯誤狀態:${response.status}`)
    }
  } catch (error) {
    console.error('獲取特定用戶資料時發生錯誤:', error)
    throw error
  }
}

export async function registerUser(postData: object) {
  try {
    const response = await apiClient.post(ApiConfig.index, postData)
    return response
  } catch (error) {
    console.error('註冊新用戶資料時發生錯誤:', error)
    throw error
  }
}

export async function updateUser(updatedData: User) {
  try {
    
    const response = await apiClient.put(ApiConfig.index, updatedData)
    return response
  } catch (error) {
    console.error('更新用戶資料時發生錯誤:', error)
    throw error
  }
}
