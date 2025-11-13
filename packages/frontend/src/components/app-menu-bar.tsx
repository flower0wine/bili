"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "@/components/ui/menubar";
import {
  Folder,
  FolderPlus,
  FileText,
  Users,
  UserCheck,
  Settings,
  Bell,
  Calendar,
  CheckCircle,
  Upload,
} from "lucide-react";

export default function AppMenuBar() {
  return (
    <Menubar className="bg-white border-b border-slate-200 shadow-sm rounded-b-lg">
      <MenubarMenu>
        <MenubarTrigger>
          <Folder className="mr-2 h-4 w-4" />
          项目
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <FolderPlus className="mr-2 h-4 w-4" />
            新建项目
          </MenubarItem>
          <MenubarItem>
            <Upload className="mr-2 h-4 w-4" />
            导入项目
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>
          <FileText className="mr-2 h-4 w-4" />
          文件
        </MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>新建</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>文件</MenubarItem>
              <MenubarItem>文件夹</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>保存</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>
          <Users className="mr-2 h-4 w-4" />
          用户
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <UserCheck className="mr-2 h-4 w-4" />
            用户管理
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>
          <Calendar className="mr-2 h-4 w-4" />
          任务
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <CheckCircle className="mr-2 h-4 w-4" />
            任务列表
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>
          <Settings className="mr-2 h-4 w-4" />
          设置
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>偏好设置</MenubarItem>
          <MenubarItem>系统设置</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>
          <Bell className="mr-2 h-4 w-4" />
          通知
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>查看通知</MenubarItem>
          <MenubarItem>通知设置</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}