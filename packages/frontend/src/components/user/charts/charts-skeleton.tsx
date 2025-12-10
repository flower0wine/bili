import { Skeleton } from "@/components/ui/skeleton";

export function FansFriendChartsSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
      <div className="text-center mb-6">
        <Skeleton className="w-48 h-8 mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 粉丝图表骨架屏 */}
        <div className="space-y-4">
          <Skeleton className="w-24 h-6 mx-auto" />
          <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
            <div className="space-y-4 w-full px-4">
              {/* Y轴标签 */}
              <div className="flex justify-between">
                <Skeleton className="w-12 h-4" />
                <Skeleton className="w-12 h-4" />
              </div>
              {/* 图表区域 */}
              <div className="h-48 bg-muted-foreground/10 rounded flex items-end justify-around p-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="w-8 bg-primary/20"
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  />
                ))}
              </div>
              {/* X轴标签 */}
              <div className="flex justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-8 h-3" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 关注图表骨架屏 */}
        <div className="space-y-4">
          <Skeleton className="w-24 h-6 mx-auto" />
          <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
            <div className="space-y-4 w-full px-4">
              {/* Y轴标签 */}
              <div className="flex justify-between">
                <Skeleton className="w-12 h-4" />
                <Skeleton className="w-12 h-4" />
              </div>
              {/* 图表区域 */}
              <div className="h-48 bg-muted-foreground/10 rounded flex items-end justify-around p-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="w-8 bg-blue-500/20"
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  />
                ))}
              </div>
              {/* X轴标签 */}
              <div className="flex justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-8 h-3" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
