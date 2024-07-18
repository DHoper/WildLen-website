import type { Vote } from '@/types/Vote'
import { apiClient } from '../axiosClient'
import { ref } from 'vue'

// API 配置
export const ApiConfig = {
    createVote: '/vote',
    getAllVotes: '/vote',
    byId: (id: number) => `/vote/${id}`,
    getUserVotes: (userId: number) => `/vote/user/${userId}`,
    deleteVote: (id: number) => `/vote/${id}`,
}

// 建立投票
export async function createVote(voteData: Vote) {
    try {
        const response = await apiClient.post(ApiConfig.createVote, voteData)
        return response.data
    } catch (error) {
        console.error('建立新投票時發生錯誤：', error)
        throw error
    }
}

// 參與投票
export async function participateInVote(voteId: number, userId: number, voteOptionId: number) {
    try {
        const response = await apiClient.post(ApiConfig.byId(voteId) + "/participateIn", {
            userId,
            voteOptionId,
        })
        return response.data
    } catch (error) {
        console.error('參與投票時發生錯誤：', error)
        throw error
    }
}

export async function checkUserVoted(voteId: number, userId: number) {
    try {
        const response = await apiClient.get(ApiConfig.byId(voteId) + `/checkUserVoted/${userId}`)
        return response.data
    } catch (error) {
        console.error('查詢用戶投票狀況時發生錯誤：', error)
        throw error
    }
}

// 獲取所有投票
export async function getAllVotes(userId?: number | null) {
    try {
        const responseData = ref<Vote[]>([]);
        const response = await apiClient.get(ApiConfig.getAllVotes, {
            params: {
                userId: userId || undefined, 
            },
        });
        responseData.value = response.data;
        return responseData;
    } catch (error) {
        console.error('獲取所有投票數據時發生錯誤：', error);
        throw error;
    }
}

// 獲取單個投票
export async function getVoteById(id: number) {
    try {
        const responseData = ref<Vote>();
        const response = await apiClient.get(ApiConfig.byId(id));
        responseData.value = response.data;
        return responseData;
    } catch (error) {
        console.error('獲取單筆投票數據時發生錯誤：', error);
        throw error;
    }
}

// 獲取用戶創建的投票
export async function getUserCreatedVotes(userId: number) {
    try {
        const responseData = ref<Vote[]>([]);
        const response = await apiClient.get(ApiConfig.getUserVotes(userId));
        responseData.value = response.data;
        return responseData;
    } catch (error) {
        console.error('獲取用戶創建的投票數據時發生錯誤：', error);
        throw error;
    }
}

// 獲取用戶參與的投票
export async function getUserVotedVotes(userId: number) {
    try {
        const responseData = ref<Vote[]>([]);
        const response = await apiClient.get(ApiConfig.getUserVotes(userId));
        responseData.value = response.data;
        return responseData;
    } catch (error) {
        console.error('獲取用戶參與的投票數據時發生錯誤：', error);
        throw error;
    }
}

// 刪除投票
export async function deleteVote(id: number) {
    try {
        const response = await apiClient.delete(ApiConfig.deleteVote(id));
        return response.data;
    } catch (error) {
        console.error('刪除投票時發生錯誤：', error);
        throw error;
    }
}
