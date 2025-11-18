import type {
  UseQueryOptions,
} from "@tanstack/react-query";
import type { PaginatedResponse, PaginationQuery } from "@/types/pagination";
import {
  useQuery,
} from "@tanstack/react-query";
import { userCardApi } from "@/apis";
import { parseResponse } from "@/lib/utils/response-parser";

// 获取指定用户的最新一条用户名片数据
export function useLatestUserCardData(mid: number, options?: Omit<UseQueryOptions<UserCard.UserCardVO>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: ["user-card", "latest", mid],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        userCardApi.getLatestUserCardData(mid),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}


// 分页获取指定用户的所有用户名片数据
export function useUserCardDataByMid(mid: number, params?: PaginationQuery, options?: Omit<
  UseQueryOptions<PaginatedResponse<UserCard.UserCardVO>>,
    "queryKey" | "queryFn"
>) {
  return useQuery({
    queryKey: ["user-card", "user", mid, params],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        userCardApi.getUserCardDataByMid({ mid, ...params }),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}

// 获取用户粉丝关注历史数据
export function useUserFansFriendHistory(
  mid: number,
  params?: { startDate?: string; endDate?: string },
  options?: Omit<UseQueryOptions<UserCard.UserFansFriendVO[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["user-card", "fans-friend", mid, params],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        userCardApi.getUserFansFriendHistory(mid, params),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
    ...options,
  });
}
