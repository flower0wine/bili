"use client";

import type { ComposeOption } from "echarts";
import type {
  BarSeriesOption,
  LineSeriesOption,
} from "echarts/charts";
import type {
  DataZoomComponentOption,
  GraphicComponentOption,
  GridComponentOption,
  TitleComponentOption,
  TooltipComponentOption
} from "echarts/components";
import { LineChart } from "echarts/charts";
import {
  AriaComponent,
  DataZoomComponent,
  GraphicComponent,
  GridComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import { init, use } from "echarts/core";
import { LegacyGridContainLabel, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";
import { formatNumber } from "@/lib/number.util";

interface FriendChartProps {
  data: Array<{ friend: number; createdAt: string }>;
}

type ECOption = ComposeOption<
  TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LineSeriesOption
  | BarSeriesOption
  | GraphicComponentOption
  | DataZoomComponentOption
>;

use(
  [
    LineChart,
    AriaComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    CanvasRenderer,
    GraphicComponent,
    DataZoomComponent,
    UniversalTransition,
    LegacyGridContainLabel
  ]
);

export function FriendChart({ data }: FriendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);

  // 初始化图表（只执行一次）
  useEffect(() => {
    if (!containerRef.current)
      return;

    const initChart = () => {
      // init 实例
      chartInstanceRef.current = init(containerRef.current);

      // 监听窗口大小变化
      const handleResize = () => chartInstanceRef.current?.resize();
      window.addEventListener("resize", handleResize);

      // cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        chartInstanceRef.current?.dispose();
      };
    };

    const cleanup = initChart();

    return () => {
      cleanup();
    };
  }, []);

  // data变化时更新 option
  useEffect(() => {
    const chart = chartInstanceRef.current;

    if (!chart || !data || data.length === 0)
      return;

    // 排序
    const sortedData = [...data].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const dates = sortedData.map(item =>
      new Date(item.createdAt).toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      })
    );
    const friendData = sortedData.map(item => item.friend);

    const minValue = Math.min(...friendData);
    const maxValue = Math.max(...friendData);
    const range = maxValue - minValue;
    const padding = Math.max(range * 0.1, 1);

    const option: ECOption = {
      aria: {
        show: true
      },
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>关注数量: ${param.value.toLocaleString()}`;
        },
      },
      grid: {
        left: "3%",
        right: "50px",
        bottom: "70px",
        top: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "#e5e7eb" } },
        axisLabel: { color: "#6b7280" },
      },
      yAxis: {
        type: "value",
        min: Math.max(0, minValue - padding),
        max: maxValue + padding,
        axisLine: { lineStyle: { color: "#e5e7eb" } },
        axisLabel: {
          color: "#6b7280",
          formatter: (value: number) => formatNumber(value),
        },
        splitLine: { lineStyle: { color: "#f3f4f6" } },
      },
      series: [
        {
          name: "关注数量",
          type: "line",
          data: friendData,
          smooth: true,
          lineStyle: {
            color: "#3b82f6",
            width: 3,
          },
          itemStyle: { color: "#3b82f6" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#3b82f640" },
                { offset: 1, color: "#3b82f610" },
              ],
            },
          },
          symbol: "circle",
          symbolSize: 6,
          emphasis: {
            itemStyle: {
              borderColor: "#3b82f6",
              borderWidth: 2,
            },
          },
        },
      ],

      dataZoom: [
        {
          type: "slider",
          xAxisIndex: 0,
          filterMode: "none",
        },
        {
          type: "slider",
          yAxisIndex: 0,
          filterMode: "none"
        },
        {
          type: "inside",
          xAxisIndex: 0,
          filterMode: "none"
        },
        {
          type: "inside",
          yAxisIndex: 0,
          filterMode: "none",
        }
      ],
    };

    chart.setOption(option);
  }, [data]);

  // 空数据
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-muted-foreground">暂无关注数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      <div className="text-lg font-semibold text-center">关注数量</div>
      <div ref={containerRef} className="w-full h-80" />
    </div>
  );
}
