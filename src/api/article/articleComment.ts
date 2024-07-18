import { ref } from 'vue'
import { apiClient } from '../axiosClient'
import type { PostComment } from '@/types/Common'

export const ApiConfig = {
  byArticleId: (articleId: number) => `/article/comments/${articleId}`,
  byCommentId: (id: number) => `/article/comment/${id}`,
}

export async function getComments(articleId: number) {
  try {
    const responseData = ref<PostComment[]>()
    const response = await apiClient.get(ApiConfig.byArticleId(articleId))
    responseData.value = response.data
    return responseData
  } catch (error) {
    console.error('獲取所有評論失敗，出現錯誤:', error)
    throw error
  }
}

export async function createComment(articleId: number, commentData: { authorId: number, content: String }) {
  try {
    const response = await apiClient.post(ApiConfig.byArticleId(articleId), commentData)
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
