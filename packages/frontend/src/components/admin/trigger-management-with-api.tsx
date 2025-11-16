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
import {
  useAllTriggers,
  useDeleteTrigger,
  useToggleTrigger,
  useUpdateTrigger
} from "@/hooks/apis/trigger.use";

export function TriggerManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // 使用 React Query 获取数据
  const {
    data: triggers = [],
    isLoading,
    error,
    refetch
  } = useAllTriggers();

  const toggleTriggerMutation = useToggleTrigger();
  const deleteTriggerMutation = useDeleteTrigger();
  const updateTriggerMutation = useUpdateTrigger();

  const handleToggleTrigger = async (triggerId: number) => {
    try {
      await toggleTriggerMutation.mutateAsync(triggerId.toString());
      // 重新获取数据以更新状态
      refetch();
    }
    catch (error) {
      console.error("切换触发器状态失败:", error);
    }
  };

  const handleEditTrigger = (triggerId: number) => {
    console.log("编辑触发器:", triggerId);
    // TODO: 实现编辑功能
  };

  const handleDeleteTrigger = async (triggerId: number) => {
    if (window.confirm("确定要删除这个触发器吗？")) {
      try {
        await deleteTriggerMutation.mutateAsync(triggerId.toString());
        refetch();
      }
      catch (error) {
        console.error("删除触发器失败:", error);
      }
    }
  };

  const handleExecuteTrigger = async (triggerId: number) => {
    console.log("执行触发器:", triggerId);
    // TODO: 实现手动执行功能
  };

  const filteredTriggers = triggers.filter(trigger =>
    trigger.name.toLowerCase().includes(searchTerm.toLowerCase())
    || trigger.taskName.toLowerCase().includes(searchTerm.toLowerCase())
    || (trigger.description && trigger.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <DataTableSuspense rowCount={5} columnCount={7} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg text-gray-900 font-medium dark:text-gray-100">加载失败</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            无法加载触发器数据，请稍后重试
          </p>
          <Button
            className="mt-4"
            onClick={async () => refetch()}
          >
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => window.location.href = "/admin/triggers/create"}>
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
        className="flex items-center gap-4"
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
            {filteredTriggers.length === 0
              ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center"
                  >
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? "未找到匹配的触发器" : "暂无触发器数据"}
                    </p>
                  </motion.div>
                )
              : (
                  filteredTriggers.map((trigger, index) => (
                    <AnimatedTableRow
                      key={trigger.id}
                      index={index}
                      className="p-4"
                    >
                      <AnimatedTableCell className="col-span-3">
                        <div>
                          <div className="font-medium">{trigger.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {trigger.description || "无描述"}
                          </div>
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
                            onCheckedChange={async () => handleToggleTrigger(trigger.id)}
                            disabled={toggleTriggerMutation.isPending}
                          />
                        </motion.div>
                      </AnimatedTableCell>

                      <AnimatedTableCell className="col-span-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(trigger.updatedAt).toLocaleDateString()}
                        </div>
                      </AnimatedTableCell>

                      <AnimatedTableCell className="col-span-2">
                        <div className="flex items-center gap-2">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => handleExecuteTrigger(trigger.id)}
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
                              onClick={async () => handleDeleteTrigger(trigger.id)}
                              className="text-destructive hover:text-destructive"
                              disabled={deleteTriggerMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </AnimatedTableCell>
                    </AnimatedTableRow>
                  ))
                )}
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
        <div className="flex items-center gap-2">
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