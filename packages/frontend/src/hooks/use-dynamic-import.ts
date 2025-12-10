import { useEffect, useState } from "react";

/**
 * 动态加载模块的 Hook
 * @param factory 动态 import 的函数
 * @returns [module, loading, error]
 */
export function useDynamicImport<T = any>(
  factory: () => Promise<T>
): [T | null, boolean, unknown] {
  const [module, setModule] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    factory()
      .then((mod) => {
        if (mounted)
          setModule(mod);
      })
      .catch((err) => {
        if (mounted)
          setError(err);
      })
      .finally(() => {
        if (mounted)
          setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [factory]);

  return [module, loading, error];
}
