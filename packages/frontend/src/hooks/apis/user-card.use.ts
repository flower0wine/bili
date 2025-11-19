

import type { PaginationQuery } from "@/types/pagination";
import {
  useQuery,
} from "@tanstack/react-query";
import { userCardApi } from "@/apis";

// 获取指定用户的最新一条用户名片数据
export function useLatestUserCardData(mid: number) {
  return useQuery({
    queryKey: ["user-card", "latest", mid],
    queryFn: async () => {
      const response = await userCardApi.getLatestUserCardData(mid);
      return response.data.data!;
    },
  });
}


// 分页获取指定用户的所有用户名片数据
export function useUserCardDataByMid(mid: number, params?: PaginationQuery) {
  return useQuery({
    queryKey: ["user-card", "user", mid, params],
    queryFn: async () => {
      const response = await userCardApi.getUserCardDataByMid({ mid, ...params });
      return response.data.data!;
    },
  });
}

// 获取用户粉丝关注历史数据
export function useUserFansFriendHistory(
  mid: number,
  params?: { startDate?: string; endDate?: string }
) {
  return useQuery({
    queryKey: ["user-card", "fans-friend", mid, params],
    queryFn: async () => {
      const response = await userCardApi.getUserFansFriendHistory(mid, params);
      return response.data.data!;
    },
  });
}
