import type { AxiosResponse } from "axios";
import type { PaginatedResponse, PaginationQuery } from "@/types/pagination";
import { api } from "@/lib/api/axios";


export const userCardApi = {
  // 获取指定用户的最新一条用户名片数据
  getLatestUserCardData: async (
    mid: number,
  ): Promise<AxiosResponse<Http.ApiResponse<UserCard.UserCardVO>>> => {
    return api.get<Http.ApiResponse<UserCard.UserCardVO>>(
      `/v1/user-card/latest/${mid}`,
    );
  },

  // 分页获取指定用户的所有用户名片数据
  getUserCardDataByMid: async (
    params?: PaginationQuery & { mid?: number },
  ): Promise<
    AxiosResponse<Http.ApiResponse<PaginatedResponse<UserCard.UserCardVO>>>
  > => {
    return api.get(`/v1/user-card/user`, { params });
  },

  // 获取用户粉丝关注历史数据
  getUserFansFriendHistory: async (
    mid: number,
    params?: { startDate?: string; endDate?: string },
  ): Promise<AxiosResponse<Http.ApiResponse<UserCard.UserFansFriendVO[]>>> => {
    return api.get(`/v1/user-card/fans-friend/${mid}`, { params });
  },
};
