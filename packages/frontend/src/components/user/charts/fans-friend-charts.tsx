import { userCardApi } from "@/apis/user-card.api";
import { FadeInUp } from "@/components/motion";
import { ChartLoadingAnimation } from "./chart-loading-animation";
import { ChartStateHandler } from "./chart-state-handler";
import { FansChart } from "./fans-chart";
import { FriendChart } from "./friend-chart";

interface FansFriendChartsProps {
  uid: number;
  startDate?: string;
  endDate?: string;
}

export async function FansFriendCharts({ uid, startDate, endDate }: FansFriendChartsProps) {
  let historyData;
  let error;

  try {
    const response = await userCardApi.getUserFansFriendHistory(uid, {
      startDate,
      endDate
    });
    historyData = response.data?.data;
  }
  catch (err) {
    console.error("Failed to fetch fans friend history:", err);
    error = err instanceof Error ? err.message : "获取粉丝关注历史数据时发生未知错误";
  }

  return (
    <ChartStateHandler
      error={error}
      hasData={!!(historyData && historyData.length > 0)}
      noDataTitle="暂无历史数据"
      noDataMessage="未找到该用户的粉丝关注历史数据"
      errorTitle="加载图表数据失败"
    >
      {historyData && historyData.length > 0 && (
        <FadeInUp fallback={(
          <div className="h-160">
            <div className="bg-card rounded-lg">
              <ChartLoadingAnimation theme="red" text="正在加载粉丝图表..." />
            </div>
            <div className="bg-card rounded-lg">
              <ChartLoadingAnimation theme="blue" text="正在加载关注图表..." />
            </div>
          </div>
        )}
        >
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <h2 className="text-2xl font-bold text-card-foreground mb-6 text-center">
              粉丝关注变化趋势
            </h2>

            <div className="space-y-8">
              {/* 粉丝数量图表 */}
              <FansChart data={historyData} />

              {/* 关注数量图表 */}
              <FriendChart data={historyData} />
            </div>
          </div>
        </FadeInUp>
      )}
    </ChartStateHandler>
  );
}
