import { Skeleton } from "@/components/ui/skeleton";

export function UserSpaceCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
      <div className="flex items-center mb-6">
        <Skeleton className="w-6 h-6 mr-3" />
        <Skeleton className="w-32 h-8" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本信息骨架屏 */}
        <div className="space-y-4">
          <Skeleton className="w-20 h-6 mb-3" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="w-4 h-4 mr-2" />
                <Skeleton className="w-32 h-4" />
              </div>
            ))}
          </div>
        </div>

        {/* 直播间信息骨架屏 */}
        <div className="space-y-4">
          <Skeleton className="w-24 h-6 mb-3" />
          <div className="p-4 bg-muted rounded-lg">
            <Skeleton className="w-full h-5 mb-2" />
            <Skeleton className="w-24 h-4 mb-2" />
            <Skeleton className="w-16 h-6" />
          </div>
        </div>
      </div>

      {/* 标签骨架屏 */}
      <div className="mt-6">
        <Skeleton className="w-12 h-6 mb-3" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-16 h-7 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
