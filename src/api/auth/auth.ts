import { ref } from 'vue'
import type { AuthorDataType, UserDataType } from '@/types'
import { apiClient } from '../axiosInstance'

export const ApiConfig = {
  index: '/auth/user',
  getUser: (email: string) => `/auth/user/${email}`,
  checkEmail: (email: string) => `/auth/user/checkEmail/${email}`,
  getAuthor: (authorId: string) => `/auth/author/${authorId}`
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

export async function getUser(email: string) {
  try {
    const responseData = ref<UserDataType>()
    const response = await apiClient.get(ApiConfig.getUser(email))
    responseData.value = response.data

    return responseData
  } catch (error) {
    console.error('獲取使用者資料時發生錯誤:', error)
    throw error
  }
}

export async function getAuthor(authorId: string) {
  try {
    const responseData = ref<AuthorDataType>()
    const response = await apiClient.get(ApiConfig.getAuthor(authorId))
    responseData.value = response.data

    if (response.status === 200) {
      return responseData
    } else {
      throw new Error('API請求失敗，錯誤狀態:' + response.status)
    }
  } catch (error) {
    console.error('獲取作者資料時發生錯誤:', error)
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

export async function updateUser(updatedData: UserDataType) {
  try {
    const response = await apiClient.put(ApiConfig.index, updatedData)
    return response
  } catch (error) {
    throw error
  }
}
