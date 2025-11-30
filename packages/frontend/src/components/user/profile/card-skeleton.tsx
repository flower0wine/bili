import { Skeleton } from "@/components/ui/skeleton";

export function UserProfileCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 mb-8 border border-border">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* 头像骨架屏 */}
        <div className="shrink-0">
          <Skeleton className="w-24 h-24 rounded-full" />
        </div>

        {/* 用户信息骨架屏 */}
        <div className="flex-1 space-y-4">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-32 h-4" />

          {/* 统计数据骨架屏 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center p-3 bg-muted rounded-lg">
                <Skeleton className="w-5 h-5 mx-auto mb-1" />
                <Skeleton className="w-12 h-6 mx-auto mb-1" />
                <Skeleton className="w-8 h-3 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 用户简介骨架屏 */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <Skeleton className="w-16 h-4 mb-2" />
        <Skeleton className="w-full h-4 mb-1" />
        <Skeleton className="w-3/4 h-4" />
      </div>
    </div>
  );
}
