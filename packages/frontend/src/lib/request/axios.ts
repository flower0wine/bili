import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiResponse } from "@/types/http";
import axios from "axios";
import { ApiError } from "./api-error";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 使用WeakMap存储请求时间戳，避免污染axios配置
const requestTimestamps = new WeakMap<AxiosRequestConfig, Date>();

// 创建axios实例
export const api = axios.create({
  baseURL: process.env.NODE_ENV === "development" ? `${API_BASE_URL}/api` : "/api",
  timeout: 60_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等信息
    const token
      = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 存储请求开始时间
    requestTimestamps.set(config, new Date());

    return config;
  },
  async (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 处理通用响应格式
api.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
    // 计算请求耗时
    const endTime = new Date();
    const startTime = requestTimestamps.get(response.config);
    const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

    // 清理WeakMap中的时间戳
    requestTimestamps.delete(response.config);

    // 开发环境下打印请求日志
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`,
      );
      console.log("📦 Response:", response.data);
    }

    if (!response.data.ok) {
      // 业务错误：HTTP 200 但 ok=false
      const error = ApiError.businessError(
        response.data.message || "Unknown error",
        response.data.code,
        response.data.data,
        response.data.error,
      );
      return Promise.reject(error);
    }

    return Promise.resolve(response);
  },
  async (error: AxiosError) => {
    // 计算请求耗时
    const endTime = new Date();
    const startTime = error.config ? requestTimestamps.get(error.config) : undefined;
    const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

    // 清理WeakMap中的时间戳
    if (error.config) {
      requestTimestamps.delete(error.config);
    }

    // 开发环境下打印错误日志
    if (process.env.NODE_ENV === "development") {
      console.error(
        `❌ API Request Failed: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`,
      );
      console.error("🚨 Error:", error.response?.data || error.message);
    }

    // 将 AxiosError 转换为 ApiError，保留更多上下文
    const apiError = ApiError.networkError(
      error.message || "Network error",
      error.response?.status
    );
    // 保留原始的 AxiosError 信息
    (apiError as any).originalError = error;

    return Promise.reject(apiError);
  },
);


export { ApiError };
export default api;
