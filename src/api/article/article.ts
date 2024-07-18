import type { AxiosResponse } from 'axios'
import { apiClient } from '../axiosClient'
import type { Article, CreateCommentData } from '@/types/Article'
import { ref } from 'vue'

export const ApiConfig = {
  index: '/article',
  byId: (id: number) => `/article/${id}`,
  comments: (articleId: number) => `/article/${articleId}/comments`,
  incrementViews: (id: number) => `/article/${id}/views`,
  incrementLikes: (id: number) => `/article/${id}/likes/increment`,
  decrementLikes: (id: number) => `/article/${id}/likes/decrement`
}

export const getAllArticles = async () => {
  try {
    const responseData = ref<Article[]>()
    const response = await apiClient.get(ApiConfig.index)

    responseData.value = response.data.articles

    return responseData
  } catch (error) {
    console.error('獲取所有文章時發生錯誤：', error)
    throw error
  }
}

export const getArticle = async (id: number) => {
  try {
    const responseData = ref<Article>()
    const response = await apiClient.get(ApiConfig.byId(id))
    responseData.value = response.data.article

    return responseData
  } catch (error) {
    console.error('獲取文章時發生錯誤：', error)
    throw error
  }
}

export const incrementArticleViews = async (id: number) => {
  try {
    return await apiClient.put(ApiConfig.incrementViews(id))
  } catch (error) {
    console.error('增加文章瀏覽次數時發生錯誤：', error)
    throw error
  }
}

export const incrementArticleLikes = async (id: number) => {
  try {
    return await apiClient.put(ApiConfig.incrementLikes(id))
  } catch (error) {
    console.error('增加文章點讚次數時發生錯誤：', error)
    throw error
  }
}

export const decrementArticleLikes = async (id: number) => {
  try {
    return await apiClient.put(ApiConfig.decrementLikes(id))
  } catch (error) {
    console.error('減少文章點讚次數時發生錯誤：', error)
    throw error
  }
}
