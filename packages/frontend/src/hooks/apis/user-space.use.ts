import type { PaginationQuery } from "@/types/pagination";
import { useQuery } from "@tanstack/react-query";
import { userSpaceApi } from "@/apis";

// 获取指定用户的最新一条用户空间数据
export function useLatestUserSpaceData(
  mid: number,
) {
  return useQuery({
    queryKey: ["user-space", "latest", mid],
    queryFn: async () => {
      const response = await userSpaceApi.getLatestUserSpaceData(mid);
      return response.data.data!;
    },
  });
}

// 分页获取指定用户的所有用户空间数据
export function useUserSpaceDataByMid(
  mid: number,
  params?: PaginationQuery,
) {
  return useQuery({
    queryKey: ["user-space", "user", mid, params],
    queryFn: async () => {
      const response = await userSpaceApi.getUserSpaceDataByMid(mid, params);
      return response.data.data!;
    },
  });
}

