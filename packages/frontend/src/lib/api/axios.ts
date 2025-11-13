import axios, { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
}

// 创建axios实例
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等信息
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求时间戳（用于调试）
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理通用响应格式
api.interceptors.response.use(
  (response: AxiosResponse<Http.ApiResponse>) => {
    // 计算请求耗时
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime?.getTime();
    const duration = startTime ? endTime.getTime() - startTime : 0;

    // 开发环境下打印请求日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
      console.log('📦 Response:', response.data);
    }

    // 检查业务响应格式
    const { data } = response;

    // 如果响应数据符合标准格式，直接返回
    if (data && typeof data === 'object' && 'ok' in data) {
      return response;
    }

    // 如果不是标准格式，包装成标准格式
    const wrappedResponse: Http.ApiResponse = {
      ok: true,
      code: Http.STATUS_CODE.OK,
      data: data,
      message: 'Success'
    };

    return { ...response, data: wrappedResponse };
  },
  (error: AxiosError) => {
    // 计算请求耗时
    const endTime = new Date();
    const startTime = error.config?.metadata?.startTime?.getTime();
    const duration = startTime ? endTime.getTime() - startTime : 0;

    // 开发环境下打印错误日志
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Request Failed: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`);
      console.error('🚨 Error:', error.response?.data || error.message);
    }

    // 处理HTTP错误状态码
    if (error.response) {
      const { status, data } = error.response;
      const httpStatus = status as Http.StatusCode;

      // 如果后端已经返回了标准格式的错误响应，直接抛出
      if (data && typeof data === 'object' && 'ok' in data && !data.ok) {
        return Promise.reject(error);
      }

      // 否则包装成标准错误格式
      const wrappedError: Http.ErrorResponse = {
        ok: false,
        code: httpStatus,
        message: getErrorMessage(httpStatus),
        error: data
      };

      return Promise.reject({ ...error, response: { ...error.response, data: wrappedError } });
    }

    // 处理网络错误等其他情况
    const networkError: Http.ErrorResponse = {
      ok: false,
      code: Http.STATUS_CODE.UNKNOWN_ERROR,
      message: error.message || 'Network error occurred',
      error: error
    };

    return Promise.reject({ ...error, response: { data: networkError, status: 0 } });
  }
);

// 获取友好的错误消息
function getErrorMessage(status: Http.StatusCode): string {
  switch (status) {
    case 400:
      return '请求参数错误';
    case 401:
      return '未授权，请重新登录';
    case 403:
      return '拒绝访问';
    case 404:
      return '请求的资源不存在';
    case 500:
      return '服务器内部错误';
    case 502:
      return '网关错误';
    case 503:
      return '服务不可用';
    default:
      return '未知错误';
  }
}

// 扩展AxiosConfig以支持metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime?: Date;
    };
  }
}

export default api;