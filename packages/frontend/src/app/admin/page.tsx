export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">欢迎来到后台管理系统</h2>
        <p className="text-muted-foreground mt-2">
          这是后台管理系统的首页，您可以在左侧菜单中选择相应的功能模块。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">总用户数</h3>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">暂无数据</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">活跃用户</h3>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">暂无数据</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">系统状态</h3>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">正常</div>
            <p className="text-xs text-muted-foreground">运行中</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">API 调用</h3>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">今日</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">快速开始</h3>
        <p className="text-sm text-muted-foreground mt-2">
          选择下面的选项开始管理系统
        </p>
        <div className="space-y-2 text-sm mt-4">
          <p>• 在左侧菜单中选择"用户管理"来管理系统用户</p>
          <p>• 在左侧菜单中选择"设置"来配置系统参数</p>
          <p>• 使用顶部的菜单栏快速导航</p>
        </div>
      </div>
    </div>
  );
}
