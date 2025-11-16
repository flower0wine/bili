"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Edit,
  Pause,
  Play,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  AnimatedTableCell,
  AnimatedTableContainer,
  AnimatedTableRow,
} from "@/components/admin/animations";
import { DataTableSuspense } from "@/components/admin/suspense";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// 模拟触发器数据
const mockTriggers = [
  {
    id: 1,
    name: "用户空间同步触发器",
    taskName: "用户空间同步",
    cron: "0 */30 * * * *",
    enabled: true,
    description: "每30分钟执行一次用户空间同步",
    createdAt: "2024-01-15 10:00:00",
    updatedAt: "2024-01-16 09:30:00",
  },
  {
    id: 2,
    name: "每日备份触发器",
    taskName: "数据备份",
    cron: "0 0 2 * * *",
    enabled: true,
    description: "每天凌晨2点执行数据备份",
    createdAt: "2024-01-14 08:00:00",
    updatedAt: "2024-01-14 08:00:00",
  },
  {
    id: 3,
    name: "日志清理触发器",
    taskName: "日志清理",
    cron: "0 0 0 * * 0",
    enabled: false,
    description: "每周日午夜清理过期日志",
    createdAt: "2024-01-10 15:30:00",
    updatedAt: "2024-01-15 16:20:00",
  },
  {
    id: 4,
    name: "系统监控触发器",
    taskName: "系统监控",
    cron: "*/5 * * * *",
    enabled: true,
    description: "每5分钟监控系统状态",
    createdAt: "2024-01-12 11:00:00",
    updatedAt: "2024-01-16 10:15:00",
  },
  {
    id: 5,
    name: "用户卡片更新触发器",
    taskName: "用户卡片更新",
    cron: "0 */15 * * * *",
    enabled: true,
    description: "每15分钟更新用户卡片信息",
    createdAt: "2024-01-13 14:00:00",
    updatedAt: "2024-01-16 08:45:00",
  },
];

export function TriggerManagement() {
  const [triggers, setTriggers] = useState(mockTriggers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleTrigger = (triggerId: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setTriggers(prev =>
        prev.map(trigger =>
          trigger.id === triggerId
            ? { ...trigger, enabled: !trigger.enabled }
            : trigger
        )
      );
      setIsLoading(false);
    }, 500);
  };

  const handleEditTrigger = (triggerId: number) => {
    console.log("编辑触发器:", triggerId);
  };

  const handleDeleteTrigger = (triggerId: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setTriggers(prev => prev.filter(trigger => trigger.id !== triggerId));
      setIsLoading(false);
    }, 500);
  };

  const handleExecuteTrigger = (triggerId: number) => {
    console.log("执行触发器:", triggerId);
  };

  const filteredTriggers = triggers.filter(trigger =>
    trigger.name.toLowerCase().includes(searchTerm.toLowerCase())
    || trigger.taskName.toLowerCase().includes(searchTerm.toLowerCase())
    || trigger.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <DataTableSuspense rowCount={5} columnCount={7} />;
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">触发器管理</h1>
          <p className="text-muted-foreground">
            管理定时任务触发器和调度配置
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            创建触发器
          </Button>
        </div>
      </motion.div>

      {/* 搜索和过滤 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center space-x-4"
      >
        <div className="relative max-w-md flex-1">
          <Settings className="absolute left-3 top-1/2 h-4 w-4 transform text-muted-foreground -translate-y-1/2" />
          <Input
            placeholder="搜索触发器..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* 触发器列表 */}
      <AnimatedTableContainer>
        <div className="border rounded-md">
          {/* 表头 */}
          <motion.div
            className="border-b bg-muted/50 p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-3">触发器名称</div>
              <div className="col-span-2">任务名称</div>
              <div className="col-span-2">Cron 表达式</div>
              <div className="col-span-1">状态</div>
              <div className="col-span-2">更新时间</div>
              <div className="col-span-2">操作</div>
            </div>
          </motion.div>

          {/* 表格内容 */}
          <div className="divide-y">
            {filteredTriggers.map((trigger, index) => (
              <AnimatedTableRow
                key={trigger.id}
                index={index}
                className="p-4"
              >
                <AnimatedTableCell className="col-span-3">
                  <div>
                    <div className="font-medium">{trigger.name}</div>
                    <div className="text-sm text-muted-foreground">{trigger.description}</div>
                  </div>
                </AnimatedTableCell>

                <AnimatedTableCell className="col-span-2">
                  <Badge variant="secondary">
                    {trigger.taskName}
                  </Badge>
                </AnimatedTableCell>

                <AnimatedTableCell className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <code className="rounded bg-muted px-2 py-1 text-sm">
                      {trigger.cron}
                    </code>
                  </div>
                </AnimatedTableCell>

                <AnimatedTableCell className="col-span-1">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Switch
                      checked={trigger.enabled}
                      onCheckedChange={() => handleToggleTrigger(trigger.id)}
                    />
                  </motion.div>
                </AnimatedTableCell>

                <AnimatedTableCell className="col-span-2">
                  <div className="text-sm text-muted-foreground">
                    {new Date(trigger.updatedAt).toLocaleDateString()}
                  </div>
                </AnimatedTableCell>

                <AnimatedTableCell className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecuteTrigger(trigger.id)}
                        disabled={!trigger.enabled}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTrigger(trigger.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTrigger(trigger.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </AnimatedTableCell>
              </AnimatedTableRow>
            ))}
          </div>
        </div>
      </AnimatedTableContainer>

      {/* 分页 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="text-sm text-muted-foreground">
          显示
          {" "}
          {filteredTriggers.length}
          {" "}
          个触发器
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            上一页
          </Button>
          <Button variant="outline" size="sm" disabled>
            下一页
          </Button>
        </div>
      </motion.div>
    </div>
  );
}