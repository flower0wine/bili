import type {
  UseQueryOptions,
} from "@tanstack/react-query";
import type { PaginatedResponse, PaginationQuery } from "@/types/pagination";
import { useQuery } from "@tanstack/react-query";
import { userSpaceApi } from "@/apis";
import { parseResponse } from "@/lib/utils/response-parser";

// 获取指定用户的最新一条用户空间数据
export function useLatestUserSpaceData(
  mid: number,
  options?: Omit<UseQueryOptions<UserSpace.UserSpaceVO>, "queryKey" | "queryFn">,
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
    ...options,
  });
}

// 分页获取指定用户的所有用户空间数据
export function useUserSpaceDataByMid(
  mid: number,
  params?: PaginationQuery,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<UserSpace.UserSpaceVO>>,
    "queryKey" | "queryFn"
  >,
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
    ...options,
  });
}

