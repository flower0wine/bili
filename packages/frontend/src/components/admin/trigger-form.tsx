"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { AnimatedCard } from "@/components/admin/animations";
import { FormDialogSuspense } from "@/components/admin/suspense";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// 模拟任务列表
const mockTasks = [
  { id: "user-space-sync", name: "用户空间同步" },
  { id: "user-card-update", name: "用户卡片更新" },
  { id: "data-backup", name: "数据备份" },
  { id: "log-cleanup", name: "日志清理" },
  { id: "system-monitor", name: "系统监控" },
];

interface TriggerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: {
    id: number;
    name: string;
    taskName: string;
    cron: string;
    enabled: boolean;
    description: string;
  };
  onSave: (data: any) => void;
}

export function TriggerForm({ open, onOpenChange, trigger, onSave }: TriggerFormProps) {
  const [formData, setFormData] = useState({
    name: trigger?.name || "",
    taskName: trigger?.taskName || "",
    cron: trigger?.cron || "0 0 * * * *",
    enabled: trigger?.enabled ?? true,
    description: trigger?.description || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSave({
      ...formData,
      id: trigger?.id || Date.now(),
      createdAt: trigger?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setIsLoading(false);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!open)
    return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {trigger ? "编辑触发器" : "创建触发器"}
            </DialogTitle>
          </motion.div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-4 flex flex-col gap-6">
          {/* 触发器名称 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col gap-2"
          >
            <Label htmlFor="name">触发器名称</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              placeholder="请输入触发器名称"
              required
            />
          </motion.div>

          {/* 任务名称 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col gap-2"
          >
            <Label htmlFor="taskName">关联任务</Label>
            <Select
              value={formData.taskName}
              onValueChange={value => handleInputChange("taskName", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择要执行的任务" />
              </SelectTrigger>
              <SelectContent>
                {mockTasks.map(task => (
                  <SelectItem key={task.id} value={task.name}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Cron 表达式 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex flex-col gap-2"
          >
            <Label htmlFor="cron">Cron 表达式</Label>
            <div className="flex items-center gap-2">
              <Input
                id="cron"
                value={formData.cron}
                onChange={e => handleInputChange("cron", e.target.value)}
                placeholder="0 0 * * * *"
                required
              />
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              格式：分 时 日 月 星期 (例如：0 0 * * * * = 每天午夜执行)
            </p>
          </motion.div>

          {/* 描述 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex flex-col gap-2"
          >
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => handleInputChange("description", e.target.value)}
              placeholder="请输入触发器描述"
              rows={3}
            />
          </motion.div>

          {/* 启用状态 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="flex items-center gap-2"
          >
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={checked => handleInputChange("enabled", checked)}
            />
            <Label htmlFor="enabled">启用触发器</Label>
          </motion.div>

          {/* 按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="flex justify-end pt-4 gap-2"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading
                ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Save className="h-4 w-4" />
                    </motion.div>
                  )
                : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      保存
                    </>
                  )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 创建触发器页面组件
export function CreateTriggerPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSaveTrigger = (triggerData: any) => {
    console.log("保存触发器:", triggerData);
    // 这里可以调用 API 保存触发器
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">创建触发器</h1>
          <p className="text-muted-foreground">
            创建新的定时任务触发器
          </p>
        </div>
      </motion.div>

      {/* 快速开始卡片 */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
        {[
          {
            title: "基本触发器",
            description: "创建基于 Cron 表达式的基本定时触发器",
            cron: "0 0 * * * *",
            color: "bg-blue-500"
          },
          {
            title: "高频触发器",
            description: "每分钟或每小时执行的高频触发器",
            cron: "*/5 * * * *",
            color: "bg-green-500"
          },
          {
            title: "每日触发器",
            description: "每天特定时间执行的触发器",
            cron: "0 9 * * *",
            color: "bg-purple-500"
          }
        ].map((template, index) => (
          <AnimatedCard
            key={template.title}
            delay={index * 0.1}
            className="cursor-pointer p-6 transition-shadow hover:shadow-lg"
            onClick={() => setIsFormOpen(true)}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`h-3 w-3 rounded-full ${template.color}`} />
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold">{template.title}</h3>
            <p className="mb-3 text-sm text-muted-foreground">{template.description}</p>
            <code className="rounded bg-muted px-2 py-1 text-xs">
              {template.cron}
            </code>
          </AnimatedCard>
        ))}
      </div>

      {/* 自定义触发器按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="text-center"
      >
        <Button
          size="lg"
          onClick={() => setIsFormOpen(true)}
          className="min-w-[200px]"
        >
          <Clock className="mr-2 h-5 w-5" />
          创建自定义触发器
        </Button>
      </motion.div>

      {/* 触发器表单对话框 */}
      <TriggerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveTrigger}
      />
    </div>
  );
}