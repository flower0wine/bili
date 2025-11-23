import { QueryClient } from "@tanstack/react-query";
import { RetryStrategy } from "./retry-strategy";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 查询的智能重试策略
      retry: (failureCount, error) => {
        return RetryStrategy.shouldRetry(failureCount, error);
      },
      retryDelay: (failureCount) => {
        return RetryStrategy.getRetryDelay(failureCount);
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Mutation 的智能重试策略
      retry: (failureCount, error) => {
        return RetryStrategy.shouldRetry(failureCount, error);
      },
      retryDelay: (failureCount) => {
        return RetryStrategy.getRetryDelay(failureCount);
      },
    },
  },
});
