import { AxiosResponse } from 'axios';
import { api } from '@/lib/api/axios';

// 定义分页响应类型
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export const userCardApi = {
  // 获取指定用户的最新一条用户名片数据
  getLatestUserCardData: async (mid: number): Promise<AxiosResponse<Http.ApiResponse<UserCard.UserCardVO>>> => {
    return await api.get<Http.ApiResponse<UserCard.UserCardVO>>(`/v1/user-card/latest/${mid}`);
  },

  // 分页获取指定用户的所有用户名片数据
  getUserCardDataByMid: async (
    mid: number,
    params?: { page?: number; limit?: number }
  ): Promise<AxiosResponse<Http.ApiResponse<PaginatedResponse<UserCard.UserCardVO>>>> => {
    return await api.get(`/v1/user-card/user/${mid}`, { params });
  },

  // 分页获取所有用户的最新用户名片数据
  getAllLatestUserCardData: async (params?: { page?: number; limit?: number }): Promise<AxiosResponse<Http.ApiResponse<PaginatedResponse<UserCard.UserCardVO>>>> => {
    return await api.get('/v1/user-card/latest', { params });
  },

  // 根据粉丝数范围查询用户名片数据
  getUserCardDataByFansRange: async (params?: {
    minFans?: number;
    maxFans?: number;
    page?: number;
    limit?: number
  }): Promise<AxiosResponse<Http.ApiResponse<PaginatedResponse<UserCard.UserCardVO>>>> => {
    return await api.get('/v1/user-card/fans-range', { params });
  },

  // 获取用户名片数据统计信息
  getUserCardStats: async (mid?: number): Promise<AxiosResponse<Http.ApiResponse<{
    totalRecords: number;
    uniqueUsers: number;
    latestRecord: string | null;
  }>>> => {
    const url = mid ? `/v1/user-card/stats/${mid}` : '/v1/user-card/stats';
    return await api.get<Http.ApiResponse<{
      totalRecords: number;
      uniqueUsers: number;
      latestRecord: string | null;
    }>>(url);
  },
};