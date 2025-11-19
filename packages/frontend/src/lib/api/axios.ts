import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is not set");
}

// 使用WeakMap存储请求时间戳，避免污染axios配置
const requestTimestamps = new WeakMap<AxiosRequestConfig, Date>();

// 创建axios实例
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
  (response: AxiosResponse) => {
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

    return response;
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

    // 直接抛出原始错误，让上层处理
    return Promise.reject(error);
  },
);


export default api;
