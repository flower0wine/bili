import type { AxiosResponse } from "axios";
import { api } from "@/lib/api/axios";

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
  getLatestUserSpaceData: async (
    mid: number,
  ): Promise<AxiosResponse<Http.ApiResponse<UserSpace.UserSpaceVO>>> => {
    return api.get<Http.ApiResponse<UserSpace.UserSpaceVO>>(
      `/v1/user-space/latest/${mid}`,
    );
  },

  // 分页获取指定用户的所有用户空间数据
  getUserSpaceDataByMid: async (
    mid: number,
    params?: { page?: number; limit?: number },
  ): Promise<
    AxiosResponse<Http.ApiResponse<PaginatedResponse<UserSpace.UserSpaceVO>>>
  > => {
    return api.get(`/v1/user-space/user/${mid}`, { params });
  },
};
