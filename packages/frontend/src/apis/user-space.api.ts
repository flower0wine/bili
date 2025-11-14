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

export const userSpaceApi = {
  // 获取指定用户的最新一条用户空间数据
  getLatestUserSpaceData: async (mid: number): Promise<AxiosResponse<Http.ApiResponse<UserSpace.UserSpaceVO>>> => {
    return await api.get<Http.ApiResponse<UserSpace.UserSpaceVO>>(`/v1/user-space/latest/${mid}`);
  },

  // 分页获取指定用户的所有用户空间数据
  getUserSpaceDataByMid: async (
    mid: number,
    params?: { page?: number; limit?: number }
  ): Promise<AxiosResponse<Http.ApiResponse<PaginatedResponse<UserSpace.UserSpaceVO>>>> => {
    return await api.get(`/v1/user-space/user/${mid}`, { params });
  },

  // 分页获取所有用户的最新用户空间数据
  getAllLatestUserSpaceData: async (params?: { page?: number; limit?: number }): Promise<AxiosResponse<Http.ApiResponse<PaginatedResponse<UserSpace.UserSpaceVO>>>> => {
    return await api.get('/v1/user-space/latest', { params });
  },

  // 根据等级范围查询用户空间数据
  getUserSpaceDataByLevelRange: async (params?: {
    minLevel?: number;
    maxLevel?: number;
    page?: number;
    limit?: number
  }): Promise<AxiosResponse<Http.ApiResponse<PaginatedResponse<UserSpace.UserSpaceVO>>>> => {
    return await api.get('/v1/user-space/level-range', { params });
  },

  // 根据认证状态查询用户空间数据
  getVerifiedUserSpaceData: async (params?: { page?: number; limit?: number }): Promise<AxiosResponse<Http.ApiResponse<PaginatedResponse<UserSpace.UserSpaceVO>>>> => {
    return await api.get('/v1/user-space/verified', { params });
  },

  // 搜索用户空间数据
  searchUserSpaceData: async (keyword: string, params?: { page?: number; limit?: number }): Promise<AxiosResponse<Http.ApiResponse<PaginatedResponse<UserSpace.UserSpaceVO>>>> => {
    return await api.get('/v1/user-space/search', {
      params: { keyword, ...params }
    });
  },

  // 获取用户空间数据统计信息
  getUserSpaceStats: async (mid?: number): Promise<AxiosResponse<Http.ApiResponse<{
    totalRecords: number;
    uniqueUsers: number;
    latestRecord: string | null;
    levelDistribution: Record<number, number>;
  }>>> => {
    const url = mid ? `/v1/user-space/stats/${mid}` : '/v1/user-space/stats';
    return await api.get<Http.ApiResponse<{
      totalRecords: number;
      uniqueUsers: number;
      latestRecord: string | null;
      levelDistribution: Record<number, number>;
    }>>(url);
  },
};