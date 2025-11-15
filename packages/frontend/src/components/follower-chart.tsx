"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

interface FollowerChartProps {
  data: Array<{
    id: number;
    mid: number;
    fans: number;
    friend: number;
    createdAt: string;
    updatedAt: string;
  }>;
  isLoading?: boolean;
}

export function FollowerChart({ data, isLoading = false }: FollowerChartProps) {
  // 1. 数据处理
  const processedData = useMemo(() => {
    const sorted = [...data]
      .sort(
        (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      )
      .map((item) => {
        const ts = dayjs(item.createdAt).valueOf();
        return {
          timestamp: ts,
          value: item.fans,
          date: dayjs(item.createdAt).format("MM-DD HH:mm"),
          fullDate: dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          relativeTime: dayjs(item.createdAt).fromNow(),
        };
      });

    // 只有1条数据 → 插入前1小时“假点”
    if (sorted.length === 1) {
      const point = sorted[0];
      return [
        {
          ...point,
          timestamp: point.timestamp - 3600000,
          date: dayjs(point.timestamp - 3600000).format("MM-DD HH:mm"),
          fullDate: dayjs(point.timestamp - 3600000).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
          relativeTime: dayjs(point.timestamp - 3600000).fromNow(),
          value: point.value, // 保持值不变
        },
        point,
      ];
    }
    return sorted;
  }, [data]);

  // 2. 当前显示数据（用于统计）
  const displayData = processedData.filter(
    d => d.timestamp >= (processedData[0]?.timestamp || 0),
  );

  // 3. Y 轴范围
  const { yMin, yMax } = useMemo(() => {
    const values = displayData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range === 0 ? 5 : Math.max(1, Math.ceil(range * 0.1));
    return {
      yMin: min - padding,
      yMax: max + padding,
    };
  }, [displayData]);

  // 4. 统计信息
  const current = displayData[displayData.length - 1]?.value ?? 0;
  const first = displayData[0]?.value ?? 0;
  const changePercent
    = first === 0
      ? current > 0
        ? "+∞%"
        : "0%"
      : `${(((current - first) / first) * 100).toFixed(1)}%`;

  // 5. ECharts 配置
  const option = useMemo(() => {
    if (processedData.length === 0)
      return {};

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: "#111", fontSize: 13 },
        formatter: (params: any) => {
          const p = params[0];
          const date = dayjs(p.data[0]);
          return `
            <div style="font-size:13px">
              <div style="font-weight:600; margin-bottom:4px">${date.format("YYYY-MM-DD HH:mm:ss")}</div>
              <div style="color:#6b7280; font-size:11px; margin-bottom:4px">${date.fromNow()}</div>
              <div style="color:#3b82f6; font-weight:600">粉丝数: ${p.data[1].toLocaleString()}</div>
            </div>
          `;
        },
      },
      grid: {
        left: 10,
        right: 30,
        top: 20,
        bottom: 20,
        containLabel: true,
      },
      xAxis: {
        type: "time",
        axisLabel: {
          formatter: (value: number) => dayjs(value).format("MM-DD HH:mm"),
          color: "#6b7280",
          fontSize: 12,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: true, lineStyle: { color: "#e5e7eb", opacity: 0.5 } },
      },
      yAxis: {
        type: "value",
        min: yMin,
        max: yMax,
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 10000)
              return `${(value / 10000).toFixed(1)}万`;
            return value.toLocaleString();
          },
          color: "#6b7280",
          fontSize: 12,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: true, lineStyle: { color: "#e5e7eb", opacity: 0.5 } },
      },
      series: [
        {
          name: "粉丝数",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          itemStyle: { color: "#3b82f6" },
          lineStyle: { color: "#3b82f6", width: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(59, 130, 246, 0.8)" },
                { offset: 1, color: "rgba(59, 130, 246, 0.1)" },
              ],
            },
          },
          data: processedData.map(d => [d.timestamp, d.value]),
        },
      ],
    };
  }, [processedData, yMin, yMax]);

  if (isLoading) {
    return (
      <div className="animate-fade-in rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg text-gray-900 font-semibold dark:text-gray-100">
          粉丝数量变化趋势
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-shimmer h-full w-full animate-pulse rounded bg-gray-100 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="animate-fade-in rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg text-gray-900 font-semibold dark:text-gray-100">
          粉丝数量变化趋势
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <svg className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>暂无历史数据</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-lg text-gray-900 font-semibold dark:text-gray-100">
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          粉丝数量变化趋势
        </h3>
      </div>

      {/* 主图表 */}
      <div className="h-64">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>

      {/* 统计信息 */}
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-600">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-3 text-center transition-all hover:scale-105 dark:bg-gray-700/50">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">当前粉丝数</span>
            <p className="text-lg text-gray-900 font-semibold dark:text-gray-100">
              {current.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center transition-all hover:scale-105 dark:bg-gray-700/50">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">粉丝变化</span>
            <p
              className={cn(
                "text-lg font-semibold",
                current > first
                  ? "text-green-600 dark:text-green-400"
                  : current < first
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
              )}
            >
              {data.length > 1 ? changePercent : "仅有当前数据"}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center transition-all hover:scale-105 dark:bg-gray-700/50">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">数据记录数</span>
            <p className="text-lg text-gray-900 font-semibold dark:text-gray-100">
              {data.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
