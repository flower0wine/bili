import { useMemo } from "react";

interface UseProxyImageOptions {
  /**
   * 是否禁用缓存，通过添加时间戳实现
   * @default false
   */
  noCache?: boolean;
}

/**
 * 生成代理图片 URL
 * @param imageUrl 原始图片 URL
 * @param options 配置选项
 * @returns 代理后的 URL
 */
export function useProxyImage(
  imageUrl?: string | null,
  options?: UseProxyImageOptions
): string | undefined {
  return useMemo(() => {
    if (!imageUrl) {
      return undefined;
    }

    // 如果已经是本地 URL，直接返回
    if (imageUrl.startsWith("/")) {
      return imageUrl;
    }

    // 使用 API 代理
    let proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;

    // 如果禁用缓存，添加时间戳
    if (options?.noCache) {
      proxyUrl += `&t=${Date.now()}`;
    }

    return proxyUrl;
  }, [imageUrl, options?.noCache]);
}
