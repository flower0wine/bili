"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ReactECharts from "echarts-for-react";
import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

interface FollowingChartProps {
  data: UserCard.UserFansFriendVO[];
  isLoading?: boolean;
}

export function FollowingChart({
  data,
  isLoading = false,
}: FollowingChartProps) {
  const [zoom, setZoom] = useState<{ start?: number; end?: number }>({});

  // 1. 数据处理
  const processedData = useMemo(() => {
    return data
      .sort(
        (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      )
      .map(item => ({
        timestamp: dayjs(item.createdAt).valueOf(),
        value: item.friend,
        fullDate: dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        relativeTime: dayjs(item.createdAt).fromNow(),
      }));
  }, [data]);

  // 2. 当前显示范围
  const chartData = useMemo(() => {
    if (!zoom.start || !zoom.end)
      return processedData;
    return processedData.filter(
      d => d.timestamp >= zoom.start! && d.timestamp <= zoom.end!,
    );
  }, [processedData, zoom]);

  // 3. ECharts 配置
  const option = useMemo(() => {
    if (processedData.length === 0)
      return {};

    const timestamps = processedData.map(d => d.timestamp);
    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);
    const spanHours = (maxTs - minTs) / (1000 * 60 * 60);

    // 动态 X 轴格式
    let xFormat = "HH:mm";
    if (spanHours >= 24 * 30)
      xFormat = "MM-DD";
    else if (spanHours >= 24 * 7)
      xFormat = "MM-DD HH:mm";
    else if (spanHours >= 24)
      xFormat = "MM-DD HH:mm";
    else xFormat = "HH:mm";

    // Y 轴范围
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range === 0 ? 5 : Math.max(1, Math.ceil(range * 0.1));
    const yMin = min - padding;
    const yMax = max + padding;

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
          const date = dayjs(p.data.timestamp);
          return `
            <div style="font-size:13px">
              <div style="font-weight:600; margin-bottom:4px">${date.format("YYYY-MM-DD HH:mm:ss")}</div>
              <div style="color:#6b7280; font-size:11px; margin-bottom:4px">${date.fromNow()}</div>
              <div style="color:#10b981; font-weight:600">关注数: ${p.data.value.toLocaleString()}</div>
            </div>
          `;
        },
      },
      grid: {
        left: 10,
        right: 30,
        top: 20,
        bottom: 60,
        containLabel: true,
      },
      xAxis: {
        type: "time",
        min: chartData[0]?.timestamp,
        max: chartData[chartData.length - 1]?.timestamp,
        axisLabel: {
          formatter: (value: number) => dayjs(value).format(xFormat),
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
          formatter: (v: number) => v.toLocaleString(),
          color: "#6b7280",
          fontSize: 12,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: true, lineStyle: { color: "#e5e7eb", opacity: 0.5 } },
      },
      series: [
        {
          name: "关注数",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          itemStyle: { color: "#10b981" },
          lineStyle: { color: "#10b981", width: 2.5 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(16, 185, 129, 0.6)" },
                { offset: 1, color: "rgba(16, 185, 129, 0.05)" },
              ],
            },
          },
          data: chartData.map(d => [d.timestamp, d.value]),
        },
      ],
      // Brush 缩放
      dataZoom: [
        {
          type: "slider",
          height: 30,
          bottom: 10,
          borderRadius: 8,
          backgroundColor: "rgba(16, 185, 129, 0.06)",
          fillerColor: "rgba(16, 185, 129, 0.25)",
          borderColor: "rgba(16, 185, 129, 0.6)",
          handleSize: 12,
          handleStyle: {
            color: "#10b981",
            borderRadius: 4,
            borderWidth: 0,
          },
          // 自定义手柄图标（竖线）
          handleIcon:
            "path://M0,0 L0,30 M-2,15 L2,15 M-2,10 L2,10 M-2,20 L2,20",
          moveHandleSize: 8,
          moveHandleStyle: { color: "#fff", opacity: 0.8 },
          showDetail: false,
          realtime: true,
          start: zoom.start
            ? ((zoom.start - minTs) / (maxTs - minTs)) * 100
            : 0,
          end: zoom.end ? ((zoom.end - minTs) / (maxTs - minTs)) * 100 : 100,
        },
      ],
    };
  }, [processedData, chartData, zoom]);

  // Brush 变化回调
  const onEvents = {
    datazoom: (params: any) => {
      if (!params.batch)
        return;
      const batch = params.batch[0];
      const startTs = processedData[0].timestamp;
      const endTs = processedData[processedData.length - 1].timestamp;
      const span = endTs - startTs;
      const newStart = startTs + (batch.start / 100) * span;
      const newEnd = startTs + (batch.end / 100) * span;
      setZoom({ start: newStart, end: newEnd });
    },
  };

  const handleReset = () => setZoom({});

  if (isLoading) {
    return (
      <div className="animate-fade-in rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg text-gray-900 font-semibold dark:text-gray-100">
          关注数量变化趋势
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
          关注数量变化趋势
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <svg className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>暂无历史数据</p>
          </div>
        </div>
      </div>
    );
  }

  const current = chartData[chartData.length - 1]?.value ?? 0;
  const first = chartData[0]?.value ?? 0;
  const change = current - first;

  return (
    <div className="animate-fade-in rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg text-gray-900 font-semibold dark:text-gray-100">
          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          关注数量变化趋势
        </h3>
        {(zoom.start || zoom.end) && (
          <button
            onClick={handleReset}
            className={cn(
              "flex items-center gap-1 text-xs text-gray-500 transition-all duration-200 hover:scale-105 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            <RotateCcw className="h-3 w-3" />
            重置
          </button>
        )}
      </div>

      {/* 主图表 */}
      <div className="h-80">
        <ReactECharts
          option={option}
          onEvents={onEvents}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 mt-4 gap-4 text-sm md:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-3 text-center transition-all hover:scale-105 dark:bg-gray-700/50">
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">显示范围</p>
          <p className="text-gray-900 font-semibold dark:text-gray-100">
            {chartData.length}
            {" "}
            条
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center transition-all hover:scale-105 dark:bg-gray-700/50">
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">当前关注</p>
          <p className="text-gray-900 font-semibold dark:text-gray-100">
            {current.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center transition-all hover:scale-105 dark:bg-gray-700/50">
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">变化</p>
          <p
            className={cn(
              "font-semibold",
              change > 0
                ? "text-green-600 dark:text-green-400"
                : change < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
            )}
          >
            {change === 0 ? "0" : change > 0 ? `+${change}` : change}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center transition-all hover:scale-105 dark:bg-gray-700/50">
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">总记录</p>
          <p className="text-gray-900 font-semibold dark:text-gray-100">
            {processedData.length}
          </p>
        </div>
      </div>
    </div>
  );
}
