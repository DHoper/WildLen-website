import type { PhotoPost } from '@/types/Post';
import { apiClient } from '../axiosClient';
import { ref } from 'vue';

export const apiConfig = {
  index: '/photoPost',
  singlePost: (id: number) => `/photoPost/${id}`,
  getUserPosts: (userId: number) => `/photoPost/user/${userId}`,
  setStats: (id: number, action: string) => `/photoPost/${id}/statistics/${action}`
};

export async function getAllPosts() {
  try {
    const responseData = ref<PhotoPost[]>();
    const response = await apiClient.get(apiConfig.index);
    responseData.value = response.data;
    return responseData;
  } catch (error) {
    console.error('獲取所有照片牆貼文數據時發生錯誤：', error);
    throw error;
  }
}

export async function getUserPostsData(authorId: number) {
  try {
    const responseData = ref<PhotoPost[]>();
    const response = await apiClient.get(apiConfig.getUserPosts(authorId));
    responseData.value = response.data;
    return responseData;
  } catch (error) {
    console.error('獲取用戶所有照片牆貼文數據時發生錯誤：', error);
    throw error;
  }
}

export async function getPost(id: number) {
  try {
    const responseData = ref<PhotoPost>();
    const response = await apiClient.get(apiConfig.singlePost(id));
    responseData.value = response.data;
    return responseData;
  } catch (error) {
    console.error('獲取單筆照片牆貼文數據時發生錯誤：', error);
    throw error;
  }
}

export async function setStats(id: number, action: "view" | "like" | "unlike") {
  try {
    const response = await apiClient.put(apiConfig.setStats(id, action));
    return response;
  } catch (error) {
    console.error('更新貼文統計數數據時發生錯誤：', error);
    throw error;
  }
}

export async function createPost(postData: PhotoPost) {
  try {
    const response = await apiClient.post(apiConfig.index, postData);
    return response;
  } catch (error) {
    console.error('建立新貼文時發生錯誤：', error);
    throw error;
  }
}

export async function updatePost(postId: number, postData: PhotoPost) {
  try {
    const response = await apiClient.put(apiConfig.singlePost(postId), postData);
    return response;
  } catch (error) {
    console.error('更新新貼文時發生錯誤：', error);
    throw error;
  }
}

export async function deletePost(id: number) {
  try {
    const response = await apiClient.delete(apiConfig.singlePost(id));
    return response.data.deletedPhotoPost;
  } catch (error) {
    console.error('刪除貼文時發生錯誤：', error);
    throw error;
  }
}
