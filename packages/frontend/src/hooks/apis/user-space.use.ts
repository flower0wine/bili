import type { PaginationQuery } from "@/types/pagination";
import { useQuery } from "@tanstack/react-query";
import { userSpaceApi } from "@/apis";
import { parseResponse } from "@/lib/utils/response-parser";

// 获取指定用户的最新一条用户空间数据
export function useLatestUserSpaceData(
  mid: number,
) {
  return useQuery({
    queryKey: ["user-space", "latest", mid],
    queryFn: async () => {
      const [data, error] = await parseResponse(async () =>
        userSpaceApi.getLatestUserSpaceData(mid),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
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
      const [data, error] = await parseResponse(async () =>
        userSpaceApi.getUserSpaceDataByMid(mid, params),
      );
      if (error) {
        throw new Error(error.message);
      }
      return data!;
    },
  });
}

