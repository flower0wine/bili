import type { ApiResponse } from "@/types/http";
import type { PaginatedResponse, PaginationQuery } from "@/types/pagination";
import type { UserCardVO, UserFansFriendVo } from "@/types/user-card";
import { api } from "@/lib/api/axios";


export const userCardApi = {
  // 获取指定用户的最新一条用户名片数据
  getLatestUserCardData: async (
    mid: number,
  ) => {
    return api.get<ApiResponse<UserCardVO>>(
      `/v1/user-card/latest/${mid}`,
    );
  },

  // 分页获取指定用户的所有用户名片数据
  getUserCardDataByMid: async (
    params?: PaginationQuery & { mid?: number },
  ) => {
    return api.get<PaginatedResponse<UserCardVO>>(`/v1/user-card/user`, { params });
  },

  // 获取用户粉丝关注历史数据
  getUserFansFriendHistory: async (
    mid: number,
    params?: { startDate?: string; endDate?: string },
  ) => {
    return api.get<ApiResponse<UserFansFriendVo[]>>(`/v1/user-card/fans-friend/${mid}`, { params });
  },
};
