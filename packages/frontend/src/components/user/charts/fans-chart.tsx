"use client";

import { useEffect, useRef, useState } from "react";
import { ChartLoadingAnimation } from "./chart-loading-animation";

interface FansChartProps {
  data: Array<{ fans: number; createdAt: string }>;
}

export function FansChart({ data }: FansChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    const loadChart = async () => {
      try {
        if (!data || data.length === 0)
          return;

        const echarts = await import("echarts");

        // 处理数据
        const sortedData = [...data].sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const dates = sortedData.map(item =>
          new Date(item.createdAt).toLocaleDateString("zh-CN", {
            month: "short",
            day: "numeric"
          })
        );
        const fansData = sortedData.map(item => item.fans);

        // 创建图表配置
        const minValue = Math.min(...fansData);
        const maxValue = Math.max(...fansData);
        const range = maxValue - minValue;
        const padding = Math.max(range * 0.1, 1);

        const option = {
          title: {
            text: "粉丝数量",
            left: "center",
            textStyle: {
              fontSize: 16,
              fontWeight: "bold"
            }
          },
          tooltip: {
            trigger: "axis",
            formatter: (params: any) => {
              const param = params[0];
              return `${param.name}<br/>粉丝数量: ${param.value.toLocaleString()}`;
            }
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true
          },
          xAxis: {
            type: "category",
            data: dates,
            axisLine: {
              lineStyle: {
                color: "#e5e7eb"
              }
            },
            axisLabel: {
              color: "#6b7280"
            }
          },
          yAxis: {
            type: "value",
            min: Math.max(0, minValue - padding),
            max: maxValue + padding,
            axisLine: {
              lineStyle: {
                color: "#e5e7eb"
              }
            },
            axisLabel: {
              color: "#6b7280",
              formatter: (value: number) => value.toLocaleString()
            },
            splitLine: {
              lineStyle: {
                color: "#f3f4f6"
              }
            }
          },
          series: [
            {
              name: "粉丝数量",
              type: "line",
              data: fansData,
              smooth: true,
              lineStyle: {
                color: "#ef4444",
                width: 3
              },
              itemStyle: {
                color: "#ef4444"
              },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: "#ef444440"
                    },
                    {
                      offset: 1,
                      color: "#ef444410"
                    }
                  ]
                }
              },
              symbol: "circle",
              symbolSize: 6,
              emphasis: {
                itemStyle: {
                  borderColor: "#ef4444",
                  borderWidth: 2
                }
              }
            }
          ]
        };

        // 初始化图表
        if (chartRef.current) {
          const chart = echarts.init(chartRef.current);
          chart.setOption(option);

          // 响应式处理

          const handleResize = () => chart.resize();
          window.addEventListener("resize", handleResize);

          // 清理函数
          return () => {
            window.removeEventListener("resize", handleResize);
            chart.dispose();
          };
        }
      }
      catch (err) {
        console.error("Failed to load fans chart:", err);
      }
      finally {
        setChartLoaded(true);
      }
    };

    loadChart();
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-muted-foreground">暂无粉丝数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      <div ref={chartRef} className="w-full h-80" />
      {!chartLoaded && (
        <div className="absolute inset-0 bg-card rounded-lg">
          <ChartLoadingAnimation theme="red" text="正在加载粉丝图表..." />
        </div>
      )}
    </div>
  );
}
