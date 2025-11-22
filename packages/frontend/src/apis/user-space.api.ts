import type { ApiResponse } from "@/types/http";
import type { PaginatedResponse } from "@/types/pagination";
import type { UserSpaceVO } from "@/types/user-space";
import { api } from "@/lib/api/axios";

export const userSpaceApi = {
  // 获取指定用户的最新一条用户空间数据
  getLatestUserSpaceData: async (
    mid: number,
  ) => {
    return api.get<ApiResponse<UserSpaceVO>>(
      `/v1/user-space/latest/${mid}`,
    );
  },

  // 分页获取指定用户的所有用户空间数据
  getUserSpaceDataByMid: async (
    mid: number,
    params?: { page?: number; limit?: number },
  ) => {
    return api.get<PaginatedResponse<UserSpaceVO>>(`/v1/user-space/user/${mid}`, { params });
  },
};
