import type { CommunityPost } from '@/types/Post'
import { apiClient } from '../axiosClient'
import { ref } from 'vue'

export const ApiConfig = {
  index: '/communityPost',
  singlePost: (id: number) => `communityPost/${id}`,
  getUserPosts: (authorId: number) => `/communityPost/user/${authorId}`,
  setStats: (id: number, action: string) => `/communityPost/${id}/statistics/${action}`
}

export async function getPosts(startFromLast: number = 0) {
  try {
    const responseData = ref<{ posts: CommunityPost[], totalCount: number }>()

    const response = await apiClient.get(ApiConfig.index + `/all/${startFromLast}`)
    responseData.value = response.data

    return responseData
  } catch (error) {
    console.error('獲取所有社區貼文數據時發生錯誤：', error)
    throw error
  }
}

export async function getUserPostsData(authorId: number) {
  try {
    const responseData = ref<CommunityPost[]>()
    const response = await apiClient.get(ApiConfig.getUserPosts(authorId))
    responseData.value = response.data

    return responseData
  } catch (error) {
    console.error('獲取用戶所有照片牆貼文數據時發生錯誤：', error)
    throw error
  }
}

export async function getPost(id: number) {
  try {
    const responseData = ref<CommunityPost>()
    const response = await apiClient.get(ApiConfig.singlePost(id))
    responseData.value = response.data
    return responseData
  } catch (error) {
    console.error('獲取單筆社區貼文數據時發生錯誤：', error)
    throw error
  }
}

export async function setStats(id: number, action: string) {
  try {
    const response = await apiClient.put(ApiConfig.setStats(id, action))
    return response
  } catch (error) {
    console.error('更新貼文統計數數據時發生錯誤：', error)
    throw error
  }
}

export async function createPost(postData: CommunityPost) {
  try {
    const response = await apiClient.post(ApiConfig.index, postData)
    return response
  } catch (error) {
    console.error('建立新貼文時發生錯誤：', error)
    throw error
  }
}

export async function updatePost(postId: number, postData: CommunityPost) {
  try {
    const response = await apiClient.put(ApiConfig.singlePost(postId), postData)
    return response
  } catch (error) {
    console.error('更新新貼文時發生錯誤：', error)
    throw error
  }
}

export async function deletePost(id: number) {
  try {
    const response = await apiClient.delete(ApiConfig.singlePost(id))
    return response.data.deletedCommunityPost
  } catch (error) {
    console.error('刪除貼文時發生錯誤：', error)
    throw error
  }
}
