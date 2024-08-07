import { ref } from 'vue'
import { apiClient } from '../axiosClient'
import type { PostComment } from '@/types/Common'

export const ApiConfig = {
  byPostId: (postId: number) => `/photoPost/comments/${postId}`,
  byCommentId: (id: number) => `/photoPost/comment/${id}`,
}

export async function getComments(postId: number) {
  try {
    const responseData = ref<PostComment[]>()
    const response = await apiClient.get(ApiConfig.byPostId(postId))
    responseData.value = response.data
    return responseData
  } catch (error) {
    console.error('獲取所有評論失敗，出現錯誤:', error)
    throw error
  }
}

export async function createComment(postId: number, commentData: { authorId: number, content: String }) {
  try {
    const response = await apiClient.post(ApiConfig.byPostId(postId), commentData)
    return response
  } catch (error) {
    console.error('發布評論失敗，出現錯誤:', error)
    throw error
  }
}

export async function deleteComment(id: number) {
  try {
    const response = await apiClient.delete(ApiConfig.byCommentId(id))
    return response
  } catch (error) {
    console.error('刪除評論失敗，出現錯誤:', error)
    throw error
  }
}
