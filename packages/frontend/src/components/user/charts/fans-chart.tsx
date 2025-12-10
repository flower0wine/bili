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

interface FansChartProps {
  data: Array<{ fans: number; createdAt: string }>;
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

export function FansChart({ data }: FansChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);

  // 初始化图表（只执行一次）
  useEffect(() => {
    let mounted = true;

    const initChart = () => {
      if (!containerRef.current)
        return;

      if (!mounted)
        return;

      // 初始化实例
      chartInstanceRef.current = init(containerRef.current);

      // resize 响应式
      const handleResize = () => chartInstanceRef.current?.resize();
      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        mounted = false;
        window.removeEventListener("resize", handleResize);
        chartInstanceRef.current?.dispose();
      };
    };

    const cleanup = initChart();

    return () => {
      cleanup?.();
    };
  }, []);

  // 数据变化时更新 option（不重新 init）
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
    const fansData = sortedData.map(item => item.fans);

    // min/max padding
    const minValue = Math.min(...fansData);
    const maxValue = Math.max(...fansData);
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
          return `${param.name}<br/>粉丝数量: ${param.value.toLocaleString()}`;
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
        axisLine: {
          lineStyle: { color: "#e5e7eb" },
        },
        axisLabel: {
          color: "#6b7280",
        },
      },
      yAxis: {
        type: "value",
        min: Math.max(0, minValue - padding),
        max: maxValue + padding,
        axisLine: {
          lineStyle: { color: "#e5e7eb" },
        },
        axisLabel: {
          color: "#6b7280",
          formatter: (value: number) => formatNumber(value),
        },
        splitLine: {
          lineStyle: { color: "#f3f4f6" },
        },
      },
      series: [
        {
          name: "粉丝数量",
          type: "line",
          data: fansData,
          smooth: true,
          lineStyle: {
            color: "#ef4444",
            width: 3,
          },
          itemStyle: { color: "#ef4444" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#ef444440" },
                { offset: 1, color: "#ef444410" },
              ],
            },
          },
          symbol: "circle",
          symbolSize: 6,
          emphasis: {
            itemStyle: {
              borderColor: "#ef4444",
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

    // 更新图表（不会重新 init）
    chart.setOption(option);
  }, [data]);

  // 无数据情况
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-muted-foreground">暂无粉丝数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      <div className="text-lg font-semibold text-center">粉丝数量</div>
      <div ref={containerRef} className="w-full h-80" />
    </div>
  );
}
