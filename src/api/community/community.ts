import { apiClient } from '../axiosInstance'
import type { CommunityPostType } from '../../types/index.js'
import { ref } from 'vue'

export const ApiConfig = {
  index: '/communityPost',
  singlePost: (id: string) => `communityPost/${id}`,
  getUserPosts: (authorId: string) => `/communityPost/user/${authorId}`,
  setStats: (id: string, action: string) => `/communityPost/${id}/statistics/${action}`
}

export async function getPostsData() {
  try {
    const responseData = ref<CommunityPostType[]>()

    const response = await apiClient.get(ApiConfig.index)
    responseData.value = response.data

    return responseData
  } catch (error) {
    console.error('獲取所有社區貼文數據時發生錯誤：', error)
    throw error
  }
}

export async function getUserPostsData(authorId: string) {
  try {
    const responseData = ref<CommunityPostType[]>()
    const response = await apiClient.get(ApiConfig.getUserPosts(authorId))
    responseData.value = response.data

    return responseData
  } catch (error) {
    console.error('獲取用戶所有照片牆貼文數據時發生錯誤：', error)
    throw error
  }
}

export async function getPostData(id: string) {
  try {
    const responseData = ref<CommunityPostType>()
    const response = await apiClient.get(ApiConfig.singlePost(id))
    responseData.value = response.data
    return responseData
  } catch (error) {
    console.error('獲取單筆社區貼文數據時發生錯誤：', error)
    throw error
  }
}

export async function setStats(id: string, action: string) {
  try {
    const response = await apiClient.post(ApiConfig.setStats(id, action))
    return response
  } catch (error) {
    console.error('更新貼文統計數數據時發生錯誤：', error)
    throw error
  }
}

export async function createPost(postData: CommunityPostType) {
  try {
    const response = await apiClient.post(ApiConfig.index, postData)
    return response
  } catch (error) {
    console.error('建立新貼文時發生錯誤：', error)
    throw error
  }
}

export async function updatePost(postId: string, postData: CommunityPostType) {
  try {
    const response = await apiClient.put(ApiConfig.singlePost(postId), postData)
    return response
  } catch (error) {
    console.error('更新新貼文時發生錯誤：', error)
    throw error
  }
}

export async function deletePost(id: string) {
  try {
    const response = await apiClient.delete(ApiConfig.singlePost(id))
    return response.data.deletedCommunityPost
  } catch (error) {
    console.error('刪除貼文時發生錯誤：', error)
    throw error
  }
}
